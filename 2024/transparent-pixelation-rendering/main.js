const width = 1000;
const height = 500;

function main() {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const textarea = document.createElement('textarea');
  textarea.style.width = '${width}px';
  textarea.style.height = '${height}px';
  textarea.addEventListener('input', event => {
    let drawing = null;
    try {
      drawing = eval(textarea.value);
    } catch (error) {
      console.log(error);
      return;
    }
    draw(drawing);
  });

  const render = new Render(canvas);

  document.body.append(
    canvas,
    document.createElement('br'),
    textarea,
  );

  draw(initialJson5);
}

// Spares: 🍏🍉🍓🍅
const initialJson5 = `{
  alpha: 1,
  drawings: [{
    alpha: 1,
    drawings: [{
      emoji: '🍎',
      x: 20,
      y: 400,
      pixelSize: 4,
    }, {
      emoji: '🍊',
      x: 80,
      y: 400,
      pixelSize: 4,
    }],
  }, {
    emoji: '🍋',
    x: 100,
    y: 400,
    pixelSize: 4,
  }, {
    alpha: 0.5,
    drawings: [{
      emoji: '🍐',
      x: 140,
      y: 400,
      pixelSize: 8,
    }, {
      alpha: 0.5,
      drawings: [{
        emoji: '🍇',
        x: 150,
        y: 400,
        pixelSize: 10,
      }],
    }],
  }],
}
`;

main();