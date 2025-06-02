import {Vec3} from './vec3.js';
import {deviate, random, randomSign, range, TAU} from './utils.js';

export class Ship {
  constructor() {
    this.alive = true;

    this.behaviours = [Meander];
    this.behaviour = null;
    this.behaviourIndex = -1;

    this.model = createIceShardModel();

    this.position = new Vec3(0, 0, 1000);
    this.velocity = new Vec3().deviate(10)
  }

  update(objects) {
    if (!this.behaviour) {
      this.behaviourIndex = (this.behaviourIndex + 1) % this.behaviours.length;
      this.behaviour = new this.behaviours[this.behaviourIndex]();
    } else {
      this.behaviour.update(this);
      if (!this.behaviour.alive) {
        this.behaviour = null;
      }
    }

    this.position.add(this.velocity);
    this.velocity.addScaled(this.position, -0.0003);
    this.velocity.addScaled(this.velocity, -0.005);

    // Pick a run up path.
    // Build up speed.
    // Create a large ice path in an arc, exhaust built up speed in a big pitch up maneuver.
    // Wander around.
    // Repeat.
  }

  draw(hexLines) {
    hexLines.addPoints(
      this.model.map(point => (point ? {
          ...point,
          position: new Vec3().add(point.position).rotateXTo(this.velocity).add(this.position),
        } : null
      ))
    );
  }
}

function createIceShardModel() {
  const size = 3;
  const front = new Vec3(50 + deviate(30), 0, 0);
  const back = new Vec3(-30 + deviate(10), 0, 0);
  const sideCount = Math.round(3 + random(3));
  const sides = range(sideCount).map(i => {
    const angle = (i + random(1)) / sideCount * TAU;
    const radius = 10 + random(10);
    return new Vec3(deviate(20), Math.cos(angle) * radius, Math.sin(angle) * radius);
  });
  const frontColour = {r: 100, g: 200, b: 255};
  const sideColour = {r: 100, g: 100, b: 255};
  const backColour = {r: 50, g: 50, b: 255};
  return [
    ...sides.flatMap(side => [
      {position: front, size, colour: frontColour},
      {position: side, size, colour: sideColour},
      {position: back, size, colour: backColour},
      null,
    ]),
    ...range(sideCount + 1).map(i => (
      {position: sides[i % sideCount], size, colour: sideColour}
    )),
    null,
  ];
}

class Meander {
  constructor() {
    this.alive = true;
    this.acceleration = new Vec3().deviate(0.2);
    this.maxLife = random(200);
    this.life = this.maxLife;
  }

  update(ship) {
    ship.velocity.add(this.acceleration);
    --this.life;
    this.alive = this.life > 0;
  }
}
