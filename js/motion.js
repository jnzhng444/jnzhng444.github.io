// No external animation library, WebGL renderer, or continuously running JavaScript loop.
// Scroll work is coalesced into one requested frame and limited to visible scenes.

const SCRAMBLE_GLYPHS = '01#%*+<>_~/[]ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function scramble(targetElement, targetText, duration = 280) {
  const root = document.documentElement;
  if (!root.classList.contains('motion-enabled') || root.classList.contains('motion-paused')) {
    targetElement.textContent = targetText;
    return;
  }
  if (targetElement._scrambleFrame) cancelAnimationFrame(targetElement._scrambleFrame);
  const length = targetText.length;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    const settled = Math.floor(progress * length);
    let output = '';
    for (let i = 0; i < length; i++) {
      if (targetText[i] === ' ' || targetText[i] === '\n') {
        output += targetText[i];
      } else if (i < settled) {
        output += targetText[i];
      } else {
        output += SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
      }
    }
    targetElement.textContent = output;
    if (progress < 1) {
      targetElement._scrambleFrame = requestAnimationFrame(step);
    } else {
      targetElement.textContent = targetText;
      delete targetElement._scrambleFrame;
    }
  }
  targetElement._scrambleFrame = requestAnimationFrame(step);
}

export function initMotion({ onCompilerProgress, onScrollMode }) {
  if (!('IntersectionObserver' in window) || !('requestAnimationFrame' in window)) return;
  const root = document.documentElement;
  const storyQuery = matchMedia('(min-width: 1000px) and (min-height: 760px)');
  const mobileQuery = matchMedia('(max-width: 760px)');
  const motionButton = document.querySelector('#motion-toggle');
  const hero = document.querySelector('.hero');
  const artifact = document.querySelector('.artifact-parallax');
  const chipTilt = document.querySelector('.chip-tilt');
  const welcome = document.querySelector('.welcome-composition');
  const compilerScene = document.querySelector('.compiler-scroll-scene');
  const compilerSticky = document.querySelector('.compiler-sticky');
  const progressBar = document.querySelector('.compiler-progress > span');
  const roots = document.querySelector('.roots-banner');
  const signature = document.querySelector('.roots-signature');
  const garageDemo = document.querySelector('.garage-demo');
  const rpmEl = document.querySelector('.rpm-value');
  const throttleEl = document.querySelector('.throttle-value');
  const throttleBar = document.querySelector('.throttle-bar > span');
  const gearEl = document.querySelector('.gear-value');

  let manuallyPaused = false;
  // The site owner's explicit preference: start animated on every visit.
  // Manual pause is visit-local; old stored preferences and OS reduction do not
  // change this default. Offscreen/background suspension still saves work.
  let frame = 0;
  let enabled = false;
  let storyEnabled = false;
  let introProgress = 0;
  let introActive = true;
  let pendingIntroDelta = 0;
  let introFrame = 0;
  let touchStartY = 0;
  const visibleScenes = new Set();
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  window._scrambleText = scramble;
  welcome.classList.add('intro-overlay');

  function paintIntro() {
    const welcomeScale = 1.0 - introProgress * 0.7;
    welcome.style.transform = `scale(${welcomeScale})`;
    welcome.style.opacity = '1';
    welcome.style.pointerEvents = introActive ? 'auto' : 'none';
  }

  function settleIntro() {
    const overlayRect = welcome.getBoundingClientRect();
    welcome.classList.add('intro-settling');
    document.documentElement.classList.add('intro-settling');
    welcome.classList.remove('intro-overlay');
    const naturalRect = welcome.getBoundingClientRect();
    welcome.classList.add('intro-overlay');
    const scaleX = overlayRect.width / Math.max(naturalRect.width, 1);
    const scaleY = overlayRect.height / Math.max(naturalRect.height, 1);
    const offsetX = overlayRect.left + overlayRect.width / 2 - (naturalRect.left + naturalRect.width / 2);
    const offsetY = overlayRect.top + overlayRect.height / 2 - (naturalRect.top + naturalRect.height / 2);
    welcome.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scaleX}, ${scaleY})`;
    void welcome.offsetWidth;
    requestAnimationFrame(() => {
      welcome.classList.remove('intro-overlay');
      welcome.style.transform = 'none';
      welcome.style.pointerEvents = 'none';
    });
    welcome.addEventListener('transitionend', () => {
      welcome.classList.remove('intro-settling');
      document.documentElement.classList.remove('intro-active', 'intro-settling');
      welcome.style.removeProperty('transform');
      welcome.style.removeProperty('opacity');
      welcome.style.removeProperty('pointer-events');
    }, { once: true });
  }

  function advanceIntro(amount) {
    if (!introActive || !enabled) return false;
    introProgress = clamp(introProgress + amount);
    if (introProgress >= 1) {
      introActive = false;
      settleIntro();
    } else {
      paintIntro();
    }
    return true;
  }

  window.addEventListener('wheel', event => {
    if (!introActive || !enabled) return;
    event.preventDefault();
    pendingIntroDelta += event.deltaY / Math.max(innerHeight * 0.8, 1);
    if (!introFrame) {
      introFrame = requestAnimationFrame(() => {
        introFrame = 0;
        const delta = pendingIntroDelta;
        pendingIntroDelta = 0;
        advanceIntro(delta);
      });
    }
  }, { passive: false });

  window.addEventListener('touchstart', event => {
    if (!introActive || !enabled) return;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', event => {
    if (!introActive || !enabled) return;
    const currentY = event.touches[0].clientY;
    const deltaY = touchStartY - currentY;
    if (Math.abs(deltaY) < 1) return;
    event.preventDefault();
    touchStartY = currentY;
    advanceIntro(deltaY / Math.max(innerHeight * 0.9, 1));
  }, { passive: false });

  window.addEventListener('keydown', event => {
    if (!introActive || !enabled) return;
    const forwardKeys = ['ArrowDown', 'PageDown', ' ', 'Enter'];
    const backwardKeys = ['ArrowUp', 'PageUp'];
    if (forwardKeys.includes(event.key)) {
      event.preventDefault();
      advanceIntro(event.key === ' ' || event.key === 'PageDown' ? 0.5 : 0.2);
    } else if (backwardKeys.includes(event.key)) {
      event.preventDefault();
      advanceIntro(-0.2);
    }
  });

  artifact.addEventListener('animationend', event => {
    if (event.animationName === 'object-in') root.classList.add('intro-complete');
  });

  // 3D Parallax & Tilt physics for the hero chip
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let tiltRunning = false;

  function paintTilt() {
    if (!enabled || mobileQuery.matches || !chipTilt) {
      if (chipTilt) chipTilt.style.transform = '';
      hero.style.removeProperty('--tilt-depth-x');
      hero.style.removeProperty('--tilt-depth-y');
      tiltRunning = false;
      return;
    }

    currentTiltX += (targetTiltX - currentTiltX) * 0.12;
    currentTiltY += (targetTiltY - currentTiltY) * 0.12;

    chipTilt.style.transform = `perspective(850px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
    hero.style.setProperty('--tilt-depth-x', `${(currentTiltY * 0.45).toFixed(1)}px`);
    hero.style.setProperty('--tilt-depth-y', `${(-currentTiltX * 0.45).toFixed(1)}px`);

    if (Math.abs(targetTiltX - currentTiltX) > 0.04 || Math.abs(targetTiltY - currentTiltY) > 0.04) {
      requestAnimationFrame(paintTilt);
    } else {
      tiltRunning = false;
    }
  }

  function scheduleTilt() {
    if (!tiltRunning && enabled && !mobileQuery.matches) {
      tiltRunning = true;
      requestAnimationFrame(paintTilt);
    }
  }

  hero.addEventListener('pointermove', event => {
    if (!enabled || mobileQuery.matches) return;
    const bounds = hero.getBoundingClientRect();
    const nx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const ny = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    targetTiltX = -ny * 13;
    targetTiltY = nx * 17;
    scheduleTilt();
  });

  hero.addEventListener('pointerleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
    scheduleTilt();
  });

  // F1 Garage dynamic telemetry simulation
  let telemetryTimer = 0;
  let telemetryTick = 0;

  function updateTelemetry() {
    clearTimeout(telemetryTimer);
    telemetryTimer = 0;
    if (!enabled || !garageDemo || !garageDemo.classList.contains('ambient-visible') || garageDemo.closest('[hidden]')) return;

    telemetryTick = (telemetryTick + 1) % 120;
    const progress = telemetryTick / 120;
    let rpm = 8420;
    let throttle = 76;
    let gear = '05';

    if (progress < 0.28) {
      const p = progress / 0.28;
      gear = p < 0.35 ? '05' : p < 0.7 ? '06' : '07';
      rpm = Math.floor(9200 + p * 2300 + Math.random() * 200);
      throttle = Math.min(100, Math.floor(90 + p * 10));
    } else if (progress < 0.48) {
      const p = (progress - 0.28) / 0.2;
      gear = p < 0.5 ? '04' : '03';
      rpm = Math.floor(10600 - p * 3400 + Math.random() * 150);
      throttle = Math.floor(20 + Math.random() * 15);
    } else if (progress < 0.78) {
      const p = (progress - 0.48) / 0.3;
      gear = p < 0.4 ? '03' : '04';
      rpm = Math.floor(7400 + p * 2900 + Math.random() * 220);
      throttle = Math.floor(45 + p * 42);
    } else {
      const p = (progress - 0.78) / 0.22;
      gear = p < 0.5 ? '05' : '06';
      rpm = Math.floor(8800 + p * 2000 + Math.random() * 180);
      throttle = Math.floor(82 + p * 16);
    }

    if (rpmEl) rpmEl.textContent = rpm.toLocaleString('en-US');
    if (throttleEl) throttleEl.textContent = String(throttle);
    if (throttleBar) throttleBar.style.width = `${throttle}%`;
    if (gearEl) gearEl.textContent = gear;

    telemetryTimer = setTimeout(updateTelemetry, 140);
  }

  // Hook kinetic scramble into interactive chrome
  document.querySelectorAll('#navigation a').forEach(link => {
    const textNode = link.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    const original = textNode.textContent;
    link.addEventListener('mouseenter', () => {
      if (enabled) scramble(textNode, original, 260);
    });
  });

  const brandEl = document.querySelector('.brand-name');
  if (brandEl) {
    const brandTextNode = brandEl.firstChild;
    if (brandTextNode && brandTextNode.nodeType === Node.TEXT_NODE) {
      const originalBrand = brandTextNode.textContent;
      brandEl.closest('.brand')?.addEventListener('mouseenter', () => {
        if (enabled) scramble(brandTextNode, originalBrand, 280);
      });
    }
  }

  const primaryBtn = document.querySelector('.hero-actions .button.primary');
  if (primaryBtn) {
    const btnTextNode = primaryBtn.firstChild;
    if (btnTextNode && btnTextNode.nodeType === Node.TEXT_NODE) {
      const originalBtnText = btnTextNode.textContent;
      primaryBtn.addEventListener('mouseenter', () => {
        if (enabled) scramble(btnTextNode, originalBtnText, 250);
      });
    }
  }

  document.querySelectorAll('.project-tabs button').forEach(button => {
    const label = button.querySelector('span:last-child');
    if (!label) return;
    const originalText = label.textContent;
    button.addEventListener('mouseenter', () => {
      if (enabled) scramble(label, originalText, 240);
    });
  });

  function paintScroll() {
    frame = 0;
    if (!enabled) return;
    const mobile = mobileQuery.matches;
    if (introActive) paintIntro();
    if (visibleScenes.has(hero)) {
      const bounds = hero.getBoundingClientRect();
      const progress = clamp(-bounds.top / Math.max(bounds.height, 1));
      artifact.style.transform = `translate3d(0, ${progress * (mobile ? 12 : 55)}px, 0) rotate(${progress * (mobile ? 1 : 4)}deg) scale(${1 + progress * .035})`;
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
    welcome.classList.toggle('intro-overlay', enabled && introActive);
    if (!enabled) {
      welcome.style.removeProperty('transform');
      welcome.style.removeProperty('opacity');
      welcome.style.removeProperty('pointer-events');
    } else {
      paintIntro();
    }
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
    scheduleTilt();
    updateTelemetry();
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
