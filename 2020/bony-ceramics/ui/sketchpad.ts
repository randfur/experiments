import { html } from 'https://unpkg.com/lit-html@1.3.0/lit-html.js';
import { SketchPad } from '../core/sketchpad';
import { injectStyles } from './utils';
import { minimapWidth } from './config';

export function renderSketchPad(sketchPad: SketchPad) {
  return html`
    <div id="sketchpad">
      <div id="leftTools">
        ${sketchPad ? JSON.stringify(sketchPad.controls, null, '  ') : 'no pants'}
      </div>
      <canvas id="viewCanvas"></canvas>
      <div id="rightTools">
        <canvas id="minimapCanvas"></canvas>
      </div>
    </div>
  `;
}

injectStyles(`
#sketchpad {
  height: 100%;
  display: grid;
  grid-template-areas: "left-tools view-canvas right-tools";
  grid-template-columns: 200px 1fr ${minimapWidth}px;
}

#leftTools {
  border: solid;
  grid-area: left-tools;
}

#viewCanvas {
  border: solid;
  grid-area: view-canvas;
}

#rightTools {
  border: solid;
  grid-area: right-tools;
}
`);
