import {HexLines2d} from './third-party/hex-lines/src/2d/hex-lines-2d.js';
import {LineDrawing} from './third-party/hex-lines/src/2d/line-drawing.js';
import {GroupDrawing} from './third-party/hex-lines/src/2d/group-drawing.js';

export class Engine {
  static deathSignal = Symbol('deathSignal');
  static forever = new Promise(resolve => {});

  static init() {
    ({
      hexLines2d: this.hexLines2d,
      width: this.width,
      height: this.height,
    } = HexLines2d.setupFullPageCanvas());

    this.drawing = new GroupDrawing({
      pixelSize: 4,
      children: [],
    });

    ({
      promise: this.nextFrame,
      resolve: this.resolveNextFrame,
    } = Promise.withResolvers());

    this.entities = [];
  }

  static async add(entity) {
    this.entities.push(entity);
    try {
      await entity.run?.();
      entity.destroy();
    } catch (error) {
      if (error !== this.deathSignal) {
        throw error;
      }
    }
  }

  static async run() {
    while (this.entities.length > 0) {
      const time = await new Promise(requestAnimationFrame);

      this.resolveNextFrame(time);
      ({
        promise: this.nextFrame,
        resolve: this.resolveNextFrame,
      } = Promise.withResolvers());
      this.entities = this.entities.filter(entity => entity.alive);

      this.drawing.children = [];
      for (const entity of this.entities) {
        const drawing = entity.draw?.();
        if (drawing) {
          this.drawing.children.push(drawing);
        }
      }
      this.hexLines2d.draw(this.drawing);
    }
  }
}
