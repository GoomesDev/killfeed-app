import assert from 'node:assert/strict';
import test from 'node:test';
import { parseStats } from '../src/features/profile/stats-contract.ts';

const metrics = {
  kills: 0, deaths: 0, mvps: 0, bombs_planted: 0, bombs_defused: 0,
  headshots: 0, matches: 0, wins: 0, losses: 0, rounds: 0,
  kd_ratio: 0, win_rate: 0, headshot_percentage: 0, rating: 0, impact_score: 0.2, kdd: 0,
};
const requested = { start_date: '2026-09-06', end_date: '2026-09-12' };
const base = { status: 'empty', requested_period: requested, period: null, latest_snapshot: null };

test('daily and weekly accept empty and insufficient history without invented zeros', () => {
  for (const period of ['daily', 'weekly']) {
    const empty = parseStats({ ...base, [`${period}_stats`]: null }, period);
    assert.equal(empty.source, 'empty');
    assert.equal(empty.values, null);
    const cumulative = parseStats({ ...base, status: 'insufficient_data', [`${period}_stats`]: null,
      latest_snapshot: { ...metrics, kills: 67808, kd_ratio: '1.04', win_rate: '46.52', snapshot_date: '2026-09-06' },
    }, period);
    assert.equal(cumulative.source, 'lifetime');
    assert.equal(cumulative.values.kills, 67808);
    assert.equal(cumulative.values.kd_ratio, 1.04);
  }
});

test('valid zero activity remains zero with old period explicitly preserved', () => {
  const result = parseStats({ ...base, status: 'fallback', weekly_stats: metrics,
    period: { start_date: '2026-04-12', end_date: '2026-04-15', days_between: 3 },
    latest_snapshot: { ...metrics, kills: 67808, snapshot_date: '2026-09-06' },
  }, 'weekly');
  assert.equal(result.source, 'period');
  assert.equal(result.status, 'fallback');
  assert.equal(result.values.kills, 0);
  assert.equal(result.period.end_date, '2026-04-15');
});

test('wrong period payloads and null decimals are rejected instead of coerced to zero', () => {
  assert.throws(() => parseStats({ ...base, weekly_stats: metrics }, 'daily'));
  assert.throws(() => parseStats({ ...base, weekly_stats: { ...metrics, kd_ratio: null } }, 'weekly'));
});
