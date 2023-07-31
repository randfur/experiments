export const TAU = Math.PI * 2;

export function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [i, list[i]];
  }
}

export function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

export function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}
