export class AnimationData {
  constructor() {
    this.width = 640;
    this.height = 480;
    this.frames = [
      this.createFrame(),
    ];
  }

  createFrame() {
    const canvas = new OffscreenCanvas(this.width, this.height);
    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  }
}

