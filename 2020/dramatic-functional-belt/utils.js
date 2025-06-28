export function clearLog() {
  output.textContent = '';
}

export function log(text) {
  output.textContent += text + '\n';
}

export function random(x) {
  return Math.random() * x;
}

export function deviate(x) {
  return (2 * Math.random() - 1) * x;
}

export function randomRange(min, max) {
  return min + random(max - min);
}

export function randomChoice(list) {
  return list[random(list.length) | 0];
}

export function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

export function assert(condition) {
  if (!condition) {
    debugger;
    throw 'Assert failed';
  }
}

export function sum(list) {
  let result = 0;
  for (const x of list) {
    result += x;
  }
  return result;
}

export function smoothLerp(a, b, t) {
  t = Math.min(1, Math.max(0, t));
  return a + (b - a) * (t > 0.5 ? 1 - 2 * (1 - t) ** 2 : 2 * t ** 2);
}