import {Drawing} from './drawing.js';
import {Vec3} from './vec3.js';
import {Quat} from './quat.js';
import {TAU, enumerate} from './utils.js';

export class Bomber {
  static init() {
    this.model = [
      new Vec3(2, 0, 0),
      new Vec3(-1, 0, 3),
      new Vec3(-2, 0, 1.5),
      new Vec3(-1, 0, 0),
      new Vec3(-2, 0, -1.5),
      new Vec3(-1, 0, -3),
    ];
    this.transformedModel = Vec3.copyList(this.model);
    this.orientation = new Quat();
  }

  static update(timeDelta, time) {
    this.orientation.relativeRotate(1, 0, 0, Math.sin(time * 0.001) * 0.01);
    this.orientation.relativeRotate(0, 0, 1, Math.sin(time * 0.0001) * 0.005);
    this.orientation.normalise();
    for (const [i, v] of enumerate(this.transformedModel)) {
      v.assignScale(this.model[i], 10 + time / 1000);
      v.rotateQuat(this.orientation);
      v.addXyz(0, -150, 0);
    }
  }

  static addLines() {
    Drawing.addPath(this.transformedModel, 2, 'white', true);
  }
}