const APP_ORIGINS = ['https://loominous.flingit.run'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    function listener(updatedTabId, info) {
      if (updatedTabId === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
    // Also check if already loaded
    chrome.tabs.get(tabId, (tab) => {
      if (tab.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

// ── Frame capture ──────────────────────────────────────────────────────────────

async function captureFrames(videoId, timestamps) {
  const embedUrl = `https://www.loom.com/embed/${videoId}?hideEmbedTopBar=true&autoplay=false`;

  // Open a popup window — non-focused so it doesn't interrupt the user
  const win = await chrome.windows.create({
    url: embedUrl,
    type: 'popup',
    width: 1280,
    height: 720,
    focused: false,
  });

  const tabId = win.tabs[0].id;
  const windowId = win.id;

  try {
    // Wait for the page to fully load
    await waitForTabLoad(tabId);
    // Extra time for the video player to initialise
    await sleep(3500);

    const frames = {};

    for (const ts of timestamps) {
      try {
        // Tell content script to seek to this timestamp
        await chrome.tabs.sendMessage(tabId, { type: 'SEEK_VIDEO', timestamp: Number(ts) });
        // Wait for seek + frame render
        await sleep(900);

        // Capture the visible content of the popup tab
        const dataUrl = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 88 }, (result) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve(result);
          });
        });

        frames[ts] = dataUrl;
      } catch (err) {
        console.warn(`[Loominous] Failed to capture frame at ${ts}s:`, err.message);
      }
    }

    return frames;
  } finally {
    // Always clean up the popup
    try { await chrome.windows.remove(windowId); } catch (_) {}
  }
}

// ── Message handlers ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'CAPTURE_FRAMES') {
    captureFrames(msg.videoId, msg.timestamps)
      .then(frames => sendResponse({ ok: true, frames }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true; // keep channel open for async
  }

  if (msg.type === 'OPEN_APP') {
    const params = new URLSearchParams({ url: msg.videoUrl });
    chrome.tabs.create({ url: `https://loominous.flingit.run?${params}` });
    sendResponse({ ok: true });
  }

  return false;
});
