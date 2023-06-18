import {read, write, readWrite} from './third-party/rojs/src/observable-json.js';

import {Model} from './model.js';
import {View} from './view.js';

export class Controller {
  static prevFrame() {
    readWrite(Model.ui.selectedFrame, selectedFrame => {
      return Math.min(Math.max(selectedFrame - 1, 0), Model.frames.length - 1);
    });
    View.renderFrame();
  }

  static nextFrame() {
    readWrite(Model.ui.selectedFrame, selectedFrame => {
      return Math.min(Math.max(selectedFrame + 1, 0), Model.frames.length - 1);
    });
    View.renderFrame();
  }

  static addFrame() {
    readWrite(Model.ui.selectedFrame, selectedFrame => selectedFrame + 1);
    Model.frames.splice(read(Model.ui.selectedFrame), 0, Model.createFrame());
    View.renderFrame();
  }

  static duplicateFrame() {
    const currentFrame = Model.getSelectedFrame();
    readWrite(Model.ui.selectedFrame, selectedFrame => selectedFrame + 1);
    Model.frames.splice(read(Model.ui.selectedFrame), 0, Model.createFrame());
    const newFrame = Model.getSelectedFrame();
    newFrame.context.drawImage(currentFrame.canvas, 0, 0);
    View.renderFrame();
  }

  static deleteFrame() {
    if (Model.frames.length === 1) {
      Model.frames[0] = Model.createFrame();
      View.renderFrame();
      return;
    }
    Model.frames.splice(read(Model.ui.selectedFrame), 1);
    readWrite(Model.ui.selectedFrame, selectedFrame => {
      return Math.min(selectedFrame, Model.frames.length - 1);
    });
    View.renderFrame();
  }

  static pause() {
    write(Model.ui.playing, false);
  }

  static play() {
    const playing = Model.ui.playing;

    if (read(playing)) {
      return;
    }

    write(playing, true);
    (async () => {
      let startTime = null;
      while (true) {
        if (!read(playing)) {
          break;
        }
        const time = await new Promise(requestAnimationFrame);
        if (startTime === null) {
          startTime = time;
        }
        const currentFrame = Math.floor((time - startTime) / 1000 * Model.framesPerSecond);
        if (currentFrame >= Model.frames.length) {
          write(playing, false);
          break;
        }
        View.renderFrame(currentFrame);
      }
      View.renderFrame();
    })();
  }

  static setColour(colour) {
    write(Model.ui.colour, colour);
  }

  static drawDot(x, y) {
    console.log('drawDot')
    const context = Model.getSelectedFrame().context;
    context.fillStyle = read(Model.ui.colour);
    context.fillRect(
      x - Model.penSize / 2,
      y - Model.penSize / 2,
      Model.penSize,
      Model.penSize,
    );
    View.renderFrame();
  }

  static drawStart(x, y) {
  }

  static drawMove(x, y, prevX, prevY) {
    const context = Model.getSelectedFrame().context;
    context.strokeStyle = read(Model.ui.colour);
    context.lineWidth = Model.penSize;
    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(x, y);
    context.stroke();
    View.renderFrame();
  }

  static drawEnd(x, y) {
  }

}