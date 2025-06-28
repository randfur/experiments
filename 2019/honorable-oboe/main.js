'use strict';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');
const circles = Array(40 + random(40) | 0).fill(0).map(_ => createCircle());

let debug = false;
let frameNumber = 0;

function createCircle() {
  const speed = 10 + random(20);
  return {
    x: width / 2,
    y: height / 2,
    dx: deviate(speed),
    dy: deviate(speed),
    radius: 50 + random(100),
    intersectionAnglesA: [],
    intersectionAnglesB: [],
  };
}
  
function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return Math.random() * 2 * x - x;
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i)
    result.push(i);
  return result;
}

function intersectionPoints({x:aX, y:aY, radius:aRadius}, {x:bX, y:bY, radius:bRadius}) {
  const dx = bX - aX;
  const dy = bY - aY;
  const distanceSquared = dx**2 + dy**2;
  if (distanceSquared >= (aRadius + bRadius)**2)
    return [];
  if (distanceSquared <= (aRadius - bRadius)**2)
    return [];
  // Solve: (x - aX)**2 + (y - aY)**2 == aRadius**2 && (x - bX)**2 + (y - bY)**2 == bRadius**2
  // Align plane to have circle A at the origin and rotate it such that circle B is along the positive x axis.
  // aRadius**2 - x**2 == bRadius**2 - (x - bX)**2 == bRadius**2 - x**2 + 2 * x * bX - bX**2
  // aRadius**2 - bRadius**2 == 2 * x * bX - bX**2
  // x == (aRadius**2 - bRadius**2 + bX**2) / (2 * bX)
  const distance = Math.sqrt(distanceSquared);
  const midDistance = (aRadius**2 - bRadius**2 + distanceSquared) / (2 * distance)
  const perpDistance = Math.sqrt(aRadius**2 - midDistance**2);
  return [{
    x: aX + (dx * midDistance - dy * perpDistance) / distance,
    y: aY + (dy * midDistance + dx * perpDistance) / distance,
  }, {
    x: aX + (dx * midDistance + dy * perpDistance) / distance,
    y: aY + (dy * midDistance - dx * perpDistance) / distance,
  }];
}

function circleAngle({x:circleX, y:circleY}, {x, y}) {
  return Math.atan2(y - circleY, x - circleX);
}

function init() {
  canvas.width = width;
  canvas.height = height;
  window.addEventListener('keydown', ({key}) => {
    if (key == 'd') {
      debug ^= true;
    }
  });
  window.addEventListener('click', _ => {
    debug ^= true;
  });
}

function update(timeDelta) {
  frameNumber++;

  for (const circle of circles) {
    circle.x += circle.dx * timeDelta;
    circle.y += circle.dy * timeDelta;
    const x = circle.x;
    const y = circle.y;
    if (circle.x < 0)
      circle.x *= -1;
    if (circle.y < 0)
      circle.y *= -1;
    if (circle.x > width)
      circle.x -= circle.x - width;
    if (circle.y > height)
      circle.y -= circle.y - height;
    if (circle.x != x)
      circle.dx *= -1;
    if (circle.y != y)
      circle.dy *= -1;
    circle.intersectionAnglesA.length = 0;
    circle.intersectionAnglesB.length = 0;
  }

  for (const i of range(circles.length)) {
    for (let j = i + 1; j < circles.length; ++j) {
      const circleA = circles[i];
      const circleB = circles[j];
      const points = intersectionPoints(circleA, circleB);
      if (points.length == 2) {
        circleA.intersectionAnglesA.push(circleAngle(circleA, points[0]));
        circleB.intersectionAnglesB.push(circleAngle(circleB, points[1]));
      }
    }
  }
}

function draw() {
  context.globalCompositeOperation = 'source-over';
  if (frameNumber % 2 == 0) {
    context.fillStyle = '#0001';
    context.fillRect(0, 0, width, height);
  }
  
  if (debug) {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;
    context.strokeStyle = 'blue';
    context.beginPath();
    for (const {x, y, radius} of circles) {
      context.moveTo(x + radius, y);
      context.arc(x, y, radius, 0, TAU, true);
    }
    context.stroke();
  } else {
    context.globalCompositeOperation = 'screen';
  }

  const dotRadius = 4;
  for (const [colour, angles] of [['#570000', 'intersectionAnglesA'], ['#00f', 'intersectionAnglesB']]) {
    context.fillStyle = debug ? 'white' : colour;
    context.beginPath();
    for (const circle of circles) {
      const {x, y, radius} = circle;
      for (const angle of circle[angles]) {
        const intersectionX = x + radius * Math.cos(angle);
        const intersectionY = y + radius * Math.sin(angle);
        context.moveTo(intersectionX + dotRadius, intersectionY);
        context.arc(intersectionX, intersectionY, dotRadius, 0, TAU, true);
      }
    }
    context.fill();
  }
}

function eachFrame(f) {
  let previousTime = null;
  function frame(time) {
    const timeDelta = previousTime == null ? 0 : time - previousTime;
    f(timeDelta / 1000);
    previousTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function main() {
  init();
  eachFrame(timeDelta => {
    update(timeDelta);
    draw();
  });
}
main();
