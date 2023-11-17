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

export async function* frameRange(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
    await Engine.nextFrame;
  }
}

export async function* frameRangeProgress(n) {
  for await (const i of frameRange(n)) {
    yield i / n;
  }
}

export function progressSmooth(x) {
  return x < 0.5 ? x ** 2 * 2 : 1 - (1 - x) ** 2 * 2;
}

export function progressUpDown(x) {
  return x < 0.5 ? x * 2 : 1 - (1 - x) * 2;
}

export function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}

export async function sleepFrames(n) {
  for (let i = 0; i < n; ++i) {
    await Engine.nextFrame;
  }
}

export const never = new Promise(resolve => {});
