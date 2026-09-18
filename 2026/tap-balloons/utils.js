export const TAU = Math.PI * 2;

export function deviate(x) {
  return Math.random() * 2 * x - x;
}

export function random(x) {
  return Math.random() * x;
}

export function randomBool() {
  return Math.random() < 0.5;
}

export function modulo(x, n) {
  return x - n * Math.floor(x / n);
}

export function easeIn(x) {
  return x ** 2;
}

export function easeOut(x) {
  return 1 - (1 - x) ** 2;
}

export function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

export function drawModel(hexLines, points, size, colour, transform) {
  for (const point of points) {
    if (point === null) {
      hexLines.addNull();
    } else {
      hexLines.addPointParts(transform(point), size, colour);
    }
  }
}

export function pickRandom(list) {
  return list[Math.floor(random(list.length))];
}

const fadeColourResult = {r: 0, g: 0, b: 0};
export function fadeColour(colour, fade) {
  fadeColourResult.r = colour.r * fade;
  fadeColourResult.g = colour.g * fade;
  fadeColourResult.b = colour.b * fade;
  return fadeColourResult;
}

const lerpColourResult = {r: 0, g: 0, b: 0};
export function lerpColour(colourA, colourB, progress) {
  lerpColourResult.r = colourA.r + (colourB.r - colourA.r) * progress;
  lerpColourResult.g = colourA.g + (colourB.g - colourA.g) * progress;
  lerpColourResult.b = colourA.b + (colourB.b - colourA.b) * progress;
  return lerpColourResult;
}

export function cleanUpList(list, filter, onRemoval=null) {
  let aliveIndex = 0;
  for (let i = 0; i < list.length; ++i) {
    if (filter(list[i])) {
      list[aliveIndex] = list[i];
      ++aliveIndex;
    } else {
      onRemoval?.(list[i]);
    }
  }
  list.length = aliveIndex;
}