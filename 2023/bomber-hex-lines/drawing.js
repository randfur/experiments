import {HexLinesContext3d, kBytesPerHexPoint3d, setHexPoint3d} from './third-party/hex-lines/src/hex-lines-3d.js';

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
    this.hexLinesContext = new HexLinesContext3d({
      canvas: this.canvas,
      pixelSize: 1,
    });
    this.hexLinesHandle = this.hexLinesContext.add(new Float32Array());

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
    // for (let i = 0; i < this.lines.length;) {
    //   const line = this.lines[i];
    //   if (Camera.transformLine(line)) {
    //     ++i;
    //   } else {
    //     this.lines[i] = this.lines[this.lines.length - 1];
    //     this.lines.length -= 1;
    //   }
    // }
    // this.lines.sort((a, b) => b.midZ - a.midZ);

    this.hexLinesContext.gl.uniformMatrix4fv(this.hexLinesContext.uniformLocations.cameraTransform, this.hexLinesContext.gl.FALSE, new Float32Array([
      Math.cos(Camera.rotateYAngle), 0, -Math.sin(Camera.rotateYAngle), 0,
      0, 1, 0, -300,
      Math.sin(Camera.rotateYAngle), 0, Math.cos(Camera.rotateYAngle), 800,
      0, 0, 0, 1,
    ]));

    const requiredByteLength = kBytesPerHexPoint3d * this.lines.length * 3;
    if (this.buffer == null || this.buffer.byteLength < requiredByteLength) {
      this.buffer = new ArrayBuffer(requiredByteLength);
    }
    const dataView = new DataView(this.buffer, 0, requiredByteLength);

    let i = 0;
    for (const line of this.lines) {
      setHexPoint3d(dataView, i, {
        position: {
          x: line.start.x,
          y: line.start.y,
          z: line.start.z,
        },
        size: line.width,
        colour: line,
      });
      ++i;

      setHexPoint3d(dataView, i, {
        position: {
          x: line.end.x,
          y: line.end.y,
          z: line.end.z,
        },
        size: line.width,
        colour: line,
      });
      ++i;

      setHexPoint3d(dataView, i, null);
      ++i;
    }
    this.hexLinesHandle.update(dataView);
    this.hexLinesHandle.draw();
  }
}

