import {createObservableJsonProxy, read} from './third-party/rojs/src/observable-json.js';

export class AnimationData {
  static width = 640;
  static height = 480;
  static frames = [
    this.createFrame(),
  ];

  static createFrame() {
    const canvas = new OffscreenCanvas(this.width, this.height);
    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  }
}

