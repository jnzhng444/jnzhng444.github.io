// Explanatory execution maps, not measured timings or a browser port of the renderer.
export const executionModels = [
  { id: 'sequential', label: 'Sequential', title: 'One tile, then the next.',
    description: 'One worker completes each tile before starting the next. This is the baseline for comparing the same scene, samples, and image size.',
    lanes: [['Worker 0', ['Tile A', 'Tile A', 'Tile B', 'Tile B', 'Tile C', 'Tile C']]] },
  { id: 'fine', label: 'Fine-Grained', title: 'Short turns. One real thread.',
    description: 'A cooperative round-robin scheduler advances each logical tile task by at most K complete pixels, saves its position, and rotates to the next task. This implementation uses one OS thread.',
    lanes: [['Thread 0', ['A₁', 'B₁', 'C₁', 'A₂', 'B₂', 'C₂']]] },
  { id: 'coarse', label: 'Coarse-Grained', title: 'Keep the tile. Yield on a block.',
    description: 'A thread advances through its tile until a simulated expensive blocking event, waits, and resumes the same tile. The default is one thread per tile; a bounded-worker variant is also available.',
    lanes: [['Thread A', ['A', 'A', 'WAIT', 'WAIT', 'A', 'A']], ['Thread B', ['B', 'WAIT', 'WAIT', 'B', 'B', 'B']]] },
  { id: 'smt', label: 'SMT', title: 'Logical threads share a core.',
    description: 'Workers claim tiles through an atomic index and use logical CPUs according to available topology and affinity. Sibling hardware threads share physical-core resources; selecting this policy does not enable hardware SMT by itself.',
    lanes: [['Core 0 / L0', ['A', 'A', 'A', 'D', 'D', 'D']], ['Core 0 / L1', ['B', 'B', 'B', 'E', 'E', 'E']]] },
  { id: 'cmp', label: 'CMP', title: 'Spread work across physical cores.',
    description: 'Workers are pinned to distinct physical cores and claim tiles from the shared queue. Each tile owns a separate image region, while scene and camera data are read-only.',
    lanes: [['Core 0', ['A', 'A', 'A', 'D', 'D', 'D']], ['Core 1', ['B', 'B', 'B', 'E', 'E', 'E']], ['Core 2', ['C', 'C', 'C', 'F', 'F', 'F']]] },
];

export function executionView(id) {
  const model = executionModels.find(item => item.id === id) ?? executionModels[0];
  return `<h4>${model.title}</h4><p>${model.description}</p><div class="execution-map" aria-label="Schematic work distribution, not measured time">${model.lanes.map(([name, cells]) => `<div class="execution-lane"><span class="execution-worker mono">${name}</span><div class="execution-cells">${cells.map((cell, index) => `<span class="execution-cell${cell === 'WAIT' ? ' execution-wait' : ''}" style="--tile-delay:${index * .4}s">${cell}</span>`).join('')}</div></div>`).join('')}</div><p class="execution-note mono">ORDER & SHARING ONLY / NOT TO SCALE</p>`;
}

export function rayTracingVisual() {
  return `<figure class="demo concept-demo raytracing-demo" data-ambient><div class="demo-topline mono"><span><i class="status-dot" aria-hidden="true"></i> RAY TRACING / EXECUTION LAB</span><span>CPU RENDERING</span></div>
    <svg class="concept-drawing ray-scene" viewBox="0 0 480 310" role="img" aria-label="A camera casts rays through an image plane toward matte, metallic and glass spheres. Image tiles are the work units assigned by the execution models.">
      <defs><radialGradient id="ray-matte" cx=".3" cy=".25"><stop stop-color="#b6ff3b"/><stop offset="1" stop-color="#273215"/></radialGradient><radialGradient id="ray-metal" cx=".3" cy=".2"><stop stop-color="#f5f5f0"/><stop offset=".5" stop-color="#777"/><stop offset="1" stop-color="#171717"/></radialGradient><pattern id="ray-floor" width="28" height="18" patternUnits="userSpaceOnUse"><path d="M28 0H0V18" fill="none" stroke="#444" stroke-width=".6"/></pattern></defs>
      <path d="M170 210 450 165v110H120Z" fill="url(#ray-floor)" stroke="#444"/>
      <circle cx="267" cy="163" r="49" fill="url(#ray-matte)" stroke="#b6ff3b"/><circle cx="374" cy="184" r="38" fill="url(#ray-metal)" stroke="#aaa"/>
      <circle cx="349" cy="98" r="31" fill="#111" fill-opacity=".3" stroke="#b6ff3b"/><ellipse cx="349" cy="98" rx="12" ry="31" fill="none" stroke="#777"/><path d="M318 98h62" stroke="#777"/>
      <path d="M98 65 151 91v125l-53-26Z" fill="#111" stroke="#aaa"/><g stroke="#555"><path d="M98 96 151 122M98 127l53 26M98 158l53 26M116 74v125M134 83v125"/></g>
      <g class="diagram-flow ray-paths" fill="none" stroke="#b6ff3b" stroke-width="1.6"><path d="M45 145 124 125 227 140 206 55"/><path d="M45 145 124 153 250 199 298 247"/><path d="M45 145 124 97 324 91 353 104 402 66"/></g>
      <g fill="#f5f5f0"><path d="M22 132h25v26H22zM47 139l12-7v26l-12-7Z"/></g><g font-family="IBM Plex Mono,monospace" font-size="13" fill="#aaa"><text x="18" y="184">CAMERA</text><text x="82" y="244">IMAGE TILES</text><text x="215" y="287">MATTE / METAL / GLASS</text><text x="268" y="40" fill="#b6ff3b">SAMPLE → SCATTER → BOUNCE</text></g>
    </svg>
    <div class="execution-controls" role="group" aria-label="Ray tracing execution model">${executionModels.map((model, index) => `<button type="button" data-execution="${model.id}" aria-pressed="${index === 0}" disabled>${model.label}</button>`).join('')}</div>
    <div id="execution-view" class="execution-view" aria-live="polite" aria-atomic="true">${executionView('sequential')}</div>
    <details class="execution-reference"><summary>Read all five models <span aria-hidden="true">+</span></summary><dl>${executionModels.map(model => `<dt>${model.label}</dt><dd>${model.description}</dd>`).join('')}</dl></details>
    <figcaption class="demo-disclaimer"><span class="demo-badge">ILLUSTRATIVE</span> Animated rays and work blocks explain the C++ project. This is not the renderer running in your browser. Block widths and animation speeds are not benchmarks or speedup measurements.</figcaption></figure>`;
}
