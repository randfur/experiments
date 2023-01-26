
async function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', {
    willReadFrequently: true,
  });

  const r = randomInteger(255);
  const g = randomInteger(255);
  const b = randomInteger(255);
  context.fillStyle = `rgb(${r}, ${g}, ${b})`;
  const boxSize = 4;

  MouseEvents.register({
    click(button, x, y) {
      if (button === MouseEvents.kLeftButton) {
        fillBoxAtPoint({
          context,
          x, y,
          boxSize,
        });
      } else if (button === MouseEvents.kRightButton) {
        fillFromPoint({
          width, height, context,
          x, y,
          r, g, b,
        });
      }
    },
    drag(button, previousX, previousY, newX, newY) {
      if (button === MouseEvents.kLeftButton) {
        const drawSize = 4;
        let x = previousX;
        let y = previousY;
        while (true) {
          const stepX = Math.sign(newX - x);
          const stepY = Math.sign(newY - y);
          if (stepX === 0 && stepY === 0) {
            break;
          }
          fillBoxAtPoint({
            context,
            x, y,
            size: boxSize,
          });
          x += stepX;
          y += stepY;
        }
      }
    },
  });
}

class MouseEvents {
  static kLeftButton = 0;
  static kMiddleButton = 1;
  static kRightButton = 2;

  static down = [false, false, false];
  static x = 0;
  static y = 0;

  static register({drag, click}) {
    window.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('mousedown', event => {
      this.down[event.button] = true;
      this.x = event.offsetX;
      this.y = event.offsetY;
      click(event.button, this.x, this.y);
    });
    window.addEventListener('mouseup', event => {
      this.down[event.button] = false;
    });
    window.addEventListener('mousemove', event => {
      const previousX = this.x;
      const previousY = this.y;
      this.x = event.offsetX;
      this.y = event.offsetY;
      for (const button in this.down) {
        if (this.down[button]) {
          drag(event.button, previousX, previousY, this.x, this.y);
        }
      }
    });
  }
}

function randomInteger(n) {
  return Math.round(Math.random() * n);
}

function fillBoxAtPoint({context, x, y, size}) {
  const boxX = Math.floor(x - size / 2);
  const boxY = Math.floor(y - size / 2);
  context.fillRect(boxX, boxY, size, size);
}

function fillFromPoint({width, height, context, x, y, r, g, b}) {
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  function encodeBitmapXY(x, y) {
    return (x + 1) + (y + 1) * (width + 2);
  }
  const queue = [encodeBitmapXY(Math.round(x), Math.round(y))];
  while (queue.length > 0) {
    const next = queue.pop();
    const x = next % (width + 2) - 1;
    const y = Math.floor(next / (width + 2)) - 1;
    if (x < 0 || x >= width || y < 0 || y >= height)
      continue;
    if (pixels[4 * (x + y * width) + 3] != 0)
      continue;
    const index = 4 * (x + y * width);
    pixels[index + 0] = r;
    pixels[index + 1] = g;
    pixels[index + 2] = b;
    pixels[index + 3] = 255;
    queue.push(
      encodeBitmapXY(x - 1, y),
      encodeBitmapXY(x + 1, y),
      encodeBitmapXY(x, y - 1),
      encodeBitmapXY(x, y + 1),
    );
  }
  context.putImageData(imageData, 0, 0);
}

main();