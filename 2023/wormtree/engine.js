import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';
import {Vec3} from './vec3.js';

export class Engine {
  static init() {
    this.entityList = [];
    const {
      width,
      height,
      hexLinesContext,
    } = HexLinesContext.setupFullPageContext({
      is3d: true,
      pixelSize: 1,
    });
    this.width = width;
    this.height = height;
    this.hexLinesContext = hexLinesContext;
    this.hexLines = hexLinesContext.createLines();
    this.nextFrame = new Promise(requestAnimationFrame);
  }

  static async add(entity) {
    this.entityList.push(entity);
    entity.done = false;
    await entity.run();
    entity.done = true;
    this.entityList.splice(this.entityList.indexOf(entity), 1);
  }

  static async run() {
    while (true) {
      await this.nextFrame;
      this.nextFrame = new Promise(requestAnimationFrame);
      Vec3.pool.clear();
      this.hexLines.clear();
      for (const entity of this.entityList) {
        entity.step?.();
        entity.draw?.(this.hexLines);
      }
      this.hexLines.draw();
    }
  }
}
