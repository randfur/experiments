import {Drawing} from './drawing.js';
import {Vec3} from './vec3.js';
import {Quat} from './quat.js';
import {TAU, enumerate, deviate} from './utils.js';

export class Bomber {
  constructor() {
    this.model = [
      new Vec3(2, 0, 0),
      new Vec3(-1, 0, 3),
      new Vec3(-2, 0, 1.5),
      new Vec3(-1, 0, 0),
      new Vec3(-2, 0, -1.5),
      new Vec3(-1, 0, -3),
    ];
    this.transformedModel = Vec3.copyList(this.model);

    this.trailPoints = [
      new Vec3(-1.7, 0, 2),
      new Vec3(-2.1, 0, 1.5),
      new Vec3(-1.7, 0, 1),
      new Vec3(-1.7, 0, -1),
      new Vec3(-2.1, 0, -1.5),
      new Vec3(-1.7, 0, -2),
    ];
    this.trailColours = [
      {r: 255, g: 0, b: 0, a: 255},
      {r: 255, g: 127, b: 0, a: 255},
      {r: 255, g: 255, b: 0, a: 255},
      {r: 0, g: 255, b: 0, a: 255},
      {r: 0, g: 0, b: 255, a: 255},
      {r: 127, g: 0, b: 255, a: 255},
    ];
    this.trailLength = 100;
    this.trailWidth = 8;
    this.trails = this.trailPoints.map(_ => []);

    this.timeShift = deviate(1000);
    this.timeScale = 1 + deviate(0.01);
    this.orientation = new Quat();
    this.orientation.rotate(0, 1, 0, deviate(TAU));
    this.position = new Vec3(0, 0, 0);
    this.velocity = new Vec3();
    this.speed = 0.4 + deviate(0.2);
  }

  update(timeDelta, time) {
    this.orientation.relativeRotate(1, 0, 0, Math.sin((time * this.timeScale + this.timeShift) * 0.002) * 0.03);
    this.orientation.relativeRotate(0, 0, 1, -0.025 + Math.sin((time * this.timeScale + this.timeShift * 2) * 0.001) * 0.0025);
    this.orientation.normalise();

    this.velocity.setXyz(this.speed * timeDelta, 0, 0);
    this.velocity.rotateQuat(this.orientation);
    this.position.add(this.velocity);

    for (const [i, v] of enumerate(this.transformedModel)) {
      this.assignLocalTransform(v, this.model[i], time);
    }

    for (const [i, trailPoint] of enumerate(this.trailPoints)) {
      const trail = this.trails[i];
      if (trail.length === this.trailLength) {
        trail.splice(0, 1);
      }
      const newTrailPoint = new Vec3();
      this.assignLocalTransform(newTrailPoint, trailPoint, time);
      trail.push(newTrailPoint);
    }
  }

  assignLocalTransform(v, modelV, time) {
    v.assignScale(modelV, 20);
    v.rotateQuat(this.orientation);
    v.add(this.position);
  }

  addLines() {
    Drawing.addPath(this.transformedModel, 4, 255, 255, 255, 255, true);
    for (const [i, trail] of enumerate(this.trails)) {
      const colour = this.trailColours[i];
      for (const [j, v] of enumerate(trail)) {
        if (j == 0) {
          continue;
        }
        const prevV = trail[j - 1];
        const line = Drawing.addLine();
        line.start.set(prevV);
        line.end.set(v);
        line.r = colour.r;
        line.g = colour.g;
        line.b = colour.b;
        line.a = colour.a;
        line.width = this.trailWidth * ((j - 1) / this.trailLength);
      }
    }
  }
}