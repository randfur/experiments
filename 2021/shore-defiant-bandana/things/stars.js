import {context, width, height} from '../engine/canvas.js';
import {sleep, animateTo} from '../engine/clock.js';
import {TAU, drawAll} from '../engine/utils.js';

class Star {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = 0.5 + Math.random() * 2;
    
    this.alpha = Math.random();
    (async () => {
      await sleep(Math.random() * 60);
      while (true) {
        await animateTo({
          initial: this.alpha,
          target: Math.random(),
          setValue: x => this.alpha = x,
          duration: Math.random() * 0.5,
        });
        await sleep(5 + Math.random() * 30);
      }
    })();
  }
  
  draw() {
    context.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    context.save();
    context.translate(this.x, this.y);
    context.rotate(TAU / 8);
    context.fillRect(0, 0, this.size, this.size);
    context.restore();
  }
}

export class Stars {
  static density = (1 / 60) ** 2;
  static count = Math.round(width * height * Stars.density);
  static list = [];
  
  static init() {
    for (let i = 0; i < Stars.count; ++i) {
      Stars.list.push(new Star());
    }
  }
  
  static draw() {
    drawAll(Stars.list);
  }
}

