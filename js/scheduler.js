// Educational discrete-time, preemptive, single-CPU scheduler.
// Integer execution times; zero overhead; independent periodic jobs; D = T.
export const demoTasks = [
  { id: 'A', execution: 2, period: 5, color: '#B6FF3B' },
  { id: 'B', execution: 4, period: 7, color: '#F5F5F0' },
];
export const horizon = 35; // One hyperperiod, including deadlines at t = 35.

export function simulate(tasks, algorithm, duration) {
  if (!['RMS', 'EDF'].includes(algorithm)) throw new Error('Unknown scheduling algorithm');
  if (!Number.isInteger(duration) || duration < 1 || !tasks.length || tasks.some(t => !Number.isInteger(t.execution) || t.execution < 1 || !Number.isInteger(t.period) || t.period < 1)) throw new Error('Invalid scheduling parameters');
  const jobs = [];
  const slots = [];
  const misses = [];
  for (let time = 0; time <= duration; time++) {
    // Work executed in [d-1, d) completes before the deadline at d.
    for (const job of jobs) {
      if (job.deadline === time && job.remaining > 0) misses.push({ task: job.task, deadline: time, release: job.release });
    }
    if (time === duration) break;
    tasks.forEach((task, order) => {
      if (time % task.period === 0) jobs.push({ task: task.id, period: task.period, release: time, deadline: time + task.period, remaining: task.execution, order });
    });
    const ready = jobs.filter(job => job.remaining > 0);
    ready.sort((a, b) => (algorithm === 'RMS' ? a.period - b.period : a.deadline - b.deadline) || a.release - b.release || a.order - b.order);
    const running = ready[0];
    slots.push(running ? { task: running.task, release: running.release, deadline: running.deadline } : null);
    if (running) running.remaining--;
  }
  return { slots, misses, jobs };
}
