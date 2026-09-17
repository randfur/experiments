import {Vec3} from '../../third-party/ga/vec3.js';
import {Confetti} from './confetti.js';
import {Shockwave} from './shockwave.js';
import {TAU, random, pickRandom, easeOut, fadeColour, drawModel} from './utils.js';

export class Balloon {
  static drift = 20;

  constructor(game, position, maxRadius, colour, bad) {
    this.alive = true;
    this.game = game;
    this.basePosition = position;
    this.position = position.clone();
    this.growRemaining = growDuration;
    this.hangRemaining = hangDuration;
    this.fadeRemaining = fadeDuration;
    this.growProgress = 0;
    this.radius = 0;
    this.maxRadius = maxRadius;
    this.colour = bad ? badColour : colour;
    this.bad = bad;
    this.balloonModel = bad ? badBalloonModel : pickRandom(balloonModels);
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
      this.growRemaining -= timeDelta;
    } else if (this.hangRemaining > 0) {
      this.hangRemaining -= timeDelta;
    } else {
      this.fadeRemaining -= timeDelta;
    }

    this.growProgress = this.growRemaining > 0
      ? easeOut(1 - (this.growRemaining / growDuration))
      : 1;
    this.radius = this.maxRadius * this.growProgress;

    this.position.setAddXyz(
      this.basePosition,
      Balloon.drift * this.growProgress * Math.cos(this.time * this.driftXFrequency + this.driftXPhase),
      Balloon.drift * this.growProgress * Math.sin(this.time * this.driftYFrequency + this.driftYPhase),
    );

    if (this.fadeRemaining <= 0) {
      this.alive = false;
    }
  }

  pop() {
    this.alive = false;

    if (!this.bad) {
      const count = 3 + random(3);
      const confettis = [];
      for (let i = 0; i < count; ++i) {
        const confetti = new Confetti(this.position.clone(), this.radius, this.colour, confettis);
        confettis.push(confetti);
        this.game.entities.push(confetti);
      }
    }

    this.game.entities.push(
      new Shockwave(
        this.position.clone(),
        this.colour,
        this.radius,
        this.bad ? 10 : 2,
      ),
    );
  }

  draw(hexLines, textContext) {
    const rotation = this.rotateBase + this.rotateAmplitude * Math.sin(this.time * this.rotateFrequency + this.rotatePhase);
    const fade = easeOut(this.fadeRemaining / fadeDuration);

    drawModel(hexLines, this.balloonModel, 4, fadeColour(this.colour, fade), point => {
      return Vec3
        .set(point)
        .inplaceScale(this.radius)
        .inplaceRotateXyAngle(rotation)
        .inplaceAdd(this.position);
    });

    drawModel(hexLines, shineModel, 4, fadeColour(this.bad ? badShineColour : white, fade), point => {
      return Vec3
        .set(point)
        .inplaceScale(this.radius)
        .inplaceRotateXyAngle(rotation / 3)
        .inplaceAdd(this.position);
    });
  }
}

const growDuration = 2000;
const hangDuration = 2000;
const fadeDuration = 1500;
const badColour = {r: 200, g: 200, b: 200};
const badShineColour = {r: 150, g: 0, b: 0};

const balloonModels = [
  [
    new Vec3(-0.10, 1.00),
    new Vec3(0.32, 0.96),
    new Vec3(0.72, 0.77),
    new Vec3(0.94, 0.30),
    new Vec3(0.82, -0.49),
    new Vec3(0.51, -0.76),
    new Vec3(-0.01, -0.99),
    new Vec3(-0.18, -1.16),
    new Vec3(0.14, -1.19),
    new Vec3(-0.01, -1.00),
    new Vec3(-0.50, -0.79),
    new Vec3(-0.87, -0.35),
    new Vec3(-0.94, 0.38),
    new Vec3(-0.67, 0.80),
    new Vec3(-0.11, 1.02),
    null,
  ],
  [
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
    null,
  ]
];

const badBalloonModel = [
  new Vec3(0.00, 1.16),
  new Vec3(-0.14, 0.95),
  new Vec3(-0.50, 0.81),
  new Vec3(-0.74, 0.88),
  new Vec3(-0.70, 0.67),
  new Vec3(-0.89, 0.39),
  new Vec3(-1.07, 0.40),
  new Vec3(-0.95, 0.27),
  new Vec3(-0.97, -0.13),
  new Vec3(-1.08, -0.27),
  new Vec3(-0.90, -0.31),
  new Vec3(-0.72, -0.62),
  new Vec3(-0.84, -0.87),
  new Vec3(-0.59, -0.76),
  new Vec3(0.00, -0.99),
  new Vec3(0.19, -1.28),
  new Vec3(0.01, -1.19),
  new Vec3(-0.19, -1.25),
  new Vec3(-0.01, -0.98),
  new Vec3(0.35, -0.89),
  new Vec3(0.53, -0.96),
  new Vec3(0.52, -0.79),
  new Vec3(0.82, -0.50),
  new Vec3(1.02, -0.51),
  new Vec3(0.90, -0.31),
  new Vec3(0.97, 0.00),
  new Vec3(1.13, 0.16),
  new Vec3(0.92, 0.30),
  new Vec3(0.73, 0.66),
  new Vec3(0.77, 0.98),
  new Vec3(0.51, 0.84),
  new Vec3(0.11, 0.95),
  new Vec3(-0.00, 1.16),
  null,
];

const clearBadBalloonModel = [
  new Vec3(-0.01, 1.01),
  new Vec3(0.16, 0.97),
  new Vec3(0.28, 0.68),
  new Vec3(0.38, 0.44),
  new Vec3(0.63, 0.26),
  new Vec3(0.91, 0.12),
  new Vec3(1.00, 0.01),
  new Vec3(0.95, -0.14),
  new Vec3(0.67, -0.27),
  new Vec3(0.37, -0.34),
  new Vec3(0.20, -0.66),
  new Vec3(0.09, -0.95),
  new Vec3(0.00, -1.01),
  new Vec3(-0.18, -0.94),
  new Vec3(-0.28, -0.65),
  new Vec3(-0.36, -0.33),
  new Vec3(-0.66, -0.21),
  new Vec3(-0.97, -0.08),
  new Vec3(-1.05, 0.01),
  new Vec3(-1.00, 0.14),
  new Vec3(-0.69, 0.30),
  new Vec3(-0.38, 0.41),
  new Vec3(-0.22, 0.73),
  new Vec3(-0.14, 0.97),
  new Vec3(-0.02, 1.01),
  null,
];

const shineModel = [
  new Vec3(-0.10, 0.67),
  new Vec3(-0.32, 0.78),
  new Vec3(-0.54, 0.62),
  new Vec3(-0.68, 0.37),
  new Vec3(-0.68, 0.09),
  new Vec3(-0.44, 0.43),
  new Vec3(-0.27, 0.60),
  new Vec3(-0.10, 0.66),
  null,
];

const white = {r: 255, g: 255, b: 255};
