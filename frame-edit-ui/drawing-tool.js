import {createObservableJsonProxy, read} from './third-party/rojs/src/observable-json.js';

import {FrameViewer} from './frame-viewer.js';

export class DrawingTool {
  static model = createObservableJsonProxy({
    colour: 'white',
    penSize: 4,
  });

  static init() {
    registerPointerEvents(FrameViewer.view.canvas, {
      click: this.drawDot.bind(this),
      dragStart: this.drawStart.bind(this),
      dragMove: this.drawMove.bind(this),
      dragEnd: this.drawEnd.bind(this),
    });
  }

  static drawDot(x, y) {
    const penSize = read(this.model.penSize);
    FrameViewer.mutateSelectedFrame(context => {
      context.fillStyle = read(this.colour);
      context.fillRect(
        x - penSize / 2,
        y - penSize / 2,
        penSize,
        penSize,
      );
    });
  }

  static drawStart(x, y) {
  }

  static drawMove(x, y, prevX, prevY) {
    FrameViewer.mutateSelectedFrame(context => {
      context.strokeStyle = read(this.model.colour);
      context.lineWidth = read(this.model.penSize);
      context.beginPath();
      context.moveTo(prevX, prevY);
      context.lineTo(x, y);
      context.stroke();
    });
  }

  static drawEnd(x, y) {
  }
}

function registerPointerEvents(element, {click, dragStart, dragMove, dragEnd}) {
  let dragging = false;
  let down = false;
  let downX = null;
  let downY = null;
  element.addEventListener('pointerdown', ({offsetX: x, offsetY: y}) => {
    if (down) {
      return;
    }
    down = true;
    downX = x;
    downY = y;
  });
  element.addEventListener('pointermove', ({offsetX: x, offsetY: y}) => {
    if (!down) {
      return;
    }
    if (!dragging) {
      if (downX === x && downY === y) {
        return;
      }
      dragging = true;
      dragStart(downX, downY);
    }
    dragMove(x, y, downX, downY);
    downX = x;
    downY = y;
  });
  element.addEventListener('pointerup', ({offsetX: x, offsetY: y}) => {
    if (!down) {
      return;
    }
    down = false;
    if (dragging) {
      dragging = false;
      dragEnd(x, y);
    } else {
      click(x, y);
    }
  });
}
