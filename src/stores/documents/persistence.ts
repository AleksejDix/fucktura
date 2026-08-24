/**
 * Write plumbing for the documents store: unique number claims and a
 * per-document write queue. No store state — the store passes in what
 * the helpers need and owns the persistence calls themselves.
 */

/**
 * Numbers double as filenames and generateNumber has second resolution,
 * so two quick creations (double-click, duplicate twice) could collide
 * and overwrite the same file. Claims run synchronously against the
 * caller's taken-check plus in-flight claims, bumping the numeric tail
 * until free.
 */
export function numberClaims(isTaken: (n: string) => boolean) {
  const pending = new Set<string>();

  function claim(desired: string): string {
    const taken = (n: string) => pending.has(n) || isTaken(n);
    let candidate = desired;
    while (taken(candidate)) {
      const m = candidate.match(/^(.*)-(\d+)$/);
      candidate = m ? `${m[1]}-${Number(m[2]) + 1}` : `${candidate}-2`;
    }
    pending.add(candidate);
    return candidate;
  }

  function release(n: string): void {
    pending.delete(n);
  }

  return { claim, release };
}

/** Pending disk write per key, so writes to one file never interleave. */
export function writeQueue() {
  const queues = new Map<string, Promise<void>>();

  function enqueue(key: string, fn: () => Promise<void>): Promise<void> {
    const tail = queues.get(key) ?? Promise.resolve();
    const run = tail.catch(() => {}).then(fn);
    const settled = run.catch(() => {});
    queues.set(key, settled);
    settled.then(() => {
      if (queues.get(key) === settled) queues.delete(key);
    });
    return run;
  }

  return { enqueue };
}
