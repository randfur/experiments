import {read, write, htmlIf, Component, button} from '../../third-party/rojs/src/rojs.js';

export class AnimationPlayer extends Component {
  constructor() {
    super({
      model: {
        playing: false,
        framesPerSecond: 6,
      },
    });

    this.view = htmlIf(this.model.playing,
      button('Pause', () => this.pause()),
      button('Play', () => this.play()),
    );
  }

  pause() {
    write(this.model.playing, false);
  }

  play() {
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
        if (currentFrame >= this.bundle.animationData.frames.length) {
          write(this.model.playing, false);
          break;
        }
        this.bundle.frameViewer.renderFrame(currentFrame);
      }
      this.bundle.frameViewer.renderFrame();
    })();
  }
}