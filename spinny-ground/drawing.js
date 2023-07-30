import {Pool} from './pool.js';
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

    this.linePool = new Pool(() => ({
      start: new Vec3(),
      end: new Vec3(),
      width: 0,
      colour: '',
    }));
    this.lines = [];

    this.camera = new Camera();
  }

  static clear() {
    this.lines.length = 0;
    this.linePool.releaseAll();
    this.context.clearRect(0, 0, this.width, this.height);
  }

  static addLine() {
    const line = this.linePool.acquire();
    this.lines.push(line);
    return line;
  }

  static draw() {
    for (let i = 0; i < this.lines.length;) {
      const line = this.lines[i];
      if (this.camera.transformLine(line)) {
        ++i;
      } else {
        this.lines[i] = this.lines[this.lines.length - 1];
        this.lines.length -= 1;
      }
    }
    this.lines.sort((a, b) => a.z - b.z);

    for (const line of this.lines) {
      this.context.strokeStyle = line.colour;
      this.context.lineWidth = line.width;
      this.context.beginPath();
      this.context.moveTo(
        this.width / 2 + line.start.x,
        this.height / 2 + line.start.y,
      );
      this.context.lineTo(
        this.width / 2 + line.end.x,
        this.height / 2 + line.end.y,
      );
      this.context.stroke();
    }
  }
}

