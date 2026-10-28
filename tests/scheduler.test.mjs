import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoTasks, horizon, simulate } from '../js/scheduler.js';

test('RMS has a deadline miss at 7; EDF meets every deadline over the hyperperiod', () => {
  const rms = simulate(demoTasks, 'RMS', horizon);
  const edf = simulate(demoTasks, 'EDF', horizon);
  assert.deepEqual(rms.misses, [{ task: 'B', release: 0, deadline: 7 }]);
  assert.deepEqual(edf.misses, []);
  assert.equal(rms.slots[5].task, 'A');
  assert.equal(edf.slots[5].task, 'B');
  assert.equal(edf.slots.filter(Boolean).length, 34);
  assert.equal(edf.jobs.every(job => job.remaining === 0), true);
});

test('completed work at the deadline is on time, including the right horizon boundary', () => {
  assert.deepEqual(simulate([{ id: 'A', execution: 3, period: 3 }], 'EDF', 3).misses, []);
  assert.deepEqual(simulate([{ id: 'A', execution: 4, period: 3 }], 'EDF', 3).misses, [{ task: 'A', release: 0, deadline: 3 }]);
});

test('idle intervals, deterministic ties, and overdue jobs retained in ready queue', () => {
  assert.deepEqual(simulate([{ id: 'A', execution: 1, period: 4 }], 'RMS', 4).slots.map(slot => slot?.task ?? null), ['A', null, null, null]);
  const tasks = [{ id: 'A', execution: 2, period: 2 }, { id: 'B', execution: 2, period: 2 }];
  const overloaded = simulate(tasks, 'EDF', 4);
  assert.deepEqual(overloaded.slots.map(slot => slot.task), ['A', 'A', 'B', 'B']);
  assert.deepEqual(overloaded.misses, [{ task: 'B', release: 0, deadline: 2 }, { task: 'A', release: 2, deadline: 4 }, { task: 'B', release: 2, deadline: 4 }]);
});

test('unsupported algorithms and invalid task parameters are rejected', () => {
  assert.throws(() => simulate(demoTasks, 'FIFO', 35));
  assert.throws(() => simulate([{ id: 'A', execution: 0, period: 3 }], 'RMS', 4));
});
