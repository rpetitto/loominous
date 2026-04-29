/**
 * Loominous content script — runs on loom.com/share/* pages.
 * Extracts video metadata and transcript from the DOM.
 */

function extractVideoId() {
  const match = location.href.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
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
  // Try multiple known Loom transcript selectors (UI may vary)
  const selectors = [
    '[data-testid="transcript-item"]',
    '.transcript-item',
    '[class*="TranscriptItem"]',
    '[class*="transcript-item"]',
    '[class*="transcriptItem"]',
    '[aria-label*="transcript"] p',
    '.loom-transcript p',
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

  // Fallback: look for any time-coded text blocks
  const timePattern = /\[\d+:\d+\]/;
  const allText = document.body.innerText;
  if (timePattern.test(allText)) {
    const lines = allText.split('\n').filter(l => timePattern.test(l));
    if (lines.length > 3) return lines.join('\n');
  }

  return '';
}

function extractDuration() {
  const el = document.querySelector('[class*="duration"], [data-testid="duration"], time');
  return el?.textContent?.trim() || '';
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_LOOM_DATA') {
    const data = {
      videoId: extractVideoId(),
      title: extractTitle(),
      transcript: extractTranscript(),
      duration: extractDuration(),
      url: location.href,
    };
    sendResponse({ ok: true, data });
  }
  return true; // keep channel open for async
});

// Also store data immediately so popup can read without messaging
const immediateData = {
  videoId: extractVideoId(),
  title: extractTitle(),
  url: location.href,
};
chrome.storage.session.set({ loomCurrentVideo: immediateData });
