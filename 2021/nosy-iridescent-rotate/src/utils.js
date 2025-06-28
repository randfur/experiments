export function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i)
    result.push(i);
  return result;
}

export function* enumerate(iterable) {
  let i = 0;
  for (let x of iterable) {
    yield [i, x];
    ++i;
  }
}

export function replaceChar(text, index, char) {
  return text.slice(0, index) + char + text.slice(index + 1);
}