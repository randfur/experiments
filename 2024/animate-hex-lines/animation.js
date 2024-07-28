export class Animation {
  constructor(hexLines2d, animationData) {
    this.hexLines2d = hexLines2d;
    this.animationData = animationData;
    this.lineBufferMap = {};
    for (const [lineBufferId, lineBufferData] of Object.entries(this.animationData.lineBufferDataMap)) {
      const lineBuffer = this.hexLines2d.createLineBuffer();
      lineBuffer.addRawPointsData(lineBufferData);
      this.lineBufferMap[lineBufferId] = lineBuffer;
    }
  }

  draw(timeSeconds) {
    this.hexLines2d.draw(this.buildSpriteDrawing('', timeSeconds));
  }

  buildSpriteDrawing(spriteId, timeSeconds) {
    const sprite = this.animationData.spriteMap[spriteId];
    const guideDrawing
    const groupDrawing = new GroupDrawing({
      pixelSize: sprite.pixelSize,
      children: [
      ],
    });
  }
}
