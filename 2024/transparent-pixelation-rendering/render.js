const kPixelationBufferDrawn = 1 << 0;
const kMergeBufferDrawn = 1 << 1;

class Render {
  constructor(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.pixelationCanvas = new OffscreenCanvas(this.width, this.height);
    this.pixelationCanvasPixelSize = null;
    this.mergeCanvasStack = [canvas];
    canvas.initialised = true;
  }

  draw(drawing) {
    const drawn = this.drawDrawing(drawing, 0);
    this.flushPixelationCanvas(drawn, 0)
  }

  drawDrawing(drawing, mergeCanvasIndex) {
    if (drawing.drawings) {
      return this.drawGroup(drawing, mergeCanvasIndex);
    }
    return this.drawEmoji(drawing, mergeCanvasIndex);
  }

  drawGroup(groupDrawing, mergeCanvasIndex, depth) {
    if (groupDrawing.alpha === 1) {
    }
  }
}

  // drawGroup(groupDrawing, mergeCanvasIndex, depth) {
  //   if (groupDrawing.alpha === 1) {
  //     for (const drawing of groupDrawing.drawings) {
  //       this.drawDrawing(drawing, mergeCanvasIndex);
  //     }
  //   }

  //   this.flushPixelationCanvas(mergeCanvasIndex);
  //   this.ensureMergeCanvasCleared(mergeCanvasIndex + 1);

  //   for (const drawing of groupDrawing.drawings) {
  //     this.drawDrawing(drawing, mergeCanvasIndex + 1);
  //   }

  //   if (this.mergeCanvasStack[mergeCanvasIndex + 1]?.initialised) {
  //     this.flushPixelationCanvas(mergeCanvasIndex + 1);
  //     this.ensureMergeCanvasCleared(mergeCanvasIndex);
  //     this.composite(this.mergeCanvasStack[mergeCanvasIndex + 1], this.mergeCanvasStack[mergeCanvasIndex], groupDrawing.alpha, 1);
  //   } else if (pixelationCanvasPixelSize !== null) {
  //     this.composite(pixelationCanvas, mergeCanvasIndex, groupDrawing.alpha, pixelationCanvasPixelSize);
  //     this.clearPixelationCanvas();
  //   }
  // }

  // drawEmoji(emojiDrawing, mergeCanvasIndex) {
  //   if (pixelationCanvasPixelSize !== null && pixelationCanvasPixelSize !== emojiDrawing.pixelSize) {
  //     this.ensureMergeCanvasInitialised(mergeCanvasIndex);

  //   }
  // }

