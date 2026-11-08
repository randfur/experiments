import {Vec3} from '../../third-party/ga/src/vec3.js';
import {Rotor3} from '../../third-party/ga/src/rotor3.js';

export class Swirly {
  constructor({startPosition, randomTranspose, randomScale, randomSpeed, targetPosition, targetPull}) {
    this.position = startPosition ?? targetPosition.clone();
    this.randomScale = randomScale;
    this.randomSpeed = randomSpeed;
    this.randomTranspose = randomTranspose;
    this.targetPosition = targetPosition;
    this.targetPull = targetPull;

    this.randomRotate = new Rotor3();
  }

  update() {
    this.position.add(
      Vec3.a.set(this.position)
        .scale(this.randomScale)
        .yzx()
        .add(this.randomTranspose)
        .map(Math.sin)
        .rotateRotor3(this.randomRotate)
        .scale(this.randomSpeed)
        .scaleAdd(this.targetPull, Vec3.b.setDelta(this.position, this.targetPosition))
    );
  }
}

