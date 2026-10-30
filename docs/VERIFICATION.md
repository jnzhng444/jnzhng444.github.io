# Verification record

## Ray Tracing replacement — 2026-10-30

MPointer was replaced by Ray Tracing, now project 01 and the initial selected panel. Eight projects remain, consecutively numbered. Added a schematic ray scene and five selectable execution maps, preserving the current site animations and intro.

Verified with `.review/raytracing-qa.mjs`: all five models at 1440, 768, 390 and 320 px, no document overflow; ten axe audits at desktop/mobile with zero detected WCAG 2 A/AA and 2.1 AA violations; keyboard selection, retained model choice after switching projects, real ray animation, hidden-tab/offscreen suspension, compiler controls and EDF output. All project content and model descriptions remain in the no-JavaScript snapshot. With the motion module intentionally blocked, model controls still work. No page errors or failed requests. Syntax, snapshot consistency and whitespace checks passed. Fixed the existing marquee's marginal text contrast from #777 to #888 during the audit.

Evidence is local/ignored: `.review/raytracing-qa-results.json`, `.review/raytracing-{width}.png`, and `.review/raytracing-project-desktop.png` / `.review/raytracing-diagram.png`. Desktop and mobile screenshots were visually inspected. The C++ renderer and performance benchmarks were reviewed as source material, not compiled or executed as part of the website change.

Verified locally on **2026-10-28** with Chrome (headless), Playwright Core 1.56.1, axe-core 4.10.3, Node.js 24.12.0 and Python 3.14.5. Browser tooling was downloaded into ignored `.review/` solely for QA; it is not a site dependency.

## Welcome glow

Added a continuous green halo, a six-second glow cycle and a seven-second text sheen to the selectable 欢迎 heading. Chrome checks at 1440, 390 and 320 px confirmed changing filter/background values, correct text, no document overflow, pause/offscreen suspension and a plain black print fallback. Desktop/mobile screenshots were visually inspected. Local evidence: `.review/glow-preview.mjs` and `.review/welcome-glow-*.png`.

## Always-on default requested by site owner

The current behavior supersedes the earlier system-preference and persistent-override behavior below. Every visit starts with motion enabled, regardless of OS reduction or legacy stored pause values. The header pause applies only to the current visit; no motion preferences are read from or written to storage. Background and offscreen suspension remain active.

Verified with `.review/motion-default-qa.mjs`: both OS motion settings with old paused storage, real transform changes, manual pause, reload returning to motion on, compiler autoplay, offscreen suspension, mobile width and no browser errors. Syntax and static-content consistency checks passed.

## Earlier explicit motion override

The motion button is now usable even when the OS requests reduced motion. A fresh visit still honors the system, but choosing to enable animations sets a persistent site override. CSS, parallax, reveals and compiler playback use the same effective preference. Pause remains independently persistent; background/offscreen suspension remains active.

Verified with `.review/motion-override-qa.mjs`: reduced-motion default, keyboard activation, actual CSS transform changes, compiler autoplay under OS reduction, reload persistence, pause/resume persistence, hidden-tab and offscreen suspension, blocked localStorage, 320 px layout and an axe audit with zero detected violations. No JavaScript errors. This supersedes earlier checks that expected the reduced-motion button to be disabled.

## Eighth project and motion diagnosis

- Reproduced the previous behavior in a fresh Chrome context: hero, scheduler signals and racing marker animated; the compiler scroll sequence had been disabled by the tabbed layout, and the newer concept diagrams had no animation. A user's actual browser storage or OS preference was not inspected or assumed.
- Added ambient diagram signals, pipeline highlights, state outlines and a schematic game marker. Real animation timelines advance in **all eight projects**, verified by comparing `currentTime` samples and the game marker's computed transform.
- Compiler autoplay advances every 3.4 seconds only when visible and motion is enabled. Manual selection stops playback; its local play/pause button resumes it. Global pause, persisted pause after reload, offscreen state, hidden-tab simulation and reduced-motion preference all stop motion appropriately.
- The visible motion label distinguishes active, paused and OS-reduced states. Reduced motion keeps manual stage controls available and hides autoplay. No animation-loop dependency was introduced; one cancellable timeout controls compiler stages.
- Eight panels at 320, 390, 768, 1024 and 1440 px: **40 layout combinations**, no horizontal document overflow. **16 axe audits** (all panels at desktop/mobile) detected no violations. Keyboard, navigation, preserved demo state, print, static fallbacks, module-failure fallbacks and public PDF checks passed; no browser errors.
- Evidence: `.review/inspect-motion.mjs`, `.review/motion-playback-qa.mjs`, `.review/eight-projects-qa.mjs`, `.review/eight-projects-results.json` and corresponding screenshots. Chrome desktop/mobile views of the new project were visually inspected.

## Earlier seven-project expansion and updated CV

The latest local browser check is `.review/all-projects-qa.mjs`, with results in `.review/all-projects-results.json` and desktop/mobile screenshots named `.review/all-projects-*.png`.

- Seven unique projects in one selector; no duplicate workbench cards or DOM IDs. Every panel includes a description, contribution, technologies, repository link and original explanatory visual.
- All seven panels at **320, 390, 768, 1024 and 1440 px**: 35 combinations, no document overflow, active tab scrolled into view, panel headings below the sticky selector.
- Previous/next buttons wrap correctly, with an accessible status announcement. Arrow keys, Home/End, roving focus and panel focus work across all seven tabs.
- Compiler stage, scheduling algorithm and open details persist across project changes. All six compiler stages remain selectable; EDF retains its correct zero-miss result.
- Fourteen axe-core audits (all seven panels at 1440 and 390 px): zero detected WCAG 2 A/AA and 2.1 AA violations; this remains an automated check rather than full conformance certification.
- Reduced motion disables transitions. Printing, disabled JavaScript and a blocked visuals module retain all seven full project descriptions. Blocking the motion module does not break project selection.
- New résumé retains the revised compiler/RISC title, integration with a five-stage pipeline and L1/L2 caches, other qualifications and email. Public PDF checked for absence of the phone in extracted text, decoded content streams and telephone annotations. Original remains unchanged and ignored by Git. PDF serves successfully over local HTTP.
- No browser page errors or failed requests. Syntax, static HTML consistency and Git whitespace checks passed.

## Earlier three-project selector checks

The three featured projects now share one tabbed view. This supersedes the compiler scroll-story behavior described in the earlier redesign checks below. Additional projects remain below the selector.

- All three panels checked at **320, 390, 768, 1024 and 1440 px** (15 combinations), without document horizontal overflow or headings hidden behind the selector.
- Click/touch-compatible buttons, arrow-key wraparound, Home/End, roving tab focus, panel focus and exactly one exposed panel verified.
- Compiler stage, RMS/EDF selection and expanded details persist when switching projects. The compiler remains compact and manually selectable.
- Six axe-core audits (each panel at 1440 and 390 px): zero detected WCAG 2 A/AA and 2.1 AA violations.
- Reduced motion disables the panel transition. Printing and JavaScript-disabled browsing expose all three projects. With the animation module deliberately blocked, tabs and scheduling controls still work.
- No page errors or failed requests. Syntax and static-content consistency checks passed. Desktop/mobile screenshots visually reviewed.
- Local reproducible check: `.review/project-selector-qa.mjs`; evidence: `.review/project-selector-results.json` and `.review/project-selector-{width}-{index}.png`. Browser tools and evidence remain ignored by Git.

## Earlier redesign checks

- Served the actual root `index.html` and assets over local HTTP. No build, backend or external data service needed.
- Chrome layouts at **320, 360, 390, 430, 700, 760, 768, 820, 999, 1000, 1024, 1280, 1440 and 1920 px**. Root `scrollWidth` equals viewport width at all fourteen sizes. The scheduler timeline scrolls inside its own container on narrow screens.
- Rendered full-page desktop/mobile, hero and compiler screenshots; visually inspected both layouts. Corrected compiler-stage event bubbling discovered during interaction testing and contrast during the dead-code animation.
- The welcome is selectable HTML text `欢迎` with `lang="zh-Hans"`. Chrome DevTools Protocol platform-font inspection confirms that each character actually renders using the local custom font **NotoSansSC-Black**, not a missing-glyph fallback.
- The new palette is black, electric green, warm white and neutral grays; two sections have green backgrounds. No runtime external requests or animation-library dependencies. Browser checks ran with WebGL disabled.
- Section-specific decorative backgrounds were added as seven local SVG assets (4,447 bytes total), with no additional JavaScript. The same 14-width layout, interaction, failure-fallback and automated accessibility checks passed after this addition. The compiler's sticky scroll sequence still works; decorations cannot intercept pointer events.
- Three featured projects, three additional projects, confirmed collaborator repository links, and the extra architecture coursework link. No duplicate DOM IDs; every local section link resolves.
- No JavaScript page errors, failed asset requests, or HTTP error responses during browser testing. Fonts, favicon, modules, stylesheet and CV are local.
- Mobile menu open, section navigation and close; Escape closes and returns focus to the menu button. Mobile menu is omitted from keyboard order while closed.
- All six compiler stage controls, pressed state, and keyboard activation. The project title remains independent from the stage title. The desktop scroll sequence advances through the stages, manual selection overrides it, and Follow scroll restores automatic selection. Mobile and reduced-motion layouts use a compact static scene with working controls.
- RMS/EDF switching: RMS reports one deadline miss at t=7; EDF reports none. Timeline and 35-row accessible schedule table update from the calculated model.
- Expandable project details open/close with Enter.
- Copy email reports success via live status and writes the correct address to the clipboard. A simulated clipboard rejection also exercises the honest fallback message.
- Pause/resume works and persists across reload. OS reduced-motion emulation disables continuous animation and smooth scrolling.
- A simulated `visibilitychange` with `document.hidden = true` exercises the pause handler successfully. Intersection observers pause offscreen ambient CSS animations and restrict parallax work to visible scenes. No continuously running JavaScript animation loop or WebGL renderer is present.
- axe-core WCAG 2 A/AA and 2.1 AA checks at desktop and 390 px mobile: **zero detected violations**. This is an automated audit, not a claim of full WCAG conformance.
- JavaScript-disabled fallback: all three full featured projects, all additional projects, all four skill groups, About, contact and mobile navigation remain available. Interactive demo buttons are disabled until their handlers load.
- Deliberately aborted `motion.js`: complete content remains visible, the compiler scene is static and RMS/EDF controls work. Deliberately aborted `render.js`: complete static project and skills content remains visible.
- Public CV HTTP response is a real PDF. Extracted public PDF text retains email and qualifications and excludes the phone. Original source PDF remains untouched and ignored by Git.
- JavaScript syntax checks, `git diff --check`, and the static HTML snapshot consistency check passed.
- Four scheduler unit tests passed: RMS vs EDF/hyperperiod behavior; completion at deadline and final boundary; idle slots, ties and late-job handling; invalid inputs.

## Re-run the lightweight checks

```powershell
node --test tests/scheduler.test.mjs
node --check js/main.js
node --check js/data.js
node --check js/compiler.js
node --check js/scheduler.js
node --check js/render.js
node --check js/scheduler-view.js
node --check js/motion.js
node scripts/sync-content.mjs --check
git diff --check
```

The sandbox blocks Node's default child-process test isolation. In this environment the tests passed using `node --test --test-isolation=none tests/scheduler.test.mjs`; the standard command works in an unrestricted local terminal.

Local browser evidence is intentionally ignored by Git: `.review/redesign-results.json`, `.review/redesign-accessibility.json`, `.review/redesign-hero-desktop.png`, `.review/redesign-hero-mobile.png`, `.review/redesign-desktop.png`, `.review/redesign-mobile.png`, and `.review/redesign-compiler.png`. The local QA script is `.review/redesign-qa.mjs` and requires the temporary browser tooling described above plus a server on port 8000.

## Verification limits

- Headless Chrome does not mark the previous tab hidden when changing active pages here; the visibility-handler check used a controlled simulated event. Actual OS tab/background throttling still needs a normal-browser check.
- Safari, Firefox, physical iOS/Android devices, and a full manual screen-reader audit were not available. Responsive and keyboard tests used Chrome's viewport settings, not physical devices.
- The PDF was checked structurally and by text extraction; no separate PDF raster renderer was available for a visual page-by-page inspection.
- The original compiler, hardware scheduler and garage backend were reviewed as content sources, not built or executed. Browser demos are explicitly educational or illustrative.
- GitHub Pages production deployment and its live URL were not tested because the user requested **no push or publication**. The branch/root configuration steps follow [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
