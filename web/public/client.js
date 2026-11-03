document.addEventListener('DOMContentLoaded', () => {
  const demoUrlInput = document.getElementById('demo-url-input');
  const demoGoBtn = document.getElementById('demo-go-btn');
  const demoFrame = document.getElementById('demo-frame');
  const sampleTags = document.querySelectorAll('.sample-tag');

  function loadDemoUrl(url) {
    let target = url.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    demoUrlInput.value = target;
    demoFrame.src = `/api/proxy?url=${encodeURIComponent(target)}`;
  }

  demoGoBtn.addEventListener('click', () => {
    loadDemoUrl(demoUrlInput.value);
  });

  demoUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loadDemoUrl(demoUrlInput.value);
    }
  });

  sampleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const url = tag.getAttribute('data-url');
      loadDemoUrl(url);
    });
  });
});
