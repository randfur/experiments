import {random, deviate} from './utils/random.js';
import {TAU} from './utils/math.js';
import {nextEvent, nextOfEvents} from './utils/event.js';

const sketchWidth = 100;
const sketchHeight = 100;

let sketchCanvas = null;

export async function* getSketches() {
  while (true) {
    sketchCanvas = new OffscreenCanvas(sketchWidth, sketchHeight);
    const sketchContext = sketchCanvas.getContext('2d');
    sketchContext.fillStyle = 'black';
    function drawOnSketch(event) {
      sketchContext.beginPath();
      sketchContext.arc(event.clientX, event.clientY, 4, 0, TAU);
      sketchContext.fill();
    }

    const event = await nextEvent(window, 'mousedown', eventInSketch);
    drawOnSketch(event);

    while (true) {
      const event = await nextOfEvents(window, ['mousemove', 'mouseup']);
      if (event.type == 'mouseup') {
        break;
      }
      if (eventInSketch(event)) {
        drawOnSketch(event);
      }
    }
    
    yield sketchCanvas;
    sketchCanvas = null;
  }
}

function eventInSketch({clientX, clientY}) {
  return clientX < sketchWidth && clientY < sketchHeight;
}

export function drawSketching(context) {
  context.strokeStyle = 'black';
  context.fillStyle = 'white';
  context.beginPath();
  context.rect(0, 0, sketchWidth, sketchHeight);
  context.fill();
  context.stroke();
  if (sketchCanvas) {
    context.drawImage(sketchCanvas, 0, 0);
  }
}
