/**
 * Short, human-readable, collision-resistant ID suffix.
 *
 * The previous pattern `Date.now().toString().slice(-4)` wraps every 10 seconds,
 * so two records created a few seconds apart (or in the same render) could share
 * an ID — which silently corrupts lookups such as `lots.find(l => l.id === id)`.
 * This combines a base-36 timestamp with a per-session monotonic counter.
 */
let counter = 0;

export const shortId = (): string => {
  counter = (counter + 1) % 1296; // 36^2
  const time = Date.now().toString(36).slice(-5);
  return (time + counter.toString(36).padStart(2, '0')).toUpperCase();
};
