import {Engine} from './engine.js';

export const TAU = Math.PI * 2;

export function random(x) {
  return Math.random() * x;
}

export function deviate(x) {
  return Math.random() * x * 2 - x;
}

export function randomRange(a, b) {
  return a + Math.random() * (b - a);
}

export async function* secondsRange(durationSeconds) {
  let elapsedSeconds = 0;
  while (true) {
    const secondsDelta = await Engine.nextFrame;
    elapsedSeconds += secondsDelta;
    if (elapsedSeconds >= durationSeconds) {
      break;
    }
    yield {
      progress: elapsedSeconds / durationSeconds,
      secondsDelta,
    };
  }
}

export function progressSmooth(x) {
  return x < 0.5 ? x ** 2 * 2 : 1 - (1 - x) ** 2 * 2;
}

export function progressUpDown(x) {
  return x < 0.5 ? x * 2 : (1 - x) * 2;
}

export function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}

export async function sleepSeconds(durationSeconds) {
  let elapsedSeconds = 0;
  while (true) {
    elapsedSeconds += await Engine.nextFrame;
    if (elapsedSeconds >= durationSeconds) {
      break;
    }
  }
}

export const never = new Promise(resolve => {});
