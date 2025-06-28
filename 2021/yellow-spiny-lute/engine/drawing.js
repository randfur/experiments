import {removeItem} from '../utils.js';

export class Drawing {
  #drawHandles;

  constructor(game, clearFrames) {
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    const context = game.canvas.getContext('2d');
    
    this.#drawHandles = [];
    
    (async () => {
      while (!game.stopped) {
        await game.nextTickPromise;
        if (clearFrames) {
          context.clearRect(0, 0, game.width, game.height);
        }
        for (const drawHandle of this.#drawHandles) {
          drawHandle.draw(context);
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