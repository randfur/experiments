const TAU = Math.PI * 2;
const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');

let mouseX = 0;
let mouseY = 0;

function drawRing(x, y, rotation) {
  const innerRadius = 75;
  const ringThickness = 40;
  const backingRingExtrusion = 1.5;
  drawSegments(x, y, innerRadius - backingRingExtrusion, backingRingExtrusion * 3, rotation + (mouseX / width - 0.5) * 2);
  drawSegments(x, y, innerRadius + ringThickness - backingRingExtrusion * 2, backingRingExtrusion * 3, rotation + (mouseY / height - 0.5) * 2);
  drawSegments(x, y, innerRadius, ringThickness, rotation);
  // drawArrow(x, y);
}

function drawSegments(x, y, innerRadius, ringThickness, rotation) {
  const segments = 200;
  for (let i = 0; i < segments; ++i) {
    const startProgress = i / segments;
    const endProgress = (i + 1.2) / segments;
    context.fillStyle = `hsl(50deg, 0%, ${Math.pow(0.5 + Math.sin((rotation - startProgress) * TAU) / 2, 1.5) * 100}%)`;
    // context.fillStyle = `hsl(${(rotation - startProgress) * 360}deg, 100%, 50%)`;
    context.beginPath();
    context.arc(x, y, innerRadius, startProgress * TAU, endProgress * TAU, false);
    context.arc(x, y, innerRadius + ringThickness, endProgress * TAU, startProgress * TAU, true);
    context.fill();
  }
}

function drawArrow(x, y) {
  const thickness = 10;
  const headSize = 20;
  const length = 60;
  context.save();
  context.translate(x, y);
  context.rotate(Math.atan2(mouseY - y, mouseX - x));
  context.fillStyle = '#626165';
  context.beginPath();
  context.moveTo(-length / 2, -thickness / 2);
  context.lineTo(length / 2 - headSize, -thickness / 2);
  context.lineTo(length / 2 - headSize, - headSize);
  context.lineTo(length / 2, 0);
  context.lineTo(length / 2 - headSize, headSize);
  context.lineTo(length / 2 - headSize, thickness / 2);
  context.lineTo(-length / 2, thickness / 2);
  context.fill();
  context.restore();
}

async function main() {
  canvas.width = width;
  canvas.height = height;
  canvas.style.filter = 'blur(0.7px)';
  
  addEventListener('pointermove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  
  while (true) {
    const time = await new Promise(requestAnimationFrame);

    context.clearRect(0, 0, width, height);
    const rotation = -time / 400;
    drawRing(width / 2 - 150, height / 2, rotation);
    drawRing(width / 2 + 150, height / 2, rotation);
  }
}

main();