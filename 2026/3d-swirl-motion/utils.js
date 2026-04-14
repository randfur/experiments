export const TAU = 2 * Math.PI;

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

export function deviate(x) {
  return Math.random() * x * 2 - x;
}

