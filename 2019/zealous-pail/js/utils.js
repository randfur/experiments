export const TAU = Math.PI * 2;

export function pickRandom(array) {
  return array[randInt(array.length)];
}

export function randInt(n) {
  return Math.floor(Math.random() * n);
}

export function biasedRandInt(n, bias) {
  // Copied from: https://discreet-hook.glitch.me/
  const topBias = 1 - Math.abs(Math.random() + Math.random() - 1);
  if (Math.random() < bias)
    return Math.floor(n * topBias * bias);
  return Math.floor(n * (bias + (1 - topBias) * (1 - bias)));
}

export function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}
