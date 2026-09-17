export const TAU = Math.PI * 2;

const returnColour = {r: 0, g: 0, b: 0};
export function fadeColour(colour, fade) {
  returnColour.r = colour.r * fade;
  returnColour.g = colour.g * fade;
  returnColour.b = colour.b * fade;
  return returnColour;
}

export function deviate(x) {
  return Math.random() * 2 * x - x;
}

export function random(x) {
  return Math.random() * x;
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
