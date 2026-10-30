import { featuredMarkup, skillsMarkup } from './render.js';
import { compilerStages } from './compiler.js';
import { scheduleView } from './scheduler-view.js';
import { featuredProjects } from './data.js';
import { executionView } from './raytracing.js';

const $ = (selector, root = document) => root.querySelector(selector);

if (window.location.hash) {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  let homeFrames = 0;
  const forceHome = () => {
    window.scrollTo(0, 0);
    if (homeFrames++ < 60) window.requestAnimationFrame(forceHome);
  };
  forceHome();
}

// Static HTML is already complete. Local data also refreshes it at runtime.
$('#featured-projects').innerHTML = featuredMarkup();
$('#skills-list').innerHTML = skillsMarkup();

document.querySelectorAll('[data-execution]').forEach(button => {
  button.disabled = false;
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-execution]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    $('#execution-view').innerHTML = executionView(button.dataset.execution);
  });
});

const blockLabels = [
  ['let unused = 9;', 'input', 'signal = input + 1', 'emit(signal)'],
  ['Let(unused, 9)', 'Identifier(input)', 'Add(input, 1)', 'Call(emit, signal)'],
  ['unused : int', 'input : int', 'signal : int', 'emit : (int) → void'],
  ['unused ← const 9', 'input [external]', 't0 ← add input, 1', 'call emit, t0'],
  ['unused · removed', 'input [external]', 't0 ← add input, 1', 'call emit, t0'],
  ['unused · removed', 'LOAD r1, [input]', 'ADDI r2, r1, 1', 'OUT r2 / HALT'],
];
let followScroll = true;
let currentStage = -1;
function showCompilerStage(index, announce = false) {
  if (currentStage === index) return;
  currentStage = index;
  const stage = compilerStages[index];
  $('.compiler-output').setAttribute('aria-live', announce ? 'polite' : 'off');
  $('.compiler-demo').dataset.stage = String(index);
  document.querySelectorAll('button[data-stage]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.stage) === index)));
  $('.stage-number').textContent = String(index + 1).padStart(2, '0');
  for (const field of ['file', 'code', 'title', 'description', 'note']) {
    $('#compiler-' + (field === 'title' ? 'stage-title' : field)).textContent = stage[field];
  }
  ['unused', 'input', 'add', 'emit'].forEach((name, position) => {
    $('.block-' + name + ' code').textContent = blockLabels[index][position];
  });
}
document.querySelectorAll('button[data-stage]').forEach(button => {
  button.disabled = false;
  button.addEventListener('click', () => {
    stopCompilerPlayback();
    followScroll = false;
    $('#compiler-mode').textContent = 'EXPLORING / MANUAL';
    showCompilerStage(Number(button.dataset.stage), true);
  });
});
$('.follow-scroll').addEventListener('click', () => {
  followScroll = true;
  $('#compiler-mode').textContent = 'SCROLL OR SELECT A STAGE';
  document.dispatchEvent(new Event('compiler-follow'));
});
showCompilerStage(0);

// A single timeout advances the explanation only while it is visible and motion
// is enabled. Manual stage selection stops playback without losing the stage.
const compilerDemo = $('.compiler-demo');
const compilerPlay = $('.compiler-play');
let compilerPlaying = true;
let compilerTimer = 0;
function updateCompilerPlayback() {
  clearTimeout(compilerTimer);
  compilerTimer = 0;
  const root = document.documentElement;
  const available = root.classList.contains('motion-enabled');
  compilerPlay.hidden = !available;
  compilerPlay.textContent = compilerPlaying ? 'Pause stages Ⅱ' : 'Play stages ▷';
  compilerPlay.setAttribute('aria-pressed', String(compilerPlaying));
  const running = available && compilerPlaying && !root.classList.contains('motion-paused') && !document.hidden && compilerDemo.classList.contains('ambient-visible') && !compilerDemo.closest('[hidden]');
  if (!followScroll) $('#compiler-mode').textContent = running ? 'PLAYING / ILLUSTRATIVE SEQUENCE' : 'SELECT A STAGE';
  if (running) compilerTimer = setTimeout(() => {
    showCompilerStage((currentStage + 1) % compilerStages.length);
    updateCompilerPlayback();
  }, 3400);
}
function stopCompilerPlayback() { compilerPlaying = false; updateCompilerPlayback(); }
compilerPlay.addEventListener('click', () => { compilerPlaying = !compilerPlaying; updateCompilerPlayback(); });
document.addEventListener('motion-statechange', updateCompilerPlayback);
document.addEventListener('visibilitychange', updateCompilerPlayback);
followScroll = false;

function showSchedule(algorithm) {
  const view = scheduleView(algorithm);
  document.querySelectorAll('[data-algorithm]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.algorithm === algorithm)));
  $('#timeline').innerHTML = view.svg;
  $('#scheduler-status').textContent = view.status;
  $('#scheduler-explanation').textContent = view.explanation;
  $('#schedule-caption').textContent = view.caption;
  $('#schedule-body').innerHTML = view.rows;
}
document.querySelectorAll('[data-algorithm]').forEach(button => {
  button.disabled = false;
  button.addEventListener('click', () => showSchedule(button.dataset.algorithm));
});

// Enhance the complete static projects into one accessible, manually selected view.
// Keep the DOM alive while switching so demo selections and details retain their state.
const projectBrowser = $('#featured-projects');
const projectPanels = [...projectBrowser.querySelectorAll('.featured-project')];
const projectTabs = document.createElement('div');
projectTabs.className = 'project-tabs';
projectTabs.setAttribute('role', 'tablist');
projectTabs.setAttribute('aria-label', 'Projects');
const projectSwitcher = document.createElement('div');
projectSwitcher.className = 'project-switcher';
const projectToolbar = document.createElement('div');
projectToolbar.className = 'project-tab-toolbar';
const projectIndex = document.createElement('span');
projectIndex.className = 'mono';
projectIndex.textContent = `PROJECT INDEX / ${String(featuredProjects.length).padStart(2, '0')}`;
const projectStatus = document.createElement('span');
projectStatus.className = 'sr-only';
projectStatus.setAttribute('role', 'status');
const stepButtons = document.createElement('div');
stepButtons.className = 'project-step-buttons';
let selectedProject = 0;
for (const [label, symbol, direction] of [['Previous project', '←', -1], ['Next project', '→', 1]]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'project-step';
  button.setAttribute('aria-label', label);
  button.textContent = symbol;
  button.addEventListener('click', () => selectProject((selectedProject + direction + featuredProjects.length) % featuredProjects.length, true, false));
  stepButtons.append(button);
}
projectToolbar.append(projectIndex, projectStatus, stepButtons);
projectSwitcher.append(projectToolbar, projectTabs);
const tabButtons = featuredProjects.map((project, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = `project-tab-${project.id}`;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', `project-panel-${project.id}`);
  button.setAttribute('aria-label', project.name);
  const number = document.createElement('span');
  number.className = 'mono';
  number.setAttribute('aria-hidden', 'true');
  number.textContent = project.number;
  const label = document.createElement('span');
  label.textContent = project.tabLabel ?? project.name;
  button.append(number, label);
  projectTabs.append(button);
  const panel = projectPanels[index];
  panel.id = `project-panel-${project.id}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', button.id);
  panel.tabIndex = 0;
  return button;
});
function selectProject(index, focus = false, focusTab = true) {
  selectedProject = index;
  tabButtons.forEach((button, position) => {
    const active = index === position;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    projectPanels[position].hidden = !active;
    if (!active) projectPanels[position].querySelectorAll('[data-ambient]').forEach(scene => scene.classList.remove('ambient-visible'));
  });
  updateCompilerPlayback();
  const activeLabel = tabButtons[index]?.querySelector('span:last-child');
  if (activeLabel && window._scrambleText) {
    window._scrambleText(activeLabel, featuredProjects[index].tabLabel ?? featuredProjects[index].name, 220);
  }
  document.dispatchEvent(new Event('motion-statechange'));
  if (focus) {
    if (!focusTab) projectStatus.textContent = `${featuredProjects[index].name}. Project ${index + 1} of ${featuredProjects.length}.`;
    if (focusTab) tabButtons[index].focus({ preventScroll: true });
    const tabBounds = tabButtons[index].getBoundingClientRect();
    const listBounds = projectTabs.getBoundingClientRect();
    if (tabBounds.left < listBounds.left) projectTabs.scrollLeft += tabBounds.left - listBounds.left;
    else if (tabBounds.right > listBounds.right) projectTabs.scrollLeft += tabBounds.right - listBounds.right;
    const headerHeight = $('.site-header').getBoundingClientRect().height;
    const top = projectBrowser.getBoundingClientRect().top;
    if (top < headerHeight) window.scrollTo({ top: scrollY + top - headerHeight - 12, behavior: 'instant' });
  }
}
tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectProject(index, true));
  button.addEventListener('keydown', event => {
    const next = { ArrowRight: (index + 1) % tabButtons.length, ArrowLeft: (index + tabButtons.length - 1) % tabButtons.length, Home: 0, End: tabButtons.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectProject(next, true);
  });
});
projectBrowser.prepend(projectSwitcher);
document.documentElement.classList.add('project-browser-enabled');
selectProject(0);

const menuButton = $('.menu-toggle');
const nav = $('#navigation');
menuButton.hidden = false;
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.nav-bar')) closeMenu(); });
document.addEventListener('focusin', event => { if (!event.target.closest('.nav-bar')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

$('#copy-email').hidden = false;
$('#copy-email').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText('jianyongzheng490@gmail.com');
    $('#copy-status').textContent = 'Email address copied.';
  } catch {
    $('#copy-status').textContent = 'Copy is unavailable here. Select the email address to copy it, or use the email link.';
  }
});

if ('IntersectionObserver' in window) {
  const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('#navigation a').forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main > section[id]').forEach(section => activeObserver.observe(section));
}

// Animation has its own failure boundary. All content and controls work without it.
import('./motion.js').then(({ initMotion }) => {
  initMotion({
    onCompilerProgress(progress) {
      if (followScroll) showCompilerStage(Math.min(5, Math.floor(progress * 6)));
    },
    onScrollMode(enabled) {
      $('.follow-scroll').hidden = !enabled;
      if (followScroll) $('#compiler-mode').textContent = enabled ? 'SCROLL OR SELECT A STAGE' : 'SELECT A STAGE';
    },
  });
}).catch(() => {
  document.documentElement.classList.remove('motion-enabled', 'motion-forced', 'scroll-story');
  document.documentElement.classList.remove('intro-active', 'intro-settling');
  document.querySelector('.welcome-composition')?.classList.remove('intro-overlay');
});
