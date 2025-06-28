
export function logIf(text) {
  if (text !== '') {
    console.log(text);
  }
}

export function assert(condition, message='Failed assert') {
  if (!condition) {
    throw new Error(message);
  }
}

export function toInteger(text) {
  const result = parseInt(text);
  assert(!isNaN(result), 'Not a number');
  return result;
}

export function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}
