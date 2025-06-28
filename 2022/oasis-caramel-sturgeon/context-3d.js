import {Pool} from './pool.js';

const zZoom = 400;

export class Context3d {
  #pools;
  #queue;
  #queueLength;
  #lastFillColour;
  #lastStrokeColour;
  #lastLineWidth;

  constructor(canvas, camera) {
    this.context2d = canvas.getContext('2d');
    this.camera = camera;
    this.#pools = new Map();
    this.#queue = [];
    this.#queueLength = 0;
    this.#lastFillColour = null;
    this.#lastStrokeColour = null;
    this.#lastLineWidth = null;

    this.width = canvas.width;
    this.height = canvas.height;
    const screenBoxResult = [0, 0, 0];
    this.boxToScreenBox = (position, boxWidth=0, boxHeight=0) => {
      const zDiv = position.z / zZoom;
      screenBoxResult[0] = this.width / 2 + position.x / zDiv;
      screenBoxResult[1] = this.height / 2 + position.y / zDiv;
      screenBoxResult[2] = boxWidth / zDiv;
      screenBoxResult[3] = boxHeight / zDiv;
      return screenBoxResult;
    };
  }
  
  add(ShapeType) {
    if (!this.#pools.has(ShapeType)) {
      this.#pools.set(ShapeType, new Pool(() => new ShapeType()));
    }
    const shape = this.#pools.get(ShapeType).acquire();
    if (this.#queueLength < this.#queue.length) {
      this.#queue[this.#queueLength] = shape;
    } else {
      this.#queue.push(shape);
    }
    ++this.#queueLength;
    return shape;
  }
  
  processQueue(context, camera) {
    this.#cameraTransformQueue(camera);
    this.#sortQueue();
    this.#drawQueue();
    this.#clearQueue();
  }
  
  setFillColour(colour) {
    if (this.#lastFillColour != colour) {
      this.context2d.fillStyle = colour;
    }
    this.#lastFillColour = colour;
  }
  
  setStrokeColour(colour) {
    if (this.#lastStrokeColour != colour) {
      this.context2d.strokeStyle = colour;
    }
    this.#lastStrokeColour = colour;
  }
  
  setLineWidth(lineWidth) {
    if (this.#lastLineWidth != lineWidth) {
      this.context2d.lineWidth = lineWidth;
    }
    this.#lastLineWidth = lineWidth;
  }
  
  #cameraTransformQueue() {
    let index = 0;
    while (index < this.#queueLength) {
      const shape = this.#queue[index];
      shape.applyCameraTransform(this.camera);
      if (shape.getZ() >= this.camera.zNear) {
        ++index;
      } else {
        --this.#queueLength;
        [this.#queue[index], this.#queue[this.#queueLength]] = [this.#queue[this.#queueLength], this.#queue[index]]
      }
    }
  }
  
  #sortQueue() {
    this.#queue.length = this.#queueLength;
    this.#queue.sort((a, b) => b.getZ() - a.getZ());
  }
  
  #drawQueue() {
    this.context2d.clearRect(0, 0, this.width, this.height);
    for (const shape of this.#queue) {
      shape.draw(this);
    }
  }
  
  #clearQueue() {
    this.#queueLength = 0;
    for (const pool of this.#pools.values()) {
      pool.releaseAll();
    }
  }
}
