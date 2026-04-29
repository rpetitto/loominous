/**
 * Loominous content script.
 * Runs on loom.com/share/* and loom.com/embed/* pages.
 */

// ── Video seeking (used by background.js for frame capture) ───────────────────

function findVideoElement() {
  // Try multiple selectors — Loom's player structure may vary
  return (
    document.querySelector('video') ||
    document.querySelector('[data-testid="video-player"] video') ||
    document.querySelector('.vidalytics-player video') ||
    null
  );
}

async function seekAndWait(timestamp) {
  const video = findVideoElement();
  if (!video) throw new Error('No video element found on page');

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Seek timeout')), 6000);

    function onSeeked() {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      // Small extra delay for frame to fully render
      setTimeout(resolve, 200);
    }

    video.addEventListener('seeked', onSeeked);

    // Pause first, then seek
    video.pause();
    video.currentTime = timestamp;

    // If already at that time, seeked may not fire
    if (Math.abs(video.currentTime - timestamp) < 0.1) {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      setTimeout(resolve, 200);
    }
  });
}

// ── Transcript extraction (share pages only) ─────────────────────────────────

function extractVideoId() {
  const match = location.href.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function extractTitle() {
  return (
    document.querySelector('h1[data-testid="video-title"]')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.title.replace(' | Loom', '').trim() ||
    ''
  );
}

function extractTranscript() {
  const selectors = [
    '[data-testid="transcript-item"]',
    '.transcript-item',
    '[class*="TranscriptItem"]',
    '[class*="transcript-item"]',
    '[class*="transcriptItem"]',
    '[aria-label*="transcript"] p',
  ];
  for (const sel of selectors) {
    const items = document.querySelectorAll(sel);
    if (items.length > 0) {
      return Array.from(items)
        .map(el => {
          const ts = el.querySelector('[class*="timestamp"], [class*="time"], time')?.textContent?.trim();
          const text = el.querySelector('[class*="text"], p, span:last-child')?.textContent?.trim()
            || el.textContent?.trim();
          return ts ? `[${ts}] ${text}` : text;
        })
        .filter(Boolean)
        .join('\n');
    }
  }
  return '';
}

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SEEK_VIDEO') {
    seekAndWait(msg.timestamp)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (msg.type === 'GET_LOOM_DATA') {
    sendResponse({
      ok: true,
      data: {
        videoId: extractVideoId(),
        title: extractTitle(),
        transcript: extractTranscript(),
        url: location.href,
      },
    });
    return false;
  }

  return false;
});

// Store current video info immediately for popup
const immediateData = { videoId: extractVideoId(), title: extractTitle(), url: location.href };
chrome.storage.session.set({ loomCurrentVideo: immediateData });
