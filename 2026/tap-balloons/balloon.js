import {Vec3} from '../../third-party/ga/vec3.js';
import {Confetti} from './confetti.js';
import {random, easeOut, fadeColour} from './utils.js';

export class Balloon {
  static maxRadius = 50;
  static maxDrift = 10;

  constructor(game, position, colour) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.growRemaining = growDuration;
    this.hangRemaining = hangDuration;
    this.fadeRemaining = fadeDuration;
    this.growProgress = 0;
    this.radius = 0;
    this.colour = colour;
    this.driftXFrequency = random(1 / 600);
    this.driftYFrequency = random(1 / 600);
    this.driftXPhase = random(TAU);
    this.driftYPhase = random(TAU);
    this.rotateFrequency = random(1 / 400);
    this.rotatePhase = random(TAU);
    this.rotateBase = random(0.1);
    this.rotateAmplitude = 0.05 + random(0.2);
    this.time = 0;
  }

  update(time, timeDelta) {
    this.time = time;

    if (this.growRemaining > 0) {
      --this.growRemaining;
    } else if (this.hangRemaining > 0) {
      --this.hangRemaining;
    } else {
      --this.fadeRemaining;
    }

    this.growProgress = this.growRemaining > 0
      ? easeOut(1 - (this.growRemaining / growDuration))
      : 1;
    this.radius = Balloon.maxRadius * this.growProgress;

    this.alive &&= this.fadeRemaining > 0;
  }

  pop() {
    this.alive = false;
    const count = 10 + random(20);
    for (let i = 0; i < count; ++i) {
      this.game.entities.push(new Confetti(this.position.clone(), this.radius, this.colour));
    }
  }

  draw(hexLines, textContext) {
    drawBalloon(
      hexLines,
      Vec3.addXyz(
        this.position,
        Balloon.maxDrift * this.growProgress * Math.cos(this.time * this.driftXFrequency + this.driftXPhase),
        Balloon.maxDrift * this.growProgress * Math.sin(this.time * this.driftYFrequency + this.driftYPhase),
      ),
      this.colour,
      this.radius,
      this.rotateBase + this.rotateAmplitude * Math.sin(this.time * this.rotateFrequency + this.rotatePhase),
      easeOut(this.fadeRemaining / fadeDuration),
    );
  }
}

const drawVec3 = new Vec3();
export function drawBalloon(hexLines, position, colour, scale, rotation, fade) {
  const fadedColour = fadeColour(colour, fade);
  for (const point of balloonModelPoints) {
    hexLines.addPointParts(
      drawVec3
        .set(point)
        .inplaceScale(scale)
        .inplaceRotateXyAngle(rotation)
        .inplaceAdd(position),
      4,
      fadedColour,
    );
  }
  hexLines.addNull();

  const fadedWhite = fadeColour(white, fade);
  for (const point of shineModelPoints) {
    hexLines.addPointParts(
      drawVec3
        .set(point)
        .inplaceScale(scale)
        .inplaceRotateXyAngle(rotation)
        .inplaceAdd(position),
      4,
      fadedWhite,
    );
  }
  hexLines.addNull();
}

const TAU = Math.PI * 2;

const growDuration = 100;
const hangDuration = 100;
const fadeDuration = 50;

const balloonModelPoints = [
  new Vec3(-0.02, 1.01),
  new Vec3(0.45, 0.90),
  new Vec3(0.82, 0.60),
  new Vec3(0.93, 0.12),
  new Vec3(0.79, -0.42),
  new Vec3(0.34, -0.80),
  new Vec3(-0.01, -1.1),
  new Vec3(-0.19, -1.3),
  new Vec3(0.22, -1.27),
  new Vec3(-0.00, -1.00),
  new Vec3(-0.38, -0.79),
  new Vec3(-0.79, -0.35),
  new Vec3(-0.90, 0.27),
  new Vec3(-0.72, 0.76),
  new Vec3(-0.31, 1.01),
  new Vec3(-0.02, 1.01),
];

const shineModelPoints = [
  new Vec3(-0.10, 0.67),
  new Vec3(-0.32, 0.78),
  new Vec3(-0.54, 0.62),
  new Vec3(-0.68, 0.37),
  new Vec3(-0.68, 0.09),
  new Vec3(-0.44, 0.43),
  new Vec3(-0.27, 0.60),
  new Vec3(-0.10, 0.66),
];

const white = {r: 255, g: 255, b: 255};
