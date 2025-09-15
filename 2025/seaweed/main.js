import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../third-party/ga/vec3.js';
import {Rotor3} from '../third-party/ga/rotor3.js';
import {Temp} from '../third-party/ga/temp.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const objects = [
    new BezierVolume(),
    new FishSchool(),
    new Bubbler(),
  ];

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    Temp.reclaimAll();
    hexLines.clear();

    for (const object of objects) {
      object.update(time);
      object.draw(hexLines);
    }

    hexLines.draw();
  }
}

class Bubbler {
  constructor() {
    this.wait = 0;
    this.bubbles = [];
  }

  update(time) {
    if (this.wait <= 0) {
      this.wait = 100 + deviate(100);
      const count = 4 + deviate(3);
      const position = Vec3.temp(
        deviate(300),
        -300,
        300 + deviate(300),
      );
      const baseSpeed = 2 + deviate(1);
      for (let i = 0; i < count; ++i) {
        this.bubbles.push(new Bubble({
          speed: baseSpeed * (1 - 1 / (count * 3 - i)),
          size: Math.max(2 + deviate(1) - i, 1),
          position: new Vec3().set(position).inplaceAddXyz(
            deviate(10),
            deviate(10),
            deviate(10),
          ),
        }));
      }
    }
    --this.wait;
    for (const bubble of this.bubbles) {
      bubble.update(time);
    }
    this.bubbles = this.bubbles.filter(bubble => bubble.alive);
  }

  draw(hexLines) {
    for (const bubble of this.bubbles) {
      bubble.draw(hexLines);
    }
  }
}

class Bubble {
  constructor({speed, size, position}) {
    this.life = 300 + deviate(200);
    this.alive = true;
    this.speed = speed;
    const points = 10;
    this.model = range(points).map(i => new Vec3().setPolarXy(TAU * i / (points - 1), size));
    this.position = position;
    this.wobble = new Vec3(deviate(1), deviate(1), deviate(1));
  }

  update(time) {
    --this.life;
    this.alive = this.life > 0;
    this.wobble.inplaceAddXyz(
      Math.cos(this.wobble.y / 3),
      Math.cos(this.wobble.z / 3),
      Math.cos(this.wobble.x / 3),
    );
    this.position.y += this.speed;
  }

  draw(hexLines) {
    for (const modelPosition of this.model) {
      hexLines.addPoint({
        position: Vec3.temp()
          .inplaceAdd(this.position)
          .inplaceAdd(this.wobble)
          .inplaceAdd(modelPosition),
        size: 1,
        colour: {r: 100, g: 200, b: 255},
      });
    }
    hexLines.addNull();
  }
}

class FishSchool {
  constructor() {
    this.position = new Vec3();
    this.fishes = range(20).map(i =>
      new Fish(
        this.position,
        new Vec3(
          deviate(100),
          i * 5 - 50,
          deviate(100),
        ),
      )
    );
  }

  update(time) {
    this.position.setXyz(
      Math.cos(time / 10000) * 200,
      0,
      100,
    );
    for (const fish of this.fishes) {
      fish.update(time);
    }
  }

  draw(hexLines) {
    for (const fish of this.fishes) {
      fish.draw(hexLines);
    }
  }
}

class Fish {
  static model = centrePositions([
    new Vec3(-2, 6, 0),
    new Vec3(-5, 4, 0),
    new Vec3(-8, 3, 0),
    new Vec3(-7, 5, 0),
    new Vec3(-9, 4, 0),
    new Vec3(-9, 8, 0),
    new Vec3(-7, 6, 0),
    new Vec3(-9, 9, 0),
    new Vec3(-5, 8, 0),
    new Vec3(-2, 6, 0),
  ]);

  constructor(schoolPosition, basePosition) {
    this.schoolPosition = schoolPosition;
    this.basePosition = basePosition;
    this.wobble = new Vec3();
    this.position = new Vec3();
    this.lastPosition = new Vec3();
    this.orientation = new Rotor3();
  }

  update(time) {
    this.wobble.setXyz(
      0,
      Math.sin(time / 10000 + this.basePosition.x) * 50,
      Math.cos(time / 1000 + this.basePosition.y) * 20,
    );
    this.position
      .setZero()
      .inplaceAdd(this.schoolPosition)
      .inplaceAdd(this.basePosition)
      .inplaceAdd(this.wobble);
    const direction = Vec3.temp()
      .setDelta(this.lastPosition, this.position)
      .inplaceNormalise();
    this.lastPosition.set(this.position);
    this.orientation.setVec3ToVec3(Vec3.temp(1, 0, 0), direction);
  }

  draw(hexLines) {
    for (const modelPosition of Fish.model) {
      hexLines.addPoint({
        position: Vec3.temp()
          .set(modelPosition)
          .inplaceRotateRotor(this.orientation)
          .inplaceAdd(this.position),
        size: 1,
        colour: {r: 255, g: 200, b: 50},
      });
    }
    hexLines.addNull();
  }
}

class BezierVolume {
  constructor() {
    this.scaffolding = range(4).map(x =>
      range(4).map(z =>
        new Bezier(
          range(4).map(y =>
            new Vec3(x, y, z)
              .inplaceAddXyz(-1.5, -1.5, 2)
              .inplaceScale(30)
              .inplaceAddXyz(deviate(10), deviate(10), deviate(10))
          )
        )
      )
    );
  }

  update(time) {
  }

  draw(hexLines) {
    for (const row of this.scaffolding) {
      for (const bezier of row) {
        bezier.draw(hexLines);
      }
    }
  }
}

class Bezier {
  constructor(controlPoints) {
    this.controlPoints = controlPoints;
  }

  evaluate(t, output) {
    const [a, b, c, d] = this.controlPoints;

    const e = Vec3.temp().setLerp(a, b, t);
    const f = Vec3.temp().setLerp(b, c, t);
    const g = Vec3.temp().setLerp(c, d, t);

    const h = Vec3.temp().setLerp(e, f, t);
    const i = Vec3.temp().setLerp(f, g, t);

    return output.setLerp(h, i, t);
  }

  draw(hexLines) {
    const count = 100;
    for (let i = 0; i < count; ++i) {
      hexLines.addDot({
        position: this.evaluate(i / count, Vec3.temp()),
        size: 2 + deviate(0.2),
        colour: {g: 255 * (i + 1) / count},
      });
    }
    hexLines.addNull();
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function centrePositions(positions) {
  const min = Vec3.temp().set(positions[0]);
  const max = Vec3.temp().set(positions[0]);
  for (const position of positions) {
    min.inplaceMin(position);
    max.inplaceMax(position);
  }
  const centrePosition = Vec3.temp().setAdd(min, max).inplaceScale(0.5);
  for (const position of positions) {
    position.inplaceSubtract(centrePosition);
  }
  return positions;
}

main();