export function random(x) {
  return Math.random() * x;
}

export function randomRange(a, b) {
  return a + (b - a) * Math.random();
}

export function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}