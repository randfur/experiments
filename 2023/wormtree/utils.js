import {Engine} from './engine.js';

export function random(x) {
  return Math.random() * x;
}

export function randomRange(a, b) {
  return a + random(b - a);
}

export async function* frameRange(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
    await Engine.nextFrame;
  }
}

export function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}

export function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export never = new Promise(resolve => {});
