export function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

export function random(x) {
  return Math.random() * x;
}

export function randomRange(low, high) {
  return Math.random() * (high - low) + low;
}

export function randomHigh(x) {
    return (1 - Math.abs(Math.random() + Math.random() - 1)) * x;
}

export function randomMid(x) {
  return (random(x) + random(x)) / 2;
}

export function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}