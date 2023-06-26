import {createObservableJsonProxy, read, write} from './third-party/rojs/src/observable-json.js';
import {htmlIf} from './third-party/rojs/src/render.js';
import {button} from './third-party/rojs/src/render-helpers.js';

import {AnimationData} from './animation-data.js';
import {FrameViewer} from './frame-viewer.js';

export class AnimationPlayer {
  static model = createObservableJsonProxy({
    playing: false,
    framesPerSecond: 6,
  });

  static uiTemplate = htmlIf(this.model.playing,
    button('Pause', this.pause.bind(this)),
    button('Play', this.play.bind(this)),
  );

  static pause() {
    write(this.model.playing, false);
  }

  static play() {
    if (read(this.model.playing)) {
      return;
    }

    write(this.model.playing, true);
    (async () => {
      let startTime = null;
      while (true) {
        if (!read(this.model.playing)) {
          break;
        }
        const time = await new Promise(requestAnimationFrame);
        if (startTime === null) {
          startTime = time;
        }
        const currentFrame = Math.floor((time - startTime) / 1000 * read(this.model.framesPerSecond));
        if (currentFrame >= AnimationData.frames.length) {
          write(this.model.playing, false);
          break;
        }
        FrameViewer.renderFrame(currentFrame);
      }
      FrameViewer.renderFrame();
    })();
  }
}