import {createObservableJsonProxy, read} from './third-party/rojs/src/observable-json.js';

import {AnimationData} from './animation-data.js';

export class FrameViewer {
  static model = createObservableJsonProxy({
    selectedFrameIndex: 0,
  });

  static view = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = AnimationData.width;
    canvas.height = AnimationData.height;
    canvas.style.borderStyle = 'solid';
    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  })();

  static mutateSelectedFrame(f) {
    const selectedFrameIndex = read(this.model.selectedFrameIndex);
    f(AnimationData.frames[selectedFrameIndex].context);
    this.renderFrame(selectedFrameIndex);
  }

  static renderFrame(frameIndex=read(this.model.selectedFrameIndex)) {
    this.view.context.clearRect(0, 0, this.view.canvas.width, this.view.canvas.height);
    this.view.context.drawImage(AnimationData.frames[frameIndex].canvas, 0, 0);
  }
}
