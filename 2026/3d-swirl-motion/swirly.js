import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

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
    this.position.inplaceAdd(
      Vec3.a.set(this.position)
        .inplaceScale(this.randomScale)
        .inplaceYzx()
        .inplaceAdd(this.randomTranspose)
        .inplaceMap(Math.sin)
        .inplaceRotateRotor3(this.randomRotate)
        .inplaceScale(this.randomSpeed)
        .inplaceScaleAdd(this.targetPull, Vec3.b.setDelta(this.position, this.targetPosition))
    );
  }
}

