import {MouseHandler, MouseEventType, MouseButton} from '../ui/Mouse';
export const TAU = Math.PI * 2;

export function random(x: number): number {
  return Math.random() * x;
}

export function randomLow(x: number): number {
  return Math.random() * Math.random() * x;
}

export function randomMid(x: number): number {
  return (Math.random() + Math.random()) * x / 2;
}

export function randomHigh(x: number): number {
  return (1 - Math.random() * Math.random()) * x;
}

export function randomRange(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

export function deviate(x: number): number {
  return (Math.random() * 2 - 1) * x;
}

export function deviateMid(x: number): number {
  return ((Math.random() + Math.random()) - 1) * x;
}

export function range(n: number): number[] {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

export function handleMouseForAll(mouseables: MouseHandler[], type: MouseEventType, button: MouseButton | null) {
  for (const mouseable of mouseables) {
    if (mouseable.handleMouse(type, button)) {
      return true;
    }
  }
  return false;
}

interface Drawable { draw(): void }
export function drawAll(drawables: Drawable[]) {
  for (const drawable of drawables) {
    drawable.draw();
  }
}