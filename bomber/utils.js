export const TAU = Math.PI * 2;

export function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [i, list[i]];
  }
}
