import {removeItem} from '../utils.js';

export class Drawing {
  #drawHandles;

  constructor({game, canvas, viewScale, clearFrames}) {
    canvas.width = game.width;
    canvas.height = game.height;
    canvas.style.transformOrigin = 'top left';
    canvas.style.transform = `scale(${viewScale})`;
    canvas.style.imageRendering = 'pixelated';
    const context = canvas.getContext('2d');
    
    this.#drawHandles = [];
    
    (async () => {
      while (!game.isDone) {
        await game.nextTick;
        if (clearFrames) {
          context.clearRect(0, 0, game.width, game.height);
        }
        for (const drawHandle of this.#drawHandles) {
          drawHandle.draw(context, game.width, game.height);
        }
      }
    })();
  }
  
  register(job, drawFunc) {
    const drawHandle = {
      zIndex: 0,
      draw: drawFunc,
      remove: () => {
        removeItem(this.#drawHandles, drawHandle);
      },
    }
    this.#drawHandles.push(drawHandle);
    job.addCleanUp(drawHandle.remove);
    return drawHandle;
  }
}