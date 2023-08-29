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
    this.hexLinesHandle = this.hexLinesContext.createHandle();
  }

  static draw() {
    this.hexLinesContext.gl.uniformMatrix4fv(this.hexLinesContext.uniformLocations.cameraTransform, this.hexLinesContext.gl.FALSE, new Float32Array([
      Math.cos(Camera.rotateYAngle), 0, -Math.sin(Camera.rotateYAngle), 0,
      0, 1, 0, -300,
      Math.sin(Camera.rotateYAngle), 0, Math.cos(Camera.rotateYAngle), 800,
      0, 0, 0, 1,
    ]));
    this.hexLinesHandle.draw();
  }
}

