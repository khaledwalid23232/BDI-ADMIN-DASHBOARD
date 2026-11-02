import { describe, expect, it } from 'vitest';
import { PLAYBOOKS, PROFILE_SCHEMA } from '../src/content';
import { STAGES } from '../src/types';
import { STAGE_LABELS, nextStage, previousStage } from '../src/stages';

describe('content', () => {
  it('has the 18 playbook types across 5 families', () => {
    expect(PLAYBOOKS.map((f) => f.id)).toEqual(['tenders', 'grants', 'competitions', 'programs', 'events']);
    expect(PLAYBOOKS.reduce((n, f) => n + f.types.length, 0)).toBe(18);
  });

  it('has the 9 profile sections', () => {
    expect(PROFILE_SCHEMA.sections).toHaveLength(9);
  });

  it('is bilingual everywhere: no empty English or Arabic string', () => {
    const bad: string[] = [];
    const walk = (v: unknown, path: string) => {
      if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'string' && typeof v[1] === 'string') {
        if (!v[0].trim() || !v[1].trim()) bad.push(path);
        return;
      }
      if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
    };
    walk(PLAYBOOKS, 'playbooks');
    walk(PROFILE_SCHEMA, 'profile');
    expect(bad).toEqual([]);
  });
});

describe('stages', () => {
  it('labels every stage in both languages', () => {
    for (const s of STAGES) expect(STAGE_LABELS[s].every((x) => x.length > 0)).toBe(true);
  });
  it('steps forward and back', () => {
    expect(nextStage('polling')).toBe('recommended');
    expect(nextStage('outcomes')).toBeNull();
    expect(previousStage('polling')).toBeNull();
    expect(previousStage('sent')).toBe('review');
  });
});
