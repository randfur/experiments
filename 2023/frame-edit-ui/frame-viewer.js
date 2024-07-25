import {read, Component} from '../third-party/rojs/src/rojs.js';

export class FrameViewer extends Component {
  constructor() {
    super({
      model: {
        selectedFrameIndex: 0,
      },
    });
    this.canvas = document.createElement('canvas');
    this.canvas.style.borderStyle = 'solid';
    this.context = this.canvas.getContext('2d');
    this.view = this.canvas;
  }

  bundleInit() {
    this.canvas.width = this.bundle.animationData.width;
    this.canvas.height = this.bundle.animationData.height;
  }

  mutateSelectedFrame(f) {
    const selectedFrameIndex = read(this.model.selectedFrameIndex);
    f(this.bundle.animationData.frames[selectedFrameIndex].context);
    this.renderFrame(selectedFrameIndex);
  }

  renderFrame(frameIndex=read(this.model.selectedFrameIndex)) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.bundle.animationData.frames[frameIndex].canvas, 0, 0);
  }
}
