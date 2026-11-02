import { describe, expect, it } from 'vitest';
import { computeFunnel, type FunnelEvent } from '../src/funnel';

const d = (s: string) => new Date(s + 'T00:00:00Z');

describe('computeFunnel', () => {
  it('counts each item once at its furthest stage and every stage before it', () => {
    const events: FunnelEvent[] = [
      { itemId: 'a', to: 'polling', at: d('2026-10-01') },
      { itemId: 'a', to: 'recommended', at: d('2026-10-02') },
      { itemId: 'a', to: 'writing', at: d('2026-10-03') },
      { itemId: 'b', to: 'polling', at: d('2026-10-01') },
      { itemId: 'c', to: 'polling', at: d('2026-10-01') },
      { itemId: 'c', to: 'recommended', at: d('2026-10-05') },
    ];
    const rows = computeFunnel(events);
    expect(rows.map((r) => r.reached)).toEqual([3, 2, 1, 0, 0, 0]);
    expect(rows[0]?.conversion).toBeNull();
    expect(rows[1]?.conversion).toBeCloseTo(2 / 3);
    expect(rows[3]?.conversion).toBe(0);
  });

  it('counts a skipped stage as reached', () => {
    const rows = computeFunnel([{ itemId: 'x', to: 'sent', at: d('2026-10-01') }]);
    expect(rows.map((r) => r.reached)).toEqual([1, 1, 1, 1, 1, 0]);
  });

  it('does not lower an item when it moves back', () => {
    const rows = computeFunnel([
      { itemId: 'x', to: 'review', at: d('2026-10-01') },
      { itemId: 'x', to: 'writing', at: d('2026-10-02') },
    ]);
    expect(rows.find((r) => r.stage === 'review')?.reached).toBe(1);
  });

  it('only uses events inside the period', () => {
    const rows = computeFunnel(
      [
        { itemId: 'x', to: 'polling', at: d('2026-09-30') },
        { itemId: 'y', to: 'polling', at: d('2026-10-01') },
      ],
      { from: d('2026-10-01'), to: d('2027-01-01') },
    );
    expect(rows[0]?.reached).toBe(1);
  });
});
