import {Vec3} from '../../third-party/ga/vec3.js';
import {Confetti} from './confetti.js';
import {Shockwave} from './shockwave.js';
import {StarEmitter} from './star-emitter.js';
import {stageColours} from './colours.js';
import {TAU, random, pickRandom, modulo, easeIn, easeOut, fadeColour, lerpColour, drawModel} from './utils.js';
import {balloonModels, badBalloonModel, cleanUpBalloonModel, normalShineModel, badShineModel, cleanUpShineModel} from './model-data.js';

export class Balloon {
  static drift = 20;

  constructor(game, type, position, maxRadius, stageColour) {
    this.alive = true;
    this.game = game;
    this.type = type;
    this.basePosition = position;
    this.preWobblePosition = position.clone();
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

    this.preWobblePosition.setAddXyz(
      this.basePosition,
      Balloon.drift * this.growProgress * Math.cos(this.time * this.driftXFrequency + this.driftXPhase),
      Balloon.drift * this.growProgress * Math.sin(this.time * this.driftYFrequency + this.driftYPhase),
    );

    this.position.set(this.preWobblePosition);
    for (const wobbleSource of this.game.wobbleSources) {
      const delta = Vec3.delta(wobbleSource.position, this.position);
      this.position.inplaceScaleAdd(
        5000
          * (1 - Math.cos((wobbleDuration - wobbleSource.remaining) / 150))
          * easeIn(wobbleSource.remaining / wobbleDuration)
          / (delta.squareLength() * 4),
        delta,
      );
    }

    if (this.fadeRemaining <= 0) {
      this.alive = false;
    }
  }

  click(position) {
    if (Vec3.delta(this.position, position).squareLength() < this.radius ** 2) {
      this.game.popCheck = true;
      this.pop();
    }
  }

  pop(cleaningUp=false) {
    this.alive = false;

    switch (this.type) {
      case 'normal':
      case 'cleanUp': {
        const count = this.type === 'cleanUp' ? 20 + random(20) : 5 + random(5);
        const confettis = [];
        for (let i = 0; i < count; ++i) {
          const confetti = new Confetti(
            this.position.clone(),
            this.radius,
            this.type === 'cleanUp' ? 2 : 0.5,
            this.type === 'cleanUp' ? pickRandom(stageColours) : this.colour,
            confettis,
          );
          confettis.push(confetti);
          this.game.entities.push(confetti);
        }
        break;
      }
      case 'bad': {
        this.game.wobbleSources.push({
          remaining: wobbleDuration,
          position: this.position.clone(),
        });
        break;
      }
    }

    this.game.entities.push(
      new Shockwave(
        this.position.clone(),
        this.type === 'cleanUp' ? cleanUpShockwaveColour : this.colour,
        this.radius * (this.type === 'cleanUp' ? 2 : 1),
        this.type === 'normal' ? 2 : 10,
      ),
    );

    if (this.type === 'bad' && !cleaningUp) {
      this.game.clearCombo();
    } else {
      this.game.incrementCombo();
    }
    if (this.type === 'cleanUp') {
      for (const entity of this.game.entities) {
        if (entity instanceof Balloon && entity.type === 'bad') {
          entity.pop(/*cleaningUp=*/true);
        }
      }
    } else {
      this.game.entities.push(new StarEmitter(
        this.game,
        this.position.clone(),
        this.radius,
        this.game.comboLevel,
        this.type === 'bad' && !cleaningUp,
      ));
    }
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
  static distortionRadiusDivisor = {
    normal: 40,
    bad: 30,
    cleanUp: 20,
  };
  draw(hexLines, textContext) {
    const rotation = this.rotateBase + this.rotateAmplitude * Math.sin(this.time * this.rotateFrequency + this.rotatePhase);
    const fade = easeOut(this.fadeRemaining / fadeDuration);
    const modelThickness = 4 + this.radius / (this.type === 'cleanUp' ? 20 : 40);

    if (this.type === 'cleanUp') {
      for (let i = 0; i < cleanUpBalloonModel.length; ++i) {
        const point = cleanUpBalloonModel[i];
        const colourIndex = -0.75 + rotation * 2 + i / (cleanUpBalloonModel.length - 2) * stageColours.length;
        const colourA = stageColours[modulo(Math.floor(colourIndex), stageColours.length)];
        const colourB = stageColours[modulo(Math.floor(colourIndex + 1), stageColours.length)];
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

    const distortion = this.radius / Balloon.distortionRadiusDivisor[this.type];
    const rotationDivisor = this.type === 'cleanUp' ? 1.1 : 2;
    drawModel(hexLines, Balloon.shineModel[this.type], 4, fadeColour(Balloon.shineColour[this.type], fade), point => {
      return Vec3
        .set(point)
        .inplaceScale(this.radius)
        .inplaceRotateXyAngle(rotation / rotationDivisor)
        .inplaceAddXyz(
          distortion * Math.cos(-2 * point.y + 3 * rotation),
          distortion * Math.sin(-2 * point.x + 3 * rotation),
        )
        .inplaceAdd(this.position);
    });
  }
}

const growDuration = 2000;
const hangDuration = 2000;
const fadeDuration = 1500;
const wobbleDuration = 1000;
const badColour = {r: 200, g: 200, b: 200};
const cleanUpShockwaveColour = {r: 255, g: 255, b: 255};

const cleanUpColours = [
  {r: 255, g: 20, b: 10},
  {r: 20, g: 100, b: 255},
  {r: 20, g: 220, b: 10},
  {r: 255, g: 190, b: 20},
];