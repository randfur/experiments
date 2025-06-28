const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;

const canvas = document.getElementById('canvas');
let context = null;

let x = width / 2;
let y = height / 2;
let radius = 40;

const groundY = height * 0.8;

function init() {
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
}

let lastMilliseconds = 0;
function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(milliseconds => {
      resolve((milliseconds - lastMilliseconds) / 1000);
      lastMilliseconds = milliseconds;
    });
  })
}

function update(delta) {
  
}

function render() {
  context.clearRect(0, 0, width, height);
  
  context.lineWidth = 2;
  context.strokeStyle = 'white';
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arc(x, y, radius, 0, TAU);

  context.moveTo(0, groundY);
  context.lineTo(width, groundY);
  for (let x = 0; x < width + 40; x += 40) {
    context.moveTo(x, groundY);
    context.lineTo(x + 20, groundY + 20);
  }
  context.stroke();
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