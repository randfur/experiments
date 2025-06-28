const rangeResult = [];
export function range(n) {
  while (rangeResult.length < n) {
    rangeResult.push(rangeResult.length);
  }
  rangeResult.length = n;
  return rangeResult;
}