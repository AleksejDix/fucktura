import { describe, expect, it } from 'vitest';
import * as repo from '@/fs/repo';
import type { Document } from '@/fs/types';

function collectEvents(): { events: string[]; detail: () => string | undefined } {
  const events: string[] = [];
  let errorDetail: string | undefined;
  for (const type of ['save-start', 'save-success', 'save-error', 'save-end']) {
    repo.saveEvents.addEventListener(type, (e) => {
      events.push(type);
      if (type === 'save-error') errorDetail = (e as CustomEvent<string>).detail;
    });
  }
  return { events, detail: () => errorDetail };
}

describe('save events', () => {
  it('dispatches save-error with the message when a write fails', async () => {
    // No FS root is set in tests, so the write throws inside tracked().
    const { events, detail } = collectEvents();
    const doc = { number: 'R-1' } as Document;
    await expect(repo.writeDocument(doc)).rejects.toThrow();
    expect(events).toEqual(['save-start', 'save-error', 'save-end']);
    expect(events).not.toContain('save-success');
    expect(detail()).toMatch(/FS root not set/);
  });
});
