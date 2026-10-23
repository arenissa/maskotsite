export function initStoryVideo() {
  const video = document.getElementById('storyVideoPlayer');
  const toggle = document.getElementById('storyVideoToggle');
  if (!video || !toggle) return;
  let paused = true;

  const sync = () => {
    toggle.classList.toggle('is-playing', !paused);
    toggle.setAttribute('aria-label', paused
      ? 'Смотреть видео со звуком: история Квадратного напарника'
      : 'Пауза: история Квадратного напарника');
  };
  const play = () => {
    // видео со звуком: браузер может блокировать автозапуск — тогда остаётся кнопка ▶
    video.volume = 1;
    video.play().then(() => { paused = false; sync(); }).catch(() => { paused = true; sync(); });
  };
  const pause = () => { video.pause(); paused = true; sync(); };

  toggle.addEventListener('click', () => (paused ? play() : pause()));
  video.addEventListener('click', () => (paused ? play() : pause()));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.intersectionRatio > 0.35) play();
        else if (e.intersectionRatio < 0.2) pause();
      }
    }, { threshold: [0, 0.2, 0.35, 0.6] });
    io.observe(video);
  }
  sync();
}