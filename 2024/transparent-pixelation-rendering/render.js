const TAU = Math.PI * 2;

export class Render {
  constructor(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.canvasStack = [canvas];
  }

  draw(drawing) {
    this.canvasStack[0].getContext('2d').reset();
    this.drawDrawing(drawing, 0, 1);
  }

  drawDrawing(drawing, stackIndex, pixelSize) {
    if (drawing.drawings) {
      this.drawGroup(drawing, stackIndex, pixelSize);
      return;
    }
    this.drawImage(drawing, stackIndex, pixelSize);
  }

  drawGroup(groupDrawing, stackIndex, pixelSize) {
    if (groupDrawing.alpha === 1 && groupDrawing.pixelSize <= pixelSize) {
      for (const drawing of groupDrawing.drawings) {
        this.drawDrawing(drawing, stackIndex, pixelSize);
      }
      return;
    }

    const nextStackIndex = stackIndex + 1;
    if (this.canvasStack.length <= nextStackIndex) {
      this.canvasStack.push(new OffscreenCanvas(this.width, this.height));
    }
    const nextCanvas = this.canvasStack[nextStackIndex];
    const nextContext = nextCanvas.getContext('2d');
    nextContext.reset();
    for (const drawing of groupDrawing.drawings) {
      this.drawDrawing(drawing, nextStackIndex, groupDrawing.pixelSize);
    }
    const canvas = this.canvasStack[stackIndex];
    const context = canvas.getContext('2d');
    context.save();
    context.globalAlpha = groupDrawing.alpha;
    context.imageSmoothingEnabled = false;
    const scale = groupDrawing.pixelSize / pixelSize;
    context.scale(scale, scale);
    context.drawImage(nextCanvas, 0, 0);
    context.restore();
  }

  drawImage(imageDrawing, stackIndex, pixelSize) {
    const canvas = this.canvasStack[stackIndex];
    const context = canvas.getContext('2d');
    context.fillStyle = imageDrawing.colour;
    context.beginPath();
    context.arc(
      imageDrawing.x / pixelSize,
      imageDrawing.y / pixelSize,
      imageDrawing.size / pixelSize,
      0,
      TAU,
    );
    context.fill();
  }
}
