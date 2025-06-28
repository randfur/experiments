export const TAU = Math.PI * 2;

export function randInt(n) {
  return Math.floor(Math.random() * n);
}

export function randBool() {
  return Math.random() < 0.5;
}

export function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}
