import { DrawingBoard } from './drawing-board.js';
import { CommandWheel } from './command-wheel.js';
import {
  kLeftButton,
  kRightButton,
} from './utils.js';

const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');

async function main() {
  const drawingBoard = new DrawingBoard(width, height);
  let commandWheel = null;

  canvas.addEventListener('contextmenu', event => event.preventDefault());

  canvas.addEventListener('mousedown', event => {
    if (commandWheel) {
      if (!commandWheel.handleMouseDown(event)) {
        return;
      }
    } else if (event.button == kRightButton) {
      commandWheel = new CommandWheel(event, () => commandWheel = null, drawingBoard);
      drawingBoard.stopAction();
      return;
    }

    drawingBoard.handleMouseDown(event);
  });
  
  canvas.addEventListener('mousemove', event => {
    if (commandWheel && !commandWheel.handleMouseMove(event)) {
      return;
    }
    drawingBoard.handleMouseMove(event);
  });
  
  canvas.addEventListener('mouseup', event => {
    if (commandWheel && !commandWheel.handleMouseUp(event)) {
      return;
    }
    drawingBoard.handleMouseUp(event);
  });
  
  while (true) {
    await new Promise(requestAnimationFrame);
    context.clearRect(0, 0, width, height);
    drawingBoard.draw(context);
    commandWheel?.draw(context);
  }
}
main();
