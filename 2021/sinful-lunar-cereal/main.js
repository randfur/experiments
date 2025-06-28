const TAU = Math.PI * 2;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const width = innerWidth;
const height = innerHeight;

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

async function main() {
  canvas.width = width;
  canvas.height = height;

  const stars = range(20).map(() => ({
    x: random(width),
    y: random(height),
  }));
  
  const planets = range(10).map(() => ({
    x: random(width),
    y: random(height),
    radius: 10 + random(50),
  }));
  
  while (true) {
    await new Promise(requestAnimationFrame);

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    
    context.fillStyle = 'grey';
    for (const star of stars) {
      context.fillRect(star.x, star.y, 2, 2);
    }
    context.fillStyle = 'white';
    context.beginPath();
    for (const {x, y, radius} of planets) {
      context.moveTo(x + radius, y);
      context.arc(x, y, radius, 0, TAU);
    }
    context.fill();
  }
}
main();