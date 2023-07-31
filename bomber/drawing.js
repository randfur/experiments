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
      midZ: 0,
    }));
    this.lines = [];
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

  static addPath(vs, width, colour, closed=false) {
    const end = vs.length + (closed ? 0 : -1);
    for (let i = 0; i < end; ++i) {
      const line = this.addLine();
      line.start.set(vs[i]);
      line.end.set(vs[(i + 1) % vs.length]);
      line.width = width;
      line.colour = colour;
    }
  }

  static draw() {
    for (let i = 0; i < this.lines.length;) {
      const line = this.lines[i];
      if (Camera.transformLine(line)) {
        ++i;
      } else {
        this.lines[i] = this.lines[this.lines.length - 1];
        this.lines.length -= 1;
      }
    }
    this.lines.sort((a, b) => b.midZ - a.midZ);

    const diff = Vec3.pool.acquire();
    for (const line of this.lines) {
      if (line.width === 0) {
        continue;
      }
      diff.assignSubtract(line.end, line.start);
      const length = diff.length();
      if (length === 0) {
        continue;
      }
      this.context.strokeStyle = line.colour;
      this.context.lineWidth = line.width;
      this.context.beginPath();
      this.context.moveTo(
        this.width / 2 + line.start.x,
        this.height / 2 + line.start.y,
      );
      this.context.lineTo(
        this.width / 2 + line.end.x + diff.x / length,
        this.height / 2 + line.end.y + diff.y / length,
      );
      this.context.stroke();
    }
    Vec3.pool.release(1);
  }
}

