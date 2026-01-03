import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Temp} from '../../third-party/ga/temp.js';

export class Engine {
  static init() {
    this.entities = new Set();
    const {
      width,
      height,
      hexLinesContext,
    } = HexLinesContext.setupFullPageContext({
      is3d: true,
      pixelSize: 4,
    });
    this.width = width;
    this.height = height;
    this.hexLinesContext = hexLinesContext;
    this.hexLines = hexLinesContext.createLines();
    this.seconds = 0;
    this.nextFrame = this.nextFramePromise();
  }

  static async nextFramePromise() {
    const newSeconds = (await new Promise(requestAnimationFrame)) / 1000;
    const secondsDelta = Math.min(1 / 30, newSeconds - this.seconds);
    this.seconds = newSeconds;
    return secondsDelta;
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
      const secondsDelta = await this.nextFrame;
      this.nextFrame = this.nextFramePromise();
      Temp.reclaimAll();
      this.hexLines.clear();
      for (const entity of this.entities) {
        entity.step?.(secondsDelta);
        entity.draw?.(this.hexLines);
      }
      this.hexLines.draw();
    }
  }
}
