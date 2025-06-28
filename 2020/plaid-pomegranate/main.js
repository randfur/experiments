import {log, clearLog, random, randomRangeLow, pickRandom, deviate, Grid} from './utils.js';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;

const canvas = document.getElementById('canvas');
let context = null;

const accelerometer = 'Accelerometer' in window ? new Accelerometer() : null;
const fallbackGravityMax = 5;
let fallbackGravityX = 0;
let fallbackGravityY = fallbackGravityMax;

const grid = new Grid(width, height, 100);

const circles = [];
const circleCount = 30;
const circleMaxSpeed = 400;
const circleMinRadius = 10;
const circleMaxRadius = 100;
const circleColours = [
  'red',
  'lime',
  'blue',
  'yellow',
  'orange',
  'magenta',
];
const circleDefaultColour = 'white';
const defaultColourChance = 0.95;
let lastCircleId = 0;

const gravity = 100;
const airFriction = 0.002;

let debug = false;

function createCircle(x, y, colour) {
  const radius = randomRangeLow(circleMinRadius, circleMaxRadius);
  const id = lastCircleId++;
  return {
    id,
    colour,
    lastCheck: null,
    x,
    y,
    dx: deviate(circleMaxSpeed),
    dy: deviate(circleMaxSpeed),
    radius,
    mass: TAU * radius ** 2 / 2,
  };
}

function init() {
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  
  if (accelerometer) {
    accelerometer.start();
  }
  
  for (let i = 0; i < circleCount; ++i) {
    circles.push(createCircle(random(width), random(height), circleColours[i] ?? circleDefaultColour));
  }
  
  window.addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('keydown', handleKeyDown);
}

function handlePointerDown(event) {
  const x = event.clientX;
  const y = event.clientY;

  if (event.button == 2) {
    fallbackGravityX = -fallbackGravityMax * (x / width * 2 - 1);
    fallbackGravityY = fallbackGravityMax * (y / height * 2 - 1);
    return;
  }
  
  for (let i = 0; i < circles.length; ++i) {
    const circle = circles[i];
    if ((circle.x - x) ** 2 + (circle.y - y) ** 2 <= circle.radius ** 2) {
      circles.splice(i, 1);
      return;
    }
  }
  circles.push(createCircle(x, y, random(1) < defaultColourChance ? circleDefaultColour : pickRandom(circleColours)));
}

function handleKeyDown(event) {
  debug ^= event.key == 'd';
  clearLog();
}

let lastTime = 0;
function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(time => {
      resolve(Math.min((time - lastTime) / 1000, 1));
      lastTime = time;
    });
  });
}

function bounceCircleX(circle, x, normal) {
  if (circle.dx * normal < 0 && normal * (circle.x - circle.radius * normal - x) <= 0) {
    circle.x = x + circle.radius * normal;
    circle.dx *= -1;
  }
}

function bounceCircleY(circle, y, normal) {
  if (circle.dy * normal < 0 && normal * (circle.y - circle.radius * normal - y) <= 0) {
    circle.y = y + circle.radius * normal;
    circle.dy *= -1;
  }
}

function update(delta) {
  grid.clear();
  for (const circle of circles) {
    circle.lastCheck = null;
    grid.insert(circle.x, circle.y, circle.radius, circle);
  }
  
  let circleChecks = 0;
  let collisionChecks = 0;
  let collisions = 0;
  for (let i = 0; i < circles.length; ++i) {
    const circle = circles[i];
    for (const cell of grid.query(circle.x, circle.y, circle.radius)) {
      for (const other of cell) {
        ++circleChecks;
        if (other.id <= circle.id || other.lastCheck == circle) {
          continue;
        }
        ++collisionChecks;
        other.lastCheck = circle;
        const diffX = other.x - circle.x;
        const diffY = other.y - circle.y;
        const squareDistance = diffX ** 2 + diffY ** 2;
        if (squareDistance > 0 && squareDistance < (other.radius + circle.radius) ** 2) {
          ++collisions;
          if (diffX * (other.dx - circle.dx) + diffY * (other.dy - circle.dy) < 0) {
            const distance = Math.sqrt(squareDistance);
            const dx = diffX / distance;
            const dy = diffY / distance;
            const a = (circle.mass + other.mass) / (2 * circle.mass * other.mass);
            const b = dx * (other.dx - circle.dx) + dy * (other.dy - circle.dy);
            const k = -b / a;
            circle.dx -= k * dx / circle.mass;
            circle.dy -= k * dy / circle.mass;
            other.dx += k * dx / other.mass;
            other.dy += k * dy / other.mass;
          }
        }
      }
    }
  }
  
  if (debug) {
    clearLog();
    log('Worst case checks: ' + (circles.length ** 2 + circles.length) / 2);
    log('circleChecks: ' + circleChecks);
    log('collisionChecks: ' + collisionChecks);
    log('collisions: ' + collisions);
  }
  
  for (const circle of circles) {
    circle.dx -= gravity * (accelerometer?.x ?? fallbackGravityX) * delta;
    circle.dy += gravity * (accelerometer?.y ?? fallbackGravityY) * delta;

    bounceCircleX(circle, 0, 1);
    bounceCircleX(circle, width, -1);
    bounceCircleY(circle, 0, 1);
    bounceCircleY(circle, height, -1);

    circle.x += circle.dx * delta;
    circle.y += circle.dy * delta;
    
    circle.dx *= 1 - airFriction;
    circle.dy *= 1 - airFriction;
  }
}

function render() {
  context.clearRect(0, 0, width, height);

  if (debug) {
    context.strokeStyle = '#333';
    context.beginPath();
    for (let row = 0; row < grid.rows; ++row) {
      context.moveTo(0, (row + 1) * grid.cellSize);
      context.lineTo(width, (row + 1) * grid.cellSize);
    }
    for (let col = 0; col < grid.cols; ++col) {
      context.moveTo((col + 1) * grid.cellSize, 0);
      context.lineTo((col + 1) * grid.cellSize, height);
    }
    context.stroke();
  }
  
  for (const circle of circles) {
    context.fillStyle = circle.colour;
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, TAU);
    context.fill();
  }
}

async function main() {
  init();
  while (true) {
    const delta = await nextFrame();
    update(delta);
    render();
  }
}
main();