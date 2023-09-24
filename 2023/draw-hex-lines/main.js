import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';

async function main() {
  const {
    width,
    height,
    hexLinesContext,
  } = HexLinesContext.setupFullPageContext({pixelSize: 4});
  const hexLines = hexLinesContext.createLines();

  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = width;
  hudCanvas.height = height;
  hudCanvas.style.cssText += `
    position: absolute;
    top: 0px;
    left: 0px;
  `;
  document.body.append(hudCanvas);

  let size = null;
  let colour = null;
  function setRandomSizeColour() {
    size = Math.random() * 50;
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    const max = Math.max(r, g, b);
    colour = {
      r: 255 * (r / max) ** 4,
      g: 255 * (g / max) ** 4,
      b: 255 * (b / max) ** 4,
      a: 255,
    };
  }
  setRandomSizeColour();
  window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      setRandomSizeColour();
    }
  });

  const lines = [];
  let currentLine = null;
  let pointerDown = false;

  function addPoint(event) {
    currentLine.push({
      position: {x: event.clientX - width / 2, y: height / 2 - event.clientY},
      size,
      colour,
    });
  }

  window.addEventListener('pointerdown', event => {
    pointerDown = true;
    currentLine = [];
    lines.push(currentLine);
    addPoint(event);
  });
  window.addEventListener('pointerup', event => {
    pointerDown = false;
  });
  window.addEventListener('pointermove', event => {
    if (!pointerDown) {
      return;
    }
    addPoint(event);
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    hexLines.clear();
    for (const line of lines) {
      for (const point of line) {
        hexLines.addPoint(point);
      }
      if (line.length == 1) {
        hexLines.addPoint(line[0]);
      }
      hexLines.addNull();
    }
    hexLines.draw();
  }
}

main();