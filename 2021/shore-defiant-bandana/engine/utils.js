export const TAU = Math.PI * 2;

export function drawAll(things) {
  for (const thing of things) {
    thing.draw();
  }
}