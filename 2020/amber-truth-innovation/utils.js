export const TAU = Math.PI * 2;
export const width = window.innerWidth;
export const height = window.innerHeight;

const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
export let context = canvas.getContext('2d');

export let debug = false;

export function toggleDebug() {
  debug ^= true;
}
