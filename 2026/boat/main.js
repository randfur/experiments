import {HexGame} from 'hex-game';
import {Vec3, Rotor3, Mat4} from 'ga';

async function main() {
  HexGame.init({is3d: true});
  HexGame.entities.push(Boat, Water);
}

class Boat {
  static alive = true;
  static position = new Vec3(0, 0, 0);
  static colour = {r: 200, g: 150, b: 50};
  static orientation = new Rotor3();
  static modelPositions = [
    new Vec3(-0.64, 0, -0.78),
    new Vec3(-0.44, 0, -0.99),
    new Vec3(0.39, 0, -1.00),
    new Vec3(0.68, 0, -0.77),
    new Vec3(0.69, 0, 0.42),
    new Vec3(0.13, 0, 1.00),
    new Vec3(-0.14, 0, 1.02),
    new Vec3(-0.68, 0, 0.38),
    new Vec3(-0.65, 0, -0.78),
    null,
    new Vec3(0, 0.0, 1.01),
    new Vec3(0, -0.33, 0.41),
    new Vec3(0, -0.27, -0.82),
    new Vec3(0, 0.0, -0.99),
    null,
    new Vec3(-0.68, 0, -0.2),
    new Vec3(-0.38, -0.24, -0.2),
    new Vec3(0.48, -0.25, -0.2),
    new Vec3(0.67, 0, -0.2),
    null,
  ];

  static update(timeDelta) {
    this.orientation.multiply(Rotor3.setAxisAngle(Vec3.setY(), timeDelta * 0.001));
  }

  static draw(hexLines) {
    Mat4.setIdentity()
      .translateXyz(0, -100, 1000)
      .rotateYz(-0.3)
      .exportToBuffer(hexLines.transformMatrix);
    for (const position of this.modelPositions) {
      if (position === null) {
        hexLines.addNull();
      } else {
        hexLines.addPointParts(
          Vec3.setScale(100, position)
            .rotateRotor3(this.orientation)
            .add(this.position),
          10,
          this.colour,
        );
      }
    }
  }
}

class Water {
  static alive = true;

  static draw(hexLines) {
  }
}

main();