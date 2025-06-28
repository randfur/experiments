export const TAU = Math.PI * 2;

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

export function randomRange(a, b) {
  return a + Math.random() * (b - a);
}

export function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

export function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const rotateResult = [0, 0];
export function rotate(x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  rotateResult[0] = cos * x - sin * y;
  rotateResult[1] = sin * x + cos * y;
  return rotateResult;
}

export function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

export function removeItems(array, shouldRemove) {
  let removeIndex = null;
  let keepCount = 0;
  for (let i = 0; i < array.length; ++i) {
    if (shouldRemove(array[i])) {
      if (removeIndex === null) {
        removeIndex = i;
      }
    } else {
      ++keepCount;
      if (removeIndex !== null) {
        swap(array, removeIndex, i);
        ++removeIndex;
      }
    }
  }
  array.length = keepCount;
}

function swap(array, i, j) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}