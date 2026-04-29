// Injected on loominous.flingit.run and localhost:3000
// Signals extension presence and bridges postMessage ↔ chrome.runtime

window.postMessage({ __loominous: true, type: 'EXTENSION_READY' }, '*');

window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data?.__loominous) return;
  if (event.data.type !== 'CAPTURE_FRAMES') return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_FRAMES',
      videoId: event.data.videoId,
      timestamps: event.data.timestamps,
    });
    window.postMessage({
      __loominous: true,
      type: 'FRAMES_READY',
      ok: response?.ok ?? false,
      frames: response?.frames ?? {},
      error: response?.error,
    }, '*');
  } catch (err) {
    window.postMessage({
      __loominous: true,
      type: 'FRAMES_READY',
      ok: false,
      frames: {},
      error: err.message,
    }, '*');
  }
});
