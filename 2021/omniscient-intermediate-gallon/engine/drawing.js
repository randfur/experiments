import {removeItems} from '../utils.js';

export class Drawing {
  #drawHandles;

  constructor({game, clearFrames, viewScale}) {
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    game.canvas.style.transformOrigin = 'top left';
    game.canvas.style.transform = `scale(${viewScale})`;
    game.canvas.style.imageRendering = 'pixelated';
    this.context = game.canvas.getContext('2d');
    
    this.#drawHandles = [];
    
    (async () => {
      while (!game.stopped) {
        await game.nextTickPromise;
        if (clearFrames) {
          this.context.clearRect(0, 0, game.width, game.height);
        }
        removeItems(this.#drawHandles, drawHandle => drawHandle.stopped);
        this.#drawHandles.sort((a, b) => b.zIndex - a.zIndex);
        for (const drawHandle of this.#drawHandles) {
          drawHandle.draw(this.context);
        }
      }
    })();
  }
  
  register(job, drawFunc) {
    const drawHandle = {
      zIndex: 0,
      draw: drawFunc,
      stopped: false,
    };
    this.#drawHandles.push(drawHandle);
    job.addCleanUp(() => {
      drawHandle.stopped = true;
    });
    return drawHandle;
  }
}