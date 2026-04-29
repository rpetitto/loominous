/**
 * Loominous background service worker.
 */

const APP_URL = 'http://localhost:3000';

chrome.action.onClicked.addListener((tab) => {
  // Only activate on Loom pages; otherwise open the app
  if (!tab.url?.includes('loom.com/share')) {
    chrome.tabs.create({ url: APP_URL });
  }
});

// Handle open-app messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'OPEN_APP') {
    const params = new URLSearchParams({ url: msg.videoUrl });
    chrome.tabs.create({ url: `${APP_URL}?${params.toString()}` });
    sendResponse({ ok: true });
  }
  return true;
});
