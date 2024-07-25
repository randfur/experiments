import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';

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

    this.hexLinesContext = new HexLinesContext({
      canvas: this.canvas,
      pixelSize: 1,
      is3d: true,
    });
    this.hexLines = this.hexLinesContext.createLines();
  }

  static draw() {
      this.hexLinesContext.transformMatrix =       new Float32Array([
        Math.cos(Camera.rotateYAngle), 0, Math.sin(Camera.rotateYAngle), 0,
        0, 1, 0, 0,
        -Math.sin(Camera.rotateYAngle), 0, Math.cos(Camera.rotateYAngle), 0,
        0, -300, 800, 1,
      ]);
    this.hexLines.draw();
  }
}

