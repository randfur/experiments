'use strict';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');
const circles = Array(20 + random(20)|0).fill(0).map(_ => createCircle());

let debug = false;

function createCircle() {
  const speed = 50 + random(100);
  return {
    x: width / 2,
    y: height / 2,
    dx: deviate(speed),
    dy: deviate(speed),
    radius: 50 + random(200),
    intersectionAngles: [],
    touching: [],
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

function intersectionTest({x:aX, y:aY, radius:aRadius}, {x:bX, y:bY, radius:bRadius}) {
  const dx = bX - aX;
  const dy = bY - aY;
  const distanceSquared = dx**2 + dy**2;
  if (distanceSquared >= (aRadius + bRadius)**2) {
    return {
      touching: false,
      points: [],
    };
  }
  if (distanceSquared <= (aRadius - bRadius)**2) {
    return {
      touching: true,
      points: [],
    };
  }
  // Solve: (x - aX)**2 + (y - aY)**2 == aRadius**2 && (x - bX)**2 + (y - bY)**2 == bRadius**2
  // Align plane to have circle A at the origin and rotate it such that circle B is along the positive x axis.
  // aRadius**2 - x**2 == bRadius**2 - (x - bX)**2 == bRadius**2 - x**2 + 2 * x * bX - bX**2
  // aRadius**2 - bRadius**2 == 2 * x * bX - bX**2
  // x == (aRadius**2 - bRadius**2 + bX**2) / (2 * bX)
  const distance = Math.sqrt(distanceSquared);
  const midDistance = (aRadius**2 - bRadius**2 + distanceSquared) / (2 * distance)
  const perpDistance = Math.sqrt(aRadius**2 - midDistance**2);
  return {
    touching: true,
    points: [{
      x: aX + (dx * midDistance - dy * perpDistance) / distance,
      y: aY + (dy * midDistance + dx * perpDistance) / distance,
    }, {
      x: aX + (dx * midDistance + dy * perpDistance) / distance,
      y: aY + (dy * midDistance - dx * perpDistance) / distance,
    }],
  };
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
}

function update(timeDelta) {
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
    circle.intersectionAngles.length = 0;
    circle.touching.length = 0;
  }
  for (const i of range(circles.length)) {
    for (let j = i + 1; j < circles.length; ++j) {
      const circleA = circles[i];
      const circleB = circles[j];
      const {touching, points} = intersectionTest(circleA, circleB);
      if (touching) {
        circleA.touching.push(circleB);
        circleB.touching.push(circleA);
      }
      for (const point of points) {
        circleA.intersectionAngles.push(circleAngle(circleA, point));
        circleB.intersectionAngles.push(circleAngle(circleB, point));
      }
    }
  }
  for (const {intersectionAngles} of circles)
    intersectionAngles.sort((a, b) => a - b);
}

function draw() {
  context.clearRect(0, 0, width, height);
  
  if (debug) {
    context.strokeStyle = 'blue';
    context.lineWidth = 1;
    context.beginPath();
    for (const {x, y, radius} of circles) {
      context.moveTo(x + radius, y);
      context.arc(x, y, radius, 0, TAU, true);
    }
    context.stroke();
  }

  context.strokeStyle = 'white';
  context.lineWidth = 2;
  context.beginPath();
  for (const {x, y, radius, intersectionAngles, touching} of circles) {
    const angles = intersectionAngles.length ? intersectionAngles : [0];
    for (let i = 0; i < angles.length; ++i) {
      const angleA = angles[i];
      let angleB = angles[(i + 1) % angles.length];
      if (angleB <= angleA)
        angleB += TAU
      const angleMid = (angleA + angleB) / 2;
      const arcMidX = x + radius * Math.cos(angleMid);
      const arcMidY = y + radius * Math.sin(angleMid);
      let collisionCount = 0;
      for (const {x:otherX, y:otherY, radius:otherRadius} of touching) {
        if ((arcMidX - otherX)**2 + (arcMidY - otherY)**2 <= otherRadius**2)
          ++collisionCount;
      }
      if (collisionCount % 2 == 0)
        continue;
      context.moveTo(x + radius * Math.cos(angleA), y + radius * Math.sin(angleA));
      context.arc(x, y, radius, angleA, angleB, false);
    }
  }
  context.stroke();

  // context.fillStyle = 'white';
  // context.beginPath();
  // for (const {x, y, radius, intersectionAngles} of circles) {
  //   for (const angle of intersectionAngles) {
  //     const intersectionX = x + radius * Math.cos(angle);
  //     const intersectionY = y + radius * Math.sin(angle);
  //     context.moveTo(intersectionX + 2, intersectionY);
  //     context.arc(intersectionX, intersectionY, 2, 0, TAU, true);
  //   }
  // }
  // context.fill();
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
