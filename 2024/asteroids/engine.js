import {HexLines2d} from './third-party/hex-lines/src/2d/hex-lines-2d.js';
import {LineDrawing} from './third-party/hex-lines/src/2d/line-drawing.js';
import {GroupDrawing} from './third-party/hex-lines/src/2d/group-drawing.js';
import {discardDeathSignal} from './utils.js';

export class Engine {
  static hexLines2d;
  static width;
  static height;
  static time = 0;

  static nextFrame;
  static resolveNextFrame;

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

  static add(entity) {
    (async () => {
      this.entities.push(entity);
      await discardDeathSignal(entity.run());
      entity.destroy();
    })();
    return entity;
  }

  static async run() {
    while (this.entities.length > 0) {
      this.time = await new Promise(requestAnimationFrame);

      this.resolveNextFrame(this.time);
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
