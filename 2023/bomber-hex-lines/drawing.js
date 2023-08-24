import {HexLinesContext, kBytesPerHexPoint, setHexPoint} from './third-party/hex-lines/src/hex-lines.js';

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
      pixelSize: 1,
    }).add(new Float32Array());

    this.linePool = new Pool(() => ({
      start: new Vec3(),
      end: new Vec3(),
      width: 0,
      colour: '',
      midZ: 0,
    }));
    this.lines = [];

    this.buffer = null;
  }

  static clear() {
    this.lines.length = 0;
    this.linePool.releaseAll();
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

    const requiredByteLength = kBytesPerHexPoint * this.lines.length * 3;
    if (this.buffer == null || this.buffer.byteLength < requiredByteLength) {
      this.buffer = new ArrayBuffer(requiredByteLength);
    }
    const dataView = new DataView(this.buffer, 0, requiredByteLength);

    let i = 0;
    const diff = Vec3.pool.acquire();
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

      setHexPoint(dataView, i, {
        position: {
          x: this.width / 2 + line.start.x,
          y: this.height / 2 + line.start.y,
        },
        size: line.width,
        colour: line,
      });
      ++i;

      setHexPoint(dataView, i, {
        position: {
          x: this.width / 2 + line.end.x + diff.x / length,
          y: this.height / 2 + line.end.y + diff.y / length,
        },
        size: line.width,
        colour: line,
      });
      ++i;

      setHexPoint(dataView, i, null);
      ++i;
    }
    Vec3.pool.release(1);
    this.hexLinesHandle.update(dataView);
    this.hexLinesHandle.draw();
  }
}

