const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');

const mainValues = [];
const diffValuesCount = 20;
const diffValuesList = [];

function init() {
  canvas.width = width;
  canvas.height = height;
  
  for (let i = 0; i < width; ++i) {
    mainValues.push(0);
  }
  for (let i = 0; i < diffValuesCount; ++i) {
    const diffValues = [];
    for (let j = 0; j < width - i - 1; ++j) {
      diffValues.push(0);
    }
    diffValuesList.push(diffValues);
  }
}

function registerEvents() {
  let lastSetX = null;
  let lastSetY = null;
  window.addEventListener('pointermove', event => {
    const x = Math.floor(event.clientX);
    const y = height / 2 - event.clientY;
    if (lastSetX === null || lastSetX === x) {
      mainValues[x] = y;
    } else {
      const direction = Math.sign(x - lastSetX);
      for (let i = lastSetX; i != x + direction; i += direction) {
        mainValues[i] = lastSetY + (y - lastSetY) * ((i - lastSetX) / (x - lastSetX));
      }
    }

    lastSetX = x;
    lastSetY = y;
    
    computeDiffValues();
    draw();
  });

  window.addEventListener('touchmove', event => event.preventDefault(), {passive: false});
}

function diff(a, b) {
  return b - a;
}

function computeDiffValues() {
  for (let i = 0; i < mainValues.length - 1; ++i) {
    diffValuesList[0][i] = diff(mainValues[i], mainValues[i + 1]);
  }

  for (let i = 1; i < diffValuesList.length; ++i) {
    for (let j = 0; j < diffValuesList[i].length; ++j) {
      diffValuesList[i][j] = diff(diffValuesList[i - 1][j], diffValuesList[i - 1][j + 1]);
    }
  }
}

function draw() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < diffValuesList.length; ++i) {
    const diffValues = diffValuesList[i];
    context.strokeStyle = `rgba(255, 0, 0, ${Math.floor(100 * (1 - (i + 1) / diffValuesCount))}%)`;
    context.beginPath();
    context.moveTo((i + 1) / 2, height / 2 - diffValues[0]);
    for (let j = 1; j < diffValues.length; ++j) {
      context.lineTo((i + 1) / 2 + j, height / 2 - diffValues[j]);
    }
    context.stroke();
  }

  context.strokeStyle = 'white';
  context.beginPath();
  context.moveTo(0, height / 2 - mainValues[0]);
  for (let i = 1; i < width; ++i) {
    context.lineTo(i, height / 2 - mainValues[i]);
  }
  context.stroke();
}

function main() {
  init();
  registerEvents();
  draw();
}
main();