import {HexLinesContext, rgbaToFloat32} from './third-party/hex-lines/src/hex-lines.js';

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
    this.hexLinesHandle = new HexLinesContext({
      canvas: this.canvas,
    }).add(new Float32Array());

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
    // this.context.clearRect(0, 0, this.width, this.height);
  }

  static addLine() {
    const line = this.linePool.acquire();
    this.lines.push(line);
    return line;
  }

  static addPath(vs, width, r, g, b, a, closed=false) {
    const end = vs.length + (closed ? 0 : -1);
    for (let i = 0; i < end; ++i) {
      const line = this.addLine();
      line.start.set(vs[i]);
      line.end.set(vs[(i + 1) % vs.length]);
      line.width = width;
      line.r = r;
      line.g = g;
      line.b = b;
      line.a = a;
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
    const buffer = new Float32Array(this.lines.length * 3 * 4);
    let i = 0;
    for (const line of this.lines) {
      if (line.width === 0) {
        i += 3;
        continue;
      }
      diff.assignSubtract(line.end, line.start);
      const length = diff.length();
      if (length === 0) {
        i += 3;
        continue;
      }
      buffer[i * 4 + 0] = this.width / 2 + line.start.x;
      buffer[i * 4 + 1] = this.height / 2 + line.start.y;
      buffer[i * 4 + 2] = line.width;
      buffer[i * 4 + 3] = rgbaToFloat32(line);
      ++i;
      buffer[i * 4 + 0] = this.width / 2 + line.end.x + diff.x / length;
      buffer[i * 4 + 1] = this.height / 2 + line.end.y + diff.y / length;
      buffer[i * 4 + 2] = line.width;
      buffer[i * 4 + 3] = rgbaToFloat32(line);
      ++i;
      ++i;
    }
    Vec3.pool.release(1);
    this.hexLinesHandle.update(buffer);
    this.hexLinesHandle.draw();
  }
}

