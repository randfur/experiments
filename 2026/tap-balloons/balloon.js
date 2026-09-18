import {Vec3} from '../../third-party/ga/vec3.js';
import {Confetti} from './confetti.js';
import {Shockwave} from './shockwave.js';
import {TAU, random, pickRandom, modulo, easeOut, fadeColour, lerpColour, drawModel} from './utils.js';
import {balloonModels, badBalloonModel, cleanUpBalloonModel, normalShineModel, badShineModel, cleanUpShineModel} from './model-data.js';

export class Balloon {
  static drift = 20;

  constructor(game, type, position, maxRadius, stageColour) {
    this.alive = true;
    this.game = game;
    this.type = type;
    this.basePosition = position;
    this.position = position.clone();
    this.growRemaining = growDuration;
    this.hangRemaining = hangDuration;
    this.fadeRemaining = fadeDuration;
    this.growProgress = 0;
    this.radius = 0;
    this.maxRadius = maxRadius;
    this.colour = {
      normal: stageColour,
      bad: badColour,
      cleanUp: null,
    }[type];
    this.balloonModel = {
      normal: pickRandom(balloonModels),
      bad: badBalloonModel,
      cleanUp: cleanUpBalloonModel,
    }[type];
    this.driftXFrequency = random(1 / 600);
    this.driftYFrequency = random(1 / 600);
    this.driftXPhase = random(TAU);
    this.driftYPhase = random(TAU);
    this.rotateFrequency = random(1 / 400);
    this.rotatePhase = random(TAU);
    this.rotateBase = random(0.1);
    this.rotateAmplitude = 0.05 + random(0.3);
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

    if (this.type === 'normal') {
      const count = 5 + random(5);
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
        this.type === 'cleanUp' ? cleanUpShockwaveColour : this.colour,
        this.radius,
        this.type === 'bad' ? 10 : 2,
      ),
    );
  }

  static shineModel = {
    normal: normalShineModel,
    bad: badShineModel,
    cleanUp: cleanUpShineModel,
  };
  static shineColour = {
    normal: {r: 255, g: 255, b: 255},
    bad: {r: 200, g: 0, b: 0},
    cleanUp: {r: 255, g: 255, b: 255},
  };
  draw(hexLines, textContext) {
    const rotation = this.rotateBase + this.rotateAmplitude * Math.sin(this.time * this.rotateFrequency + this.rotatePhase);
    const fade = easeOut(this.fadeRemaining / fadeDuration);
    const modelThickness = 4 + this.radius / 40;

    if (this.type === 'cleanUp') {
      for (let i = 0; i < cleanUpBalloonModel.length; ++i) {
        const point = cleanUpBalloonModel[i];
        const colourIndex = 0.25 + rotation * 2 + i / cleanUpBalloonModel.length * cleanUpColours.length;
        const colourA = cleanUpColours[modulo(Math.floor(colourIndex), cleanUpColours.length)];
        const colourB = cleanUpColours[modulo(Math.floor(colourIndex + 1), cleanUpColours.length)];
        const colour = fadeColour(lerpColour(colourA, colourB, colourIndex - Math.floor(colourIndex)), fade);
        if (point === null) {
          hexLines.addNull();
        } else {
          hexLines.addPointParts(
            Vec3
              .set(point)
              .inplaceScale(this.radius)
              .inplaceRotateXyAngle(rotation)
              .inplaceAdd(this.position),
            modelThickness,
            colour,
          );
        }
      }
    } else {
      drawModel(hexLines, this.balloonModel, modelThickness, fadeColour(this.colour, fade), point => {
        return Vec3
          .set(point)
          .inplaceScale(this.radius)
          .inplaceRotateXyAngle(rotation)
          .inplaceAdd(this.position);
      });
    }

    const distortion = this.type === 'cleanUp' ? 0 : this.radius / 40;
    drawModel(hexLines, Balloon.shineModel[this.type], 4, fadeColour(Balloon.shineColour[this.type], fade), point => {
      return Vec3
        .set(point)
        .inplaceScale(this.radius)
        .inplaceRotateXyAngle(rotation / 2)
        .inplaceAddXyz(
          distortion * Math.cos(-12 * point.y + 3 * rotation),
          distortion * Math.sin(-12 * point.x + 3 * rotation),
        )
        .inplaceAdd(this.position);
    });
  }
}

const growDuration = 2000;
const hangDuration = 2000;
const fadeDuration = 1500;
const badColour = {r: 200, g: 200, b: 200};
const cleanUpShockwaveColour = {r: 255, g: 255, b: 255};

const cleanUpColours = [
  {r: 255, g: 20, b: 10},
  {r: 20, g: 100, b: 255},
  {r: 20, g: 220, b: 10},
  {r: 255, g: 190, b: 20},
];