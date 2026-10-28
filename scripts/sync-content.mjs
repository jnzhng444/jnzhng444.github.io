// Optional maintenance helper, not a required site build. Browser content also
// reads data.js directly. Refreshes complete HTML snapshots for script failure,
// no-JS access and crawlers when editing content. No packages to install.
import { readFileSync, writeFileSync } from 'node:fs';
import { featuredMarkup, skillsMarkup } from '../js/render.js';
const path = new URL('../index.html', import.meta.url);
let html = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
const original = html;
for (const [name, render] of Object.entries({featured: featuredMarkup, skills: skillsMarkup})) {
  const start = `<!-- CONTENT:${name}:start -->`;
  const end = `<!-- CONTENT:${name}:end -->`;
  if (!html.includes(start) || !html.includes(end)) throw new Error(`Missing ${name} snapshot markers`);
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), () => `${start}\n${render()}\n${end}`);
}
if (process.argv.includes('--check')) {
  if (html !== original) {
    console.error('HTML snapshots are out of date. Run node scripts/sync-content.mjs.');
    process.exitCode = 1;
  } else console.log('Static HTML snapshots match the centralized content.');
} else {
  writeFileSync(path, html, 'utf8');
  console.log('Refreshed complete project and skills HTML snapshots. No build required to serve or publish.');
}
