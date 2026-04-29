const APP_URL = 'http://localhost:3000';

function show(id) {
  document.querySelectorAll('.state').forEach(el => (el.style.display = 'none'));
  document.getElementById(id).style.display = 'flex';
}

function setTranscriptBadge(state) {
  const badge = document.getElementById('transcript-badge');
  badge.className = `transcript-badge ${state}`;
  badge.textContent = state === 'found' ? '✓ Found' : state === 'missing' ? 'Not found' : 'Extracting…';
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function init() {
  show('loading');
  const tab = await getCurrentTab();

  if (!tab?.url?.match(/loom\.com\/share\//)) {
    show('not-loom');
    document.getElementById('open-app-btn').onclick = () => {
      chrome.tabs.create({ url: APP_URL });
      window.close();
    };
    return;
  }

  show('on-loom');

  // Fill basic info from URL
  document.getElementById('video-url').textContent = tab.url;

  // Try to get data from content script
  try {
    const resp = await chrome.tabs.sendMessage(tab.id, { type: 'GET_LOOM_DATA' });
    if (resp?.ok) {
      const { data } = resp;
      if (data.title) document.getElementById('video-title').textContent = data.title;

      if (data.transcript) {
        document.getElementById('transcript-area').value = data.transcript;
        setTranscriptBadge('found');
      } else {
        setTranscriptBadge('missing');
      }

      // Try to show thumbnail
      if (data.videoId) {
        const thumb = document.createElement('img');
        thumb.src = `https://cdn.loom.com/sessions/thumbnails/${data.videoId}-00001.gif`;
        thumb.onerror = () => {};
        document.getElementById('video-thumb').appendChild(thumb);
      }
    }
  } catch {
    // Content script not loaded yet, fallback
    document.getElementById('video-title').textContent = tab.title?.replace(' | Loom', '') || 'Loom Video';
    setTranscriptBadge('missing');
  }

  // Generate button
  document.getElementById('generate-btn').onclick = () => {
    const transcript = document.getElementById('transcript-area').value;
    const params = new URLSearchParams({ url: tab.url });
    if (transcript.trim()) params.set('transcript', transcript.trim());
    chrome.tabs.create({ url: `${APP_URL}?${params.toString()}` });
    window.close();
  };

  // Copy transcript button
  document.getElementById('copy-transcript-btn').onclick = async () => {
    const transcript = document.getElementById('transcript-area').value;
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    const btn = document.getElementById('copy-transcript-btn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => (btn.textContent = 'Copy Transcript'), 2000);
  };
}

init();
