import {HexLines2d} from './third-party/hex-lines/src/2d/hex-lines-2d.js';
import {LineDrawing} from './third-party/hex-lines/src/2d/line-drawing.js';
import {GroupDrawing} from './third-party/hex-lines/src/2d/group-drawing.js';

export class Engine {
  static hexLines2d;
  static width;
  static height;

  static nextFrame;
  static resolveNextFrame;

  static deathSignal = Symbol('deathSignal');
  static forever = new Promise(resolve => {});

  static entities = [];
  static drawing = new GroupDrawing({
    pixelSize: 4,
    children: [],
  });

  static init() {
    ({
      hexLines2d: this.hexLines2d,
      width: this.width,
      height: this.height,
    } = HexLines2d.setupFullPageCanvas());

    ({
      promise: this.nextFrame,
      resolve: this.resolveNextFrame,
    } = Promise.withResolvers());
  }

  static async add(entity) {
    this.entities.push(entity);
    try {
      await entity.run?.();
    } catch (error) {
      if (error !== this.deathSignal) {
        throw error;
      }
    } finally {
      entity.destroy();
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
