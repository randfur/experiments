import {HexContext3d} from './third-party/hex-lines/src/hex-lines-3d.js';

import {Pool} from './pool.js';
import {Vec3} from './vec3.js';
import {Camera} from './camera.js';

export class Drawing {
  static canvas;
  static context;

  static init() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.style.cssText = `
      background-color: black;
      margin: 0;
      padding: 0;
      overflow: hidden;
      touch-action: pinch-zoom;
    `;
    document.body.appendChild(this.canvas);

    this.hexContext = new HexContext3d({
      canvas: this.canvas,
      pixelSize: 4,
    });
    this.hexLines = this.hexContext.createLines();
  }

  static draw() {
    this.hexContext.gl.uniformMatrix4fv(this.hexContext.uniformLocations.cameraTransform, this.hexContext.gl.FALSE, new Float32Array([
      Math.cos(Camera.rotateYAngle), 0, -Math.sin(Camera.rotateYAngle), 0,
      0, 1, 0, -300,
      Math.sin(Camera.rotateYAngle), 0, Math.cos(Camera.rotateYAngle), 800,
      0, 0, 0, 1,
    ]));
    this.hexLines.draw();
  }
}

