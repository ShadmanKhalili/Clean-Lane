import { describe, expect, it } from 'vitest';
import { shortId } from '../utils/id';
import { isViewAllowed, normaliseView, readRoute } from '../routing';

describe('shortId', () => {
  it('does not collide across a burst of calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, shortId));
    expect(ids.size).toBe(1000);
  });
});

describe('routing', () => {
  it('parses known roles and rejects unknown ones', () => {
    expect(readRoute('?as=collector&view=traceability')).toEqual({ role: 'collector', view: 'traceability' });
    expect(readRoute('?as=admin').role).toBeNull();
  });

  it('only allows views that the role can navigate to', () => {
    expect(isViewAllowed('collector', 'rewards')).toBe(false);
    expect(isViewAllowed('customer_household', 'rewards')).toBe(true);
    expect(isViewAllowed('customer_household', 'evidence_model')).toBe(true);
    expect(normaliseView('collector', 'rewards')).toBe('overview');
    expect(normaliseView('operator', null)).toBe('overview');
  });
});
