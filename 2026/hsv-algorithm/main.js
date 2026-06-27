const TAU = Math.PI * 2;

function main() {
  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.gap = '10px';
  document.body.style.whiteSpace = 'pre';
  document.body.style.fontFamily = 'monospace';
  const algorithmLabel = addLabel(render);
  const hSlider = addSlider('H', 0, render);
  const sSlider = addSlider('S', 255, render);
  const vSlider = addSlider('V', 255, render);
  const rgbLabel = addLabel();
  const context = addCanvas();
  render();

  function render() {
    const angle = TAU * hSlider.value / 255;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let r = cos + sin;
    let g = -cos + sin;
    let b = -cos - sin;
    const min = Math.min(r, g, b);
    r -= min;
    g -= min;
    b -= min;
    const max = Math.max(r, g, b);
    r /= max;
    g /= max;
    b /= max;
    const s = sSlider.value / 255;
    const v = vSlider.value;
    r = Math.round((r * s + (1 - s)) * v);
    g = Math.round((g * s + (1 - s)) * v);
    b = Math.round((b * s + (1 - s)) * v);
    rgbLabel.textContent = `rgb(${r}, ${g}, ${b})`;
    context.fillStyle = rgbLabel.textContent;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }
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

function addCanvas() {
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  return canvas.getContext('2d');
}

main();
