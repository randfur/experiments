import {Vec3} from '../../third-party/ga/vec3.js';
import {characterModels} from './model-data.js';

export const TAU = Math.PI * 2;

export function random(x) {
  return Math.random() * x;
}

export function deviate(x) {
  return Math.random() * 2 * x - x;
}

export function randomBool() {
  return Math.random() < 0.5;
}

export function pickRandom(list) {
  return list[Math.floor(random(list.length))];
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

export function drawModel(hexLines, positions, thickness, colour, transform) {
  for (const position of positions) {
    if (position === null) {
      hexLines.addNull();
    } else {
      hexLines.addPointParts(transform(position), thickness, colour);
    }
  }
}

const characterPosition = new Vec3();
export function drawString(hexLines, string, thickness, colour, transform) {
  const characterWidth = 1.4;
  for (let i = 0; i < string.length; ++i) {
    drawModel(
      hexLines,
      characterModels[string[i]] ?? [],
      thickness,
      colour,
      position => transform(
        characterPosition
          .set(position)
          .inplaceAddXyz((i - (string.length - 1) / 2) * characterWidth)
      ),
    );
  }
}