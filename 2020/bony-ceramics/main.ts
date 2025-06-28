import { render, html } from 'https://unpkg.com/lit-html@1.3.0/lit-html.js';
import { renderSketchPad } from './ui/sketchpad';
import { SketchPad } from '/core/sketchpad';
import { Controls } from '/core/controls';

const appDiv = document.getElementById('app');
let controls = new Controls();
let sketchPad: SketchPad = null;

function updateUi() {
  render(renderSketchPad(sketchPad), appDiv);
}

function main() {
  updateUi();

  sketchPad = new SketchPad({
    viewCanvas: document.getElementById('viewCanvas') as HTMLCanvasElement,
    minimapCanvas: document.getElementById('minimapCanvas') as HTMLCanvasElement,
    getControls() { return controls; },
    updateUi,
  });
  
  updateUi();
}
main();