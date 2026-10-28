import { demoTasks, horizon, simulate } from './scheduler.js';

export function scheduleView(algorithm) {
  const result = simulate(demoTasks, algorithm, horizon);
  const left = 50, unit = 18;
  let svg = `<svg viewBox="0 0 700 165" role="img" aria-labelledby="schedule-svg-title schedule-svg-description"><title id="schedule-svg-title">${algorithm} execution timeline, zero to 35 time units</title><desc id="schedule-svg-description">${result.misses.length ? 'Task B misses its deadline at time 7.' : 'All jobs complete by their deadlines.'} Blocks indicate execution, triangles deadlines, arrows releases, and a cross a missed deadline. A text table follows.</desc>`;
  for (let time = 0; time <= horizon; time++) {
    const x = left + time * unit;
    svg += `<path d="M${x} 25V124" stroke="#333" stroke-width="${time % 5 === 0 ? 1 : .4}"/>`;
    if (time % 5 === 0) svg += `<text x="${x}" y="149" text-anchor="middle" class="axis-label">${time}</text>`;
  }
  demoTasks.forEach((task, index) => {
    const y = 35 + index * 48;
    svg += `<text x="15" y="${y + 20}" fill="${task.color}" class="task-label">${task.id}</text>`;
    for (let time = 0; time < horizon; time += task.period) svg += `<path d="M${left + time * unit + 2} ${y + 32}v-7m-2 2 2-2 2 2" fill="none" stroke="${task.color}"/>`;
    for (let time = task.period; time <= horizon; time += task.period) {
      const x = left + time * unit;
      const missed = result.misses.some(miss => miss.task === task.id && miss.deadline === time);
      svg += `<path d="M${x - 4} ${y - 5}h8l-4 7Z" fill="${task.color}"/>`;
      if (missed) svg += `<path d="M${x} ${y}v30M${x - 4} ${y - 15}l8 8m-8 0 8-8" stroke="#f5f5f0" stroke-width="1.5"/>`;
    }
    result.slots.forEach((slot, time) => {
      if (slot?.task === task.id) svg += `<rect x="${left + time * unit + 1}" y="${y + 5}" width="${unit - 2}" height="22" fill="${task.color}"><title>Task ${task.id}: ${time}–${time + 1}; job released ${slot.release}; deadline ${slot.deadline}</title></rect>`;
    });
  });
  return {
    svg: svg + '</svg>',
    status: `${algorithm} · ${result.misses.length} deadline${result.misses.length === 1 ? '' : 's'} missed`,
    explanation: algorithm === 'RMS' ? 'Shorter period wins: A can preempt B. B misses its first deadline at t = 7. Utilization is 34/35; high utilization alone does not guarantee RMS feasibility.' : 'Nearest absolute deadline wins. At t = 5, B keeps the CPU because its deadline (7) is earlier than A’s (10). All deadlines are met in this hyperperiod.',
    caption: `${algorithm} schedule · intervals [start, end) · one time unit per row`,
    rows: result.slots.map((slot, time) => `<tr><th scope="row">${time}–${time + 1}</th><td>${slot?.task ?? 'Idle'}</td><td>${slot?.release ?? '—'}</td><td>${slot?.deadline ?? '—'}</td></tr>`).join(''),
  };
}
