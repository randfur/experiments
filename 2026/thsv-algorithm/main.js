const TAU = Math.PI * 2;

function main() {
  document.body.style.display = 'flex';
  document.body.style.alignItems = 'flex-start';
  document.body.style.flexDirection = 'column';
  document.body.style.gap = '10px';
  document.body.style.whiteSpace = 'pre';
  document.body.style.fontFamily = 'monospace';
  const algorithmLabel = addLabel(thsvToRgb);
  const grid = addGrid(3);
  const thSlider = addSlider(grid, 'TH', 0, render);
  const sSlider = addSlider(grid, 'S', 255, render);
  const vSlider = addSlider(grid, 'V', 255, render);
  const rgbLabel = addLabel();
  const context = addCanvas(400, 100);
  addHueComparison();

  function render() {
    thsvToRgb(thSlider.value, sSlider.value, vSlider.value);
    rgbLabel.textContent = `rgb(${r}, ${g}, ${b})`;
    context.fillStyle = rgbLabel.textContent;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  render();
}

const rgbCircleXy = (() => {
  const sqrt1_3 = Math.sqrt(1 / 3);
  const normal = {
    x: sqrt1_3,
    y: sqrt1_3,
    z: sqrt1_3,
  };
  const x = {x: 1, y: 0, z: 0};
  const dot = normal.x * x.x + normal.y * x.y + normal.z * x.z;
  // Project X onto normal N = X - X.N*N
  const circleX = {
    x: x.x - dot * normal.x,
    y: x.y - dot * normal.y,
    z: x.z - dot * normal.z,
  };
  // Cross product:
  //      [ x y z ]
  // det( [ a b c ] )
  //      [ d e f ]
  const circleY = {
    x: normal.y * circleX.z - normal.z * circleX.y,
    y: normal.z * circleX.x - normal.x * circleX.z,
    z: normal.x * circleX.y - normal.y * circleX.x,
  };
  return {
    x: circleX,
    y: circleY,
  };
})();
let r = 0;
let g = 0;
let b = 0;
function thsvToRgb(th, s, v) {
  const angle = TAU * th / 255;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  r = rgbCircleXy.x.x * cos + rgbCircleXy.y.x * sin;
  g = rgbCircleXy.x.y * cos + rgbCircleXy.y.y * sin;
  b = rgbCircleXy.x.z * cos + rgbCircleXy.y.z * sin;
  r = cos + sin;
  g = -cos + sin;
  b = -cos - sin;
  const min = Math.min(r, g, b);
  r -= min;
  g -= min;
  b -= min;
  const max = Math.max(r, g, b);
  r /= max;
  g /= max;
  b /= max;
  const sFraction = s / 255;
  r = Math.round((r * sFraction + (1 - sFraction)) * v);
  g = Math.round((g * sFraction + (1 - sFraction)) * v);
  b = Math.round((b * sFraction + (1 - sFraction)) * v);
}

function addGrid(columns) {
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${columns}, max-content)`;
  document.body.append(grid);
  return grid;
}

function addSlider(container, text, initialValue, render) {
  const label = document.createElement('span');
  label.textContent = text;
  const slider = document.createElement('input');
  slider.style.width = '500px';
  slider.type = 'range';
  slider.min = 0;
  slider.max = 255;
  slider.step = 1;
  slider.value = initialValue;
  const value = document.createElement('span');
  value.textContent = initialValue;
  slider.addEventListener('input', () => {
    render();
    value.textContent = slider.value;
  });
  container.append(label, slider, value);
  return slider;
}

function addLabel(initialText = '') {
  const label = document.createElement('div');
  label.textContent = initialText;
  document.body.append(label);
  return label;
}

function addCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  return canvas.getContext('2d');
}

function addHueComparison() {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'row';

  const labelContainer = document.createElement('div');
  labelContainer.style.display = 'flex';
  labelContainer.style.flexDirection = 'column';
  labelContainer.style.justifyContent = 'space-evenly';
  const trigLabel = document.createElement('div');
  trigLabel.textContent = 'Trig:';
  const linearLabel = document.createElement('div');
  linearLabel.textContent = 'Linear:';
  labelContainer.append(trigLabel, linearLabel);

  const canvas = document.createElement('canvas');
  canvas.width = 256 * 2;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  for (let i = 0; i < 256; ++i) {
    thsvToRgb(i, 255, 255);
    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    context.fillRect(i, 0, 1, canvas.height / 2);
    context.fillStyle = `hsl(${i * 360 / 255}deg 100% 50%)`;
    context.fillRect(i, canvas.height / 2, 1, canvas.height / 2);
  }
  const data = context.getImageData(0, 0, 256, canvas.height).data;
  context.globalCompositeOperation = 'lighter';
  function drawChannel(x, y, channelIndex, colour) {
    const value = data[4 * (256 * y + x) + channelIndex];
    context.fillStyle = colour;
    context.fillRect(256 + x, y - (canvas.height / 2 - 1) * (value / 256), 2, 2);
  }
  for (let i = 0; i < 256; ++i) {
    drawChannel(i, canvas.height / 2 - 1, 0, 'red');
    drawChannel(i, canvas.height / 2 - 1, 1, 'lime');
    drawChannel(i, canvas.height / 2 - 1, 2, 'blue');
    drawChannel(i, canvas.height - 1, 0, 'red');
    drawChannel(i, canvas.height - 1, 1, 'lime');
    drawChannel(i, canvas.height - 1, 2, 'blue');
  }

  container.append(labelContainer, canvas);
  document.body.append(container);
}

main();
