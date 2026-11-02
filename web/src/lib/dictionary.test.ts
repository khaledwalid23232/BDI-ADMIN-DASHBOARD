import { describe, expect, it } from 'vitest';
import { ar, en } from './dictionary';

describe('dictionary', () => {
  it('has the same keys in English and Arabic, none empty', () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
    for (const v of [...Object.values(en), ...Object.values(ar)]) expect(v.trim()).not.toBe('');
  });

  it('keeps the same {placeholders} in both languages', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const k of Object.keys(en) as (keyof typeof en)[]) expect(vars(ar[k])).toEqual(vars(en[k]));
  });
});
