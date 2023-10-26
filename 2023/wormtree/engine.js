import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';

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
  }

  static async spawn(EntityType) {
    const entity = new EntityType();
    this.entityList.push(entity);
    await entity.run();
    this.entityList.splice(entityList.indexOf(entity), 1);
  }

  static async run() {
    while (true) {
      await new Promise(requestAnimationFrame);
      this.hexLines.clear();
      for (const entity of this.entityList) {
        entity.draw?.(this.hexLines);
      }
      this.hexLines.draw();
    }
  }
}
