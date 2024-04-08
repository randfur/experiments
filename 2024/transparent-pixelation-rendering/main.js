import {Render} from './render.js';

const width = 1000;
const height = 500;

function main() {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const render = new Render(canvas);

  const textarea = document.createElement('textarea');
  textarea.style.width = '${width}px';
  textarea.style.height = '${height}px';
  textarea.addEventListener('input', updateDrawing);
  function updateDrawing() {
    let drawing = null;
    try {
      drawing = eval(`(${textarea.value})`);
    } catch (error) {
      console.log(error);
      return;
    }
    render.draw(drawing);
  }
  textarea.value = initialJson5;
  updateDrawing();

  document.body.append(
    canvas,
    document.createElement('br'),
    textarea,
  );
}

const initialJson5 = `{
  alpha: 1,
  pixelSize: 1,
  drawings: [{
    alpha: 1,
    pixelSize: 4,
    drawings: [{
      colour: 'red',
      size: 70,
      x: 140,
      y: 200,
    }, {
      colour: 'orange',
      size: 50,
      x: 190,
      y: 150,
    }],
  }, {
    colour: 'yellow',
    size: 60,
    x: 210,
    y: 220,
  }, {
    alpha: 0.5,
    pixelSize: 8,
    drawings: [{
      colour: 'lime',
      size: 70,
      x: 270,
      y: 180,
    }, {
      alpha: 0.5,
      pixelSize: 4,
      drawings: [{
        colour: 'purple',
        size: 80,
        x: 210,
        y: 290,
      }],
    }],
  }],
}
`;

main();