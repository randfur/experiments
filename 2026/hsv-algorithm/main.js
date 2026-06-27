const TAU = Math.PI * 2;

function main() {
  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.gap = '10px';
  const h = addSlider('H', 0, render);
  const s = addSlider('S', 0, render);
  const v = addSlider('V', 255, render);

  function render() {
    // console.log(h.value, s.value, v.value);
    const angle = TAU * h.value / 255;
    // 1,1,-1
    // 1,-1,-1
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
    r *= 255 / max;
    g *= 255 / max;
    b *= 255 / max;
    console.log(Math.round(r), Math.round(g), Math.round(b));
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
  slider.addEventListener('change', render);
  row.append(label, slider);
  document.body.append(row);
  return slider;
}

main();
