import {read, write} from './third-party/rojs/src/observable-json.js';

import {Model} from './model.js';
import {View} from './view.js';

export class Controller {
  static prevFrame() {
    console.log('TODO: prevFrame');
  }

  static nextFrame() {
    console.log('TODO: nextFrame');
  }

  static deleteFrame() {
    console.log('TODO: deleteFrame');
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
        if (currentFrame >= frames.length) {
          write(playing, false);
          break;
        }
        View.renderFrame(currentFrame);
      }
      View.renderFrame(read(Model.ui.selectedFrame));
    })();
  }

  static setColour(colour) {
    write(Model.ui.colour, colour);
  }
}