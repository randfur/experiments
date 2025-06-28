import {removeItem} from '../utils.js';

export class Drawing {
  #drawHandles;

  constructor({game, container, viewScale, clearFrames}) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.transformOrigin = 'top left';
    canvas.style.transform = `scale(${viewScale})`;
    canvas.style.imageRendering = 'pixelated';
    container.style.overflow = 'hidden';
    container.style.margin = '0px';
    container.appendChild(canvas);
    const context = canvas.getContext('2d');
    
    const resize = rect => {
      this.width = Math.floor(rect.width / viewScale);
      this.height = Math.floor(rect.height / viewScale);
    };
    new ResizeObserver(entries => {
      resize(entries.pop().contentRect);
    }).observe(container);
    resize(container.getBoundingClientRect());

    this.#drawHandles = [];
    
    (async () => {
      while (!game.isDone) {
        await game.nextTick;
        if (this.width !== canvas.width || this.height !== canvas.height) {
          canvas.width = this.width;
          canvas.height = this.height;
        }
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