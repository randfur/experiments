const scale = 4;
export const width = Math.ceil(window.innerWidth / scale);
export const height = Math.ceil(window.innerHeight / scale);
export const canvas = document.getElementById('canvas');
export const context = canvas.getContext('2d');

export const stainCanvas = new OffscreenCanvas(width, height);
export const stainContext = stainCanvas.getContext('2d');

export const drawFuncSet = new Set();

const drawKey = Symbol('draw');

export function draw(drawFunc) {
  drawFuncSet.add(drawFunc);
  return {
    key: drawKey,
    cleanUp() {
      drawFuncSet.delete(drawFunc);
    },
  };
}

export async function initDrawing() {
  canvas.width = width;
  canvas.height = height;
  canvas.style.transformOrigin = 'left top';
  canvas.style.transform = `scale(${scale})`;
  canvas.style.imageRendering = 'pixelated';

  while (true) {
    await new Promise(requestAnimationFrame);
    context.clearRect(0, 0, width, height);

    context.drawImage(stainCanvas, 0, 0);
    
    for (const drawFunc of drawFuncSet) {
      drawFunc(context);
    }
  }
}
