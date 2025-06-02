export function deviate(n) {
  return (Math.random() * 2 - 1) * n;
}

export function random(n) {
  return Math.random() * n;
}

export function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

export const TAU = Math.PI * 2;