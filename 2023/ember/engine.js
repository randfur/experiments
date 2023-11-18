import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';
import {Vec3} from './vec3.js';
import {Rotor3} from './rotor3.js';

export class Engine {
  static init() {
    this.entities = new Set();
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
    this.entities.add(entity);
    entity.done = false;
    await entity.run();
    entity.done = true;
    this.entities.delete(entity);
  }

  static async run() {
    while (true) {
      await this.nextFrame;
      this.nextFrame = new Promise(requestAnimationFrame);
      Vec3.clearTemps();
      Rotor3.clearTemps();
      this.hexLines.clear();
      for (const entity of this.entities) {
        entity.step?.();
        entity.draw?.(this.hexLines);
      }
      this.hexLines.draw();
    }
  }
}
