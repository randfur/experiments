import {Vec3} from './vec3.js';
import {Camera} from './camera.js';

export class Drawing {
  static canvas;
  static context;
  static width;
  static height;
  static linePool;
  static lines;
  static camera;

  static init() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    document.body.style.cssText = `
      background-color: black;
      margin: 0;
      padding: 0;
      overflow: hidden;
      touch-action: pinch-zoom;
    `;
    this.context = this.canvas.getContext('2d');

    this.linePool = [];
    this.lines = [];

    this.camera = new Camera();
  }

  static clear() {
    this.lines.length = 0;
    this.context.clearRect(0, 0, this.width, this.height);
  }

  static addLine() {
    if (this.lines.length >= this.linePool.length) {
      this.linePool.push({
        start: new Vec3(),
        end: new Vec3(),
        size: new Vec3(),
        colour: new Vec3(),
        midZ: 0,
      });
    }
    const line = this.linePool[this.lines.length];
    this.lines.push(line);
    return line;
  }

  static draw() {
    for (const line of this.lines) {
      this.context.strokeStyle = line.colour;
      this.context.lineWidth = line.width;
      this.context.beginPath();
      this.context.moveTo(line.start.x, line.start.y);
      this.context.lineTo(line.end.x, line.end.y);
      this.context.stroke();
    }
  }
}

