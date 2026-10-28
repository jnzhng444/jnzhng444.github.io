// Shared by the progressive enhancement and optional static-snapshot helper.
// Content is always visible in the shipped HTML, even if scripts fail.
import { featuredProjects, skills } from './data.js';
import { projectVisuals, riscSystem } from './project-visuals.js';
import { compilerStages } from './compiler.js';
import { demoTasks } from './scheduler.js';
import { scheduleView } from './scheduler-view.js';

export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const tags = items => `<ul class="tags" aria-label="Technologies">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
const repoLink = (url, text) => `<a class="text-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(text)} <span aria-hidden="true">↗</span></a>`;

function compilerDemo() {
  const stage = compilerStages[0];
  return `<div class="compiler-scroll-scene"><div class="compiler-sticky"><div class="demo compiler-demo" data-stage="0" data-ambient aria-label="Interactive compiler explanation">
    <div class="demo-topline mono"><span><i class="status-dot" aria-hidden="true"></i> THE TRANSFORMATION LAB</span><span id="compiler-mode">SELECT A STAGE</span></div>
    <div class="compiler-steps" role="group" aria-label="Choose a compiler stage">${compilerStages.map((item, index) => `<button type="button" data-stage="${index}" aria-pressed="${index === 0}" disabled><span class="step-number">0${index + 1}</span><span>${item.label}</span></button>`).join('')}</div>
    <div class="compiler-workspace"><div class="compiler-stage-visual"><div class="stage-heading"><span class="stage-number" aria-hidden="true">01</span><div><p class="eyebrow">ONE IDEA / SIX REPRESENTATIONS</p><h4 id="compiler-stage-title">${stage.title}</h4></div></div><div class="block-visual" aria-hidden="true"><div class="block-rail"></div><div class="ir-block block-unused"><span class="block-marker">01</span><code>let unused = 9;</code><span class="removed-mark">×</span></div><div class="ir-block block-input"><span class="block-marker">02</span><code>input</code></div><div class="ir-block block-add"><span class="block-marker">03</span><code>signal = input + 1</code></div><div class="ir-block block-emit"><span class="block-marker">04</span><code>emit(signal)</code></div></div><div class="compiler-flow-labels mono"><span>READ</span><span aria-hidden="true">→</span><span>TRANSFORM</span><span aria-hidden="true">→</span><span>EMIT</span></div></div>
    <div class="compiler-output" aria-live="off" aria-atomic="true"><div class="code-file mono" id="compiler-file">${stage.file}</div><pre><code id="compiler-code">${escapeHTML(stage.code)}</code></pre><p id="compiler-description">${stage.description}</p><p id="compiler-note" class="small-text">${stage.note}</p></div></div>
    <div class="compiler-footer"><p class="demo-disclaimer"><span class="demo-badge">ILLUSTRATIVE</span> Pseudocode and generic assembly. This is a visual explanation, not the real compiler running in your browser.</p><button class="compiler-play mono" type="button" aria-label="Automatic compiler stages" aria-pressed="true" hidden>Pause stages ?</button><button class="follow-scroll mono" type="button" hidden>Follow scroll <span aria-hidden="true">↓</span></button></div><div class="compiler-progress" aria-hidden="true"><span></span></div>
  </div></div></div>`;
}

function schedulerDemo() {
  const view = scheduleView('RMS');
  return `<div class="demo scheduler-demo" aria-label="Interactive real-time scheduler demonstration" data-ambient><div class="demo-topline mono"><span><i class="status-dot" aria-hidden="true"></i> DISTRIBUTED BY DESIGN</span><span>SYSTEM TOPOLOGY</span></div>
    <div class="system-topology"><svg viewBox="0 0 600 170" role="img" aria-label="A Linux host communicates over CRC-validated serial links with ESP32 and Raspberry Pi Pico H nodes"><path d="M200 85H300V43H375M300 85V127H375" fill="none" stroke="#555"/><path class="signal-path" d="M200 85H300V43H375M300 85V127H375" fill="none" stroke="#b6ff3b" stroke-width="2"/><rect x="45" y="48" width="155" height="74" fill="#181818" stroke="#b6ff3b"/><path d="M58 60h9m-9 0v9M187 110h-9m9 0v-9" stroke="#b6ff3b"/><rect x="375" y="16" width="170" height="54" fill="#151515" stroke="#666"/><rect x="375" y="100" width="170" height="54" fill="#151515" stroke="#666"/><g fill="#f5f5f0" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="12"><text x="122" y="80">LINUX HOST</text><text x="460" y="40">ESP32</text><text x="460" y="124">PICO H</text></g><g fill="#aaa" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9"><text x="122" y="101">CALIBRATE / ALLOCATE</text><text x="460" y="57">RMS / EDF</text><text x="460" y="141">RMS / EDF</text><text x="286" y="76">CRC</text></g><circle cx="300" cy="85" r="3" fill="#b6ff3b"/></svg></div>
    <div class="scheduler-controls"><span class="small-text">Try one CPU's scheduling policy</span><div class="segmented" role="group" aria-label="Scheduling algorithm"><button type="button" data-algorithm="RMS" aria-pressed="true" disabled>RMS</button><button type="button" data-algorithm="EDF" aria-pressed="false" disabled>EDF</button></div></div><div class="task-definitions">${demoTasks.map(task => `<span class="task-definition task-${task.id.toLowerCase()}"><b>Task ${task.id}</b> C = ${task.execution} · T = D = ${task.period}</span>`).join('')}</div>
    <div id="timeline" class="timeline" role="region" aria-label="Scheduling timeline; scroll horizontally on small screens" tabindex="0">${view.svg}</div><div class="timeline-legend small-text"><span><i class="legend-block" aria-hidden="true"></i> Execution</span><span><i class="legend-deadline" aria-hidden="true"></i> Deadline</span><span>↑ Release</span><span>× Missed</span></div>
    <div class="scheduler-result" aria-live="polite" aria-atomic="true"><p id="scheduler-status">${view.status}</p><p id="scheduler-explanation" class="small-text">${view.explanation}</p></div><details class="schedule-table-details"><summary>Read the execution schedule <span aria-hidden="true">+</span></summary><div class="schedule-table-wrap"><table><caption id="schedule-caption">${view.caption}</caption><thead><tr><th scope="col">Interval</th><th scope="col">Task</th><th scope="col">Release</th><th scope="col">Deadline</th></tr></thead><tbody id="schedule-body">${view.rows}</tbody></table></div></details><p class="demo-disclaimer"><span class="demo-badge">EDUCATIONAL DEMO</span> Independent periodic tasks, one preemptive CPU, zero overhead, integer time. C: execution; T: period; D: deadline. D = T; both release at zero. Ties use release time, then A before B. Late jobs remain queued. One 35-unit hyperperiod; the hardware system is not being emulated.</p></div>`;
}

function garageDemo() {
  return `<div class="demo garage-demo" data-ambient><div class="demo-topline mono"><span><i class="status-dot" aria-hidden="true"></i> GARAGE / TELEMETRY</span><span>CONCEPT 03</span></div><div class="track-visual"><svg viewBox="0 0 480 265" role="img" aria-label="Original fictional racing circuit with a car marker"><defs><pattern id="track-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#303030" stroke-width=".6"/></pattern><path id="race-track" d="M90 195C45 195 38 140 80 112L160 53Q182 37 214 51L263 75Q288 87 311 68L343 45C363 31 397 49 395 73L387 126Q386 144 357 148L303 156Q281 159 267 180L248 210Q237 229 213 221L170 202Q155 195 137 195Z"/></defs><rect width="480" height="265" fill="url(#track-grid)"/><use href="#race-track" fill="none" stroke="#262626" stroke-width="20" stroke-linejoin="round"/><use href="#race-track" fill="none" stroke="#b6ff3b" stroke-width="1.5"/><path d="M125 184V206M131 184V206" stroke="#f5f5f0" stroke-width="2"/><circle class="race-car" r="4" fill="#f5f5f0"/><g fill="#aaa" font-family="IBM Plex Mono,monospace" font-size="9"><text x="70" y="239">START / FINISH</text><text x="334" y="190">SECTOR 02</text><text x="65" y="66">SECTOR 01</text></g><g stroke="#f5f5f0"><path d="M10 15h10m-5-5v10M460 247h10m-5-5v10"/></g></svg><span class="track-coordinate mono">ORIGINAL CIRCUIT / ILLUSTRATIVE DATA</span></div><div class="telemetry"><div><span class="mono muted">ENGINE / RPM</span><strong>8,420</strong><svg viewBox="0 0 140 30" fill="none" aria-hidden="true"><path d="M0 26L12 22L20 24L34 12L43 16L57 7L69 11L80 4L92 9L108 3L120 7L140 2" stroke="#b6ff3b" stroke-width="1.5"/></svg></div><div><span class="mono muted">THROTTLE / %</span><strong>76</strong><div class="throttle-bar" aria-hidden="true"><span></span></div></div><div><span class="mono muted">GEAR</span><strong class="gear-value">05</strong></div></div><p class="demo-disclaimer"><span class="demo-badge">ILLUSTRATIVE</span> Fictional circuit and synthetic telemetry. No live race data or project performance claims.</p></div>`;
}

function projectMeta(project) {
  return `<div class="project-meta mono"><span>PROJECT / ${project.number}</span><span>${escapeHTML(project.category)}</span><span>${project.year}</span></div>`;
}
function projectHeading(project) {
  return `<div class="project-heading"><h3 id="${project.id}-title">${escapeHTML(project.title)}</h3><p class="project-name">${escapeHTML(project.name)}</p></div>`;
}
function projectCopy(project) {
  return `<p class="project-description">${escapeHTML(project.description)}</p><div class="contribution"><span class="eyebrow">MY CONTRIBUTION</span><p>${escapeHTML(project.contribution)}</p></div>`;
}
function projectDetails(project) {
  return `${tags(project.technologies)}<details class="project-details"><summary>Under the hood <span aria-hidden="true">+</span></summary><p>${escapeHTML(project.details)}</p></details><div class="project-links">${repoLink(project.repo, project.repoLabel)}<span class="small-text muted">${escapeHTML(project.collaboration)}</span></div>`;
}
export function featuredMarkup() {
  return featuredProjects.map(project => project.id === 'compiler'
    ? `<article class="featured-project project-compiler" aria-labelledby="compiler-title">${projectMeta(project)}<div class="compiler-intro">${projectHeading(project)}<div class="project-copy">${projectCopy(project)}${projectDetails(project)}</div></div>${riscSystem()}${compilerDemo()}</article>`
    : `<article class="featured-project project-${project.id}" aria-labelledby="${project.id}-title">${projectMeta(project)}<div class="project-layout"><div class="project-copy">${projectHeading(project)}${projectCopy(project)}${projectDetails(project)}</div>${project.id === 'scheduler' ? schedulerDemo() : project.id === 'garage' ? garageDemo() : projectVisuals[project.id]()}</div></article>`).join('');
}

export function skillsMarkup() {
  return skills.map(group => `<div class="skill-row"><span class="skill-number mono">${group.number}</span><div class="skill-heading"><h3>${escapeHTML(group.title)}</h3><p class="small-text">${escapeHTML(group.note)}</p></div><ul aria-label="${escapeHTML(group.title)} skills">${group.items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div>`).join('');
}
