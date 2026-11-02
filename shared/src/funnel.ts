import { STAGES, type Stage } from './types';
import { stageIndex } from './stages';

export interface FunnelEvent {
  itemId: string;
  to: Stage;
  at: Date;
}

export interface FunnelRow {
  stage: Stage;
  /** Items that reached this stage (or a later one) inside the period. */
  reached: number;
  /** reached / reached of the previous stage, 0..1. Null for the first stage. */
  conversion: number | null;
}

/**
 * Computes the funnel from real stage events (replaces the frozen
 * REFERENCE_FUNNEL snapshot of the demo). An item counts as having reached
 * a stage if its furthest stage within [from, to) is that stage or later,
 * so skipping a stage still counts for the earlier ones.
 */
export function computeFunnel(events: FunnelEvent[], period?: { from: Date; to: Date }): FunnelRow[] {
  const furthest = new Map<string, number>();
  for (const e of events) {
    if (period && (e.at < period.from || e.at >= period.to)) continue;
    const idx = stageIndex(e.to);
    const prev = furthest.get(e.itemId);
    if (prev === undefined || idx > prev) furthest.set(e.itemId, idx);
  }
  const reachedCounts = STAGES.map((_, i) => [...furthest.values()].filter((f) => f >= i).length);
  return STAGES.map((stage, i) => {
    const reached = reachedCounts[i] ?? 0;
    const before = i === 0 ? null : (reachedCounts[i - 1] ?? 0);
    return {
      stage,
      reached,
      conversion: before === null ? null : before === 0 ? 0 : reached / before,
    };
  });
}
