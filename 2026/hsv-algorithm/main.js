const TAU = Math.PI * 2;

function main() {
  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.gap = '10px';
  document.body.style.whiteSpace = 'pre';
  document.body.style.fontFamily = 'monospace';
  const algorithmLabel = addLabel(hsvToRgb);
  const hSlider = addSlider('H', 0, render);
  const sSlider = addSlider('S', 255, render);
  const vSlider = addSlider('V', 255, render);
  const rgbLabel = addLabel();
  const context = addCanvas(400, 100);
  addHueComparison();

  function render() {
    hsvToRgb(hSlider.value, sSlider.value, vSlider.value);
    rgbLabel.textContent = `rgb(${r}, ${g}, ${b})`;
    context.fillStyle = rgbLabel.textContent;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  render();
}

let r = 0;
let g = 0;
let b = 0;
function hsvToRgb(h, s, v) {
  const angle = TAU * h / 255;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
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

function addSlider(text, initialValue, render) {
  const row = document.createElement('div');
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
  row.append(label, slider, value);
  document.body.append(row);
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
  const trigLabel = document.createElement('div');
  trigLabel.textContent = 'Trig:';
  const linearLabel = document.createElement('div');
  linearLabel.textContent = 'Linear:';
  labelContainer.append(trigLabel, linearLabel);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 30;
  const context = canvas.getContext('2d');
  for (let i = 0; i < 256; ++i) {
    hsvToRgb(i, 255, 255);
    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    context.fillRect(i, 0, 1, 15);
    context.fillStyle = `hsl(${i * 360 / 255}deg 100% 50%)`;
    context.fillRect(i, 15, 1, 15);
  }

  container.append(labelContainer, canvas);
  document.body.append(container);
}

main();
