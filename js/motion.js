// No animation library, WebGL renderer, or continuously running JavaScript loop.
// Scroll work is coalesced into one requested frame and limited to visible scenes.
export function initMotion({ onCompilerProgress, onScrollMode }) {
  if (!('IntersectionObserver' in window) || !('requestAnimationFrame' in window)) return;
  const root = document.documentElement;
  const storyQuery = matchMedia('(min-width: 1000px) and (min-height: 760px)');
  const mobileQuery = matchMedia('(max-width: 760px)');
  const motionButton = document.querySelector('#motion-toggle');
  const hero = document.querySelector('.hero');
  const artifact = document.querySelector('.artifact-parallax');
  const welcome = document.querySelector('.welcome-composition');
  const compilerScene = document.querySelector('.compiler-scroll-scene');
  const compilerSticky = document.querySelector('.compiler-sticky');
  const progressBar = document.querySelector('.compiler-progress > span');
  const roots = document.querySelector('.roots-banner');
  const signature = document.querySelector('.roots-signature');
  let manuallyPaused = false;
  // The site owner's explicit preference: start animated on every visit.
  // Manual pause is visit-local; old stored preferences and OS reduction do not
  // change this default. Offscreen/background suspension still saves work.
  let frame = 0;
  let enabled = false;
  let storyEnabled = false;
  const visibleScenes = new Set();
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  artifact.addEventListener('animationend', event => {
    if (event.animationName === 'object-in') root.classList.add('intro-complete');
  });

  function paintScroll() {
    frame = 0;
    if (!enabled) return;
    const mobile = mobileQuery.matches;
    if (visibleScenes.has(hero)) {
      const bounds = hero.getBoundingClientRect();
      const progress = clamp(-bounds.top / Math.max(bounds.height, 1));
      artifact.style.transform = `translate3d(0, ${progress * (mobile ? 12 : 55)}px, 0) rotate(${progress * (mobile ? 1 : 4)}deg) scale(${1 + progress * .035})`;
      welcome.style.transform = `translate3d(0, ${-progress * (mobile ? 8 : 28)}px, 0)`;
      hero.style.setProperty('--layer-spread', `${progress * (mobile ? 8 : 22)}px`);
    }
    if (visibleScenes.has(compilerScene) && storyEnabled) {
      const bounds = compilerScene.getBoundingClientRect();
      const stickyHeight = compilerSticky.getBoundingClientRect().height;
      const stickyTop = parseFloat(getComputedStyle(compilerSticky).top) || 100;
      const distance = Math.max(bounds.height - stickyHeight, 1);
      const progress = clamp((stickyTop - bounds.top) / distance);
      progressBar.style.transform = `scaleX(${progress})`;
      onCompilerProgress(progress);
    }
    if (visibleScenes.has(roots)) {
      const bounds = roots.getBoundingClientRect();
      const progress = clamp((innerHeight - bounds.top) / (innerHeight + bounds.height));
      signature.style.transform = `translateY(${(progress - .5) * (mobile ? 12 : 38)}px) rotate(${(progress - .5) * -6}deg)`;
    }
  }
  function schedulePaint() {
    if (enabled && visibleScenes.size && !frame) frame = requestAnimationFrame(paintScroll);
  }
  function updateMotion() {
    if (manuallyPaused || document.hidden) root.classList.add('intro-complete');
    enabled = !manuallyPaused && !document.hidden;
    storyEnabled = storyQuery.matches && !root.classList.contains('project-browser-enabled');
    root.classList.add('motion-enabled', 'motion-forced');
    root.classList.toggle('motion-paused', !enabled);
    root.classList.toggle('scroll-story', storyEnabled);
    motionButton.hidden = false;
    motionButton.disabled = false;
    motionButton.setAttribute('aria-pressed', String(manuallyPaused));
    const label = manuallyPaused ? 'Resume animations' : 'Pause animations';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.innerHTML = `<span aria-hidden="true">${manuallyPaused ? '▷' : 'Ⅱ'}</span><span>${manuallyPaused ? 'Motion paused' : 'Motion on'}</span>`;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onScrollMode(storyEnabled && !manuallyPaused);
    document.dispatchEvent(new Event('motion-statechange'));
    schedulePaint();
  }
  motionButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    updateMotion();
  });
  storyQuery.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  document.addEventListener('compiler-follow', schedulePaint);
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('resize', schedulePaint, { passive: true });

  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) visibleScenes.add(entry.target); else visibleScenes.delete(entry.target); });
    schedulePaint();
  });
  [hero, compilerScene, roots].forEach(element => sceneObserver.observe(element));

  const ambientObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('ambient-visible', entry.isIntersecting));
    document.dispatchEvent(new Event('motion-statechange'));
  });
  document.querySelectorAll('[data-ambient]').forEach(element => ambientObserver.observe(element));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!manuallyPaused) entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll('.line-reveal, .workbench-item, .skill-row').forEach(element => revealObserver.observe(element));
  updateMotion();
}
