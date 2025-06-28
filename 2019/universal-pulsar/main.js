const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');

const gameWidth = 1000;
const gameHeight = 1000;

let time = null;
let mouse = null;
let camera = null;
let planets = null;

window.addEventListener('error', ({error: {stack}}) => {
  output.textContent = stack;
});

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return (2 * Math.random() - 1) * x;
}

class PlanetAddon {}

class PlanetThruster extends PlanetAddon {
  on = true;
}

class Planet {
  constructor() {
    this.position = {
      x: random(gameWidth),
      y: random(gameHeight),
    };
    this.radius = 3 + random(100);
    this.faction = null;
    this.addons = [];
  }
  
  draw() {
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, TAU, false);
    context.stroke();
  }
}

class QuadraticNumber {
  constructor({value, transitionDuration, peakVelocityProgressFraction}) {
    this.targetValue = value;
    this.transitionDuration = transitionDuration;
    this.peakVelocityProgressFraction = peakVelocityProgressFraction;
    this.quadraticA = {a: 0, b: 0, c: 0};
    this.quadraticB = {a: 0, b: 0, c: value};
    this.progress = 1;
  }
  
  getValue() {
    return QuadraticNumber.quadratic(
        this.progress < this.peakVelocityProgressFraction
          ? this.quadraticA
          : this.quadraticB,
        this.progress);
  }

  update(timeDelta) {
    this.progress = Math.min(1, this.progress + timeDelta / this.transitionDuration);
  }
  
  setValue(newValue) {
    const value = this.getValue();
    const velocity = this.getVelocity();
    this.targetValue = newValue;
    const peakVelocity = 2 * (this.targetValue - value) - velocity * this.peakVelocityProgressFraction;

    this.progress = 0;

    this.quadraticA.a = (peakVelocity - velocity) / this.peakVelocityProgressFraction / 2;
    this.quadraticA.b = velocity;
    this.quadraticA.c = 0;
    this.quadraticA.c = value - QuadraticNumber.quadratic(this.quadraticA, 0);

    this.quadraticB.a = -peakVelocity / (1 - this.peakVelocityProgressFraction) / 2;
    this.quadraticB.b = -this.quadraticB.a * 2;
    this.quadraticB.c = 0;
    this.quadraticB.c = this.targetValue - QuadraticNumber.quadratic(this.quadraticB, 1);
  }

  getVelocity() {
    return QuadraticNumber.quadraticVelocity(
        this.progress < this.peakVelocityProgressFraction
          ? this.quadraticA
          : this.quadraticB,
        this.progress);
  }

  static quadratic({a, b, c}, x) {
    return a * x ** 2 + b * x + c;
  }

  static quadraticVelocity({a, b}, x) {
    return 2 * a * x + b;
  }
}

class LinearNumber {
  constructor({value, transitionDuration}) {
    this.startValue = value;
    this.targetValue = value;
    this.transitionDuration = transitionDuration;
    this.progress = 1;
  }
  
  getValue() {
    return this.startValue + (this.targetValue - this.startValue) * this.progress;
  }
  
  update(timeDelta) {
    this.progress = Math.min(1, this.progress + timeDelta / this.transitionDuration);
  }
  
  setValue(newValue) {
    this.startValue = this.getValue();
    this.targetValue = newValue;
    this.progress = 0;
  }
}

class ExponentialNumber {
  constructor({value, decayFactor}) {
    this.value = value;
    this.targetValue = value;
    this.decayFactor = decayFactor;
  }
  
  getValue() {
    return this.value;
  }
  
  update(timeDelta) {
    this.value += (this.targetValue - this.value) * timeDelta * this.decayFactor;
  }
  
  setValue(newValue) {
    this.targetValue = newValue;
  }
}

class Mouse {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;

    window.addEventListener('pointermove', ({clientX, clientY}) => {
      this.x = clientX;
      this.y = clientY;
    });
  }
}

class Camera {
  static scaleChangeFraction = 1 / 400;

  constructor() {
    this.position = {
      x: gameWidth / 2,
      y: gameHeight / 2,
    };

    this.scaleHistory = [];
    let barkBark = 0;
    const barkBarkScale = () => {
      this.scale = (() => {
        switch (barkBark) {
          case 0:
            return new ExponentialNumber({
              value: 1,
              decayFactor: 1 / 100,
            });
          case 1:
            return new QuadraticNumber({
              value: 1,
              transitionDuration: 200,
              peakVelocityProgressFraction: 0.125,
            });
          case 2:
            return new LinearNumber({
              value: 1,
              transitionDuration: 200,
            });
        }
      })();
      barkBark = (barkBark + 1) % 3;
      output.textContent = this.scale.constructor.name;
    };
    barkBarkScale();
    
    window.addEventListener('wheel', ({clientX, clientY, deltaY}) => {
      const scale = this.scale.getValue();
      const newScale = this.scale.targetValue * (1 + Camera.scaleChangeFraction) ** -deltaY;
      this.scale.setValue(newScale);
    });
    window.addEventListener('keydown', ({key}) => {
      const number = Number(key);
      if (!isNaN(key)) {
        this.scale.setValue((1 + Camera.scaleChangeFraction) ** (200 * (number - 5)));
      }
    });
    window.addEventListener('pointerdown', () => {
      barkBarkScale();
    });
  }
  
  update(timeDelta) {
    const scale = this.scale.getValue();
    this.scale.update(timeDelta);
    const newScale = this.scale.getValue();

    this.scaleHistory.push(scale);
    while (this.scaleHistory.length > width) {
      this.scaleHistory.shift();
    }

    // if (scale != newScale) {
    //   this.position.x += (mouse.x - width / 2) * (1 / scale - 1 / newScale);
    //   this.position.y += (mouse.y - height / 2) * (1 / scale - 1 / newScale);
    // }
  }

  draw() {
    context.strokeStyle = 'red';
    context.beginPath();
    context.moveTo(0, height);
    for (let i = 0; i < this.scaleHistory.length; ++i) {
      context.lineTo(i, height * (1 - this.scaleHistory[i] / 4));
    }
    context.stroke();
  }
}

function init() {
  time = 0;
  mouse = new Mouse();
  camera = new Camera();
  planets = range(40).map(_ => new Planet());
}

function update(frameTime, timeDelta) {
  time = frameTime;
  camera.update(timeDelta);
  for (let planet of planets) {
    planet.position.x += deviate(10 - planet.radius / 10);
    planet.position.y += deviate(10 - planet.radius / 10);
  }
}

function draw() {
  context.clearRect(0, 0, width, height);

  context.save();
  const scale = camera.scale.getValue();
  context.scale(scale, scale);
  context.translate(
      width / 2 / scale - camera.position.x,
      height / 2 / scale - camera.position.y);
  
  for (let planet of planets) {
    planet.draw();
  }
  
  context.restore();
  
  camera.draw();
}

function everyFrame(f) {
  let previousFrameTime = 0;
  function frame(frameTime) {
    f(frameTime, frameTime - previousFrameTime);
    previousFrameTime = frameTime;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function main() {
  init();
  everyFrame((time, timeDelta) => {
    update(time, timeDelta);
    draw();
  });
}

main();