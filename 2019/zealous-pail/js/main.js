import {TAU, randInt, biasedRandInt} from './utils.js';
import Canvas from './canvas.js';
import Config from './config.js';
import Grid from './grid.js';
import Hash from './hash.js';
import PresetRulesEncodings from './preset-rules-encodings.js';
import Rules from './rules.js';
import Rule from './rule.js';

function main() {
  Canvas.setup();
  registerControls();

  const rulesEncoding = Hash.get() || PresetRulesEncodings.loadRandom();
  Rules.setupFromRulesEncoding(rulesEncoding);
  PresetRulesEncodings.displayNameForEncoding(rulesEncoding);
  Hash.set(rulesEncoding);
  Grid.setup();
  
  requestAnimationFrame(frame);
}

function registerControls() {
  Canvas.element.addEventListener('click', setupRandomRules);
  window.addEventListener('keyup', setupRandomRules);

  window.addEventListener('resize', () => {
    Canvas.setup();
    Grid.setup();
  });
  
  document.getElementById('presetButton').addEventListener('click', () => {
    const rulesEncoding = PresetRulesEncodings.loadRandom();
    PresetRulesEncodings.displayNameForEncoding(rulesEncoding);
    Hash.set(rulesEncoding);
    Rules.setupFromRulesEncoding(rulesEncoding);
    Grid.setup();
  });

  window.addEventListener('mousemove', ({clientX, clientY}) => {
    const cursorX = Math.round(clientX / Config.cellSize - 0.5);
    const cursorY = Math.round(clientY / Config.cellSize - 0.5);
    for (let repeat = 0; repeat < Config.cursorDots; ++repeat) {
      const angle = Math.random() * TAU;
      const radius = randInt(Config.cursorRadius);
      const x = Math.round(cursorX + Math.cos(angle) * radius);
      const y = Math.round(cursorY + Math.sin(angle) * radius);
      if (Grid.inBounds(x, y)) {
        Grid.setCellRuleIndex(x, y, randInt(Rules.count));
      }
    }
  })
}

function setupRandomRules() {
  const rulesEncoding = Rules.setupFromRandom();
  PresetRulesEncodings.displayNameForEncoding(rulesEncoding);
  Hash.set(rulesEncoding);
  Grid.setup();
}

function frameNumber(time) {
  return Math.floor(lastTime / 1000 * Config.fps);
}

let lastTime = 0;
function frame(time) {
  if (Config.fps >= 60 || frameNumber(lastTime) != frameNumber(time)) {
    update();
  }
  lastTime = time;
  render();
  requestAnimationFrame(frame);
}

function update() {
  for (let repeat = 0; repeat < Rules.count; ++repeat) {
    Grid.update();
  }
}

function render() {
  Grid.render();
}

window.addEventListener('hashchange', () => {
  if (!Hash.isSetByUser()) {
    return;
  }

  const rulesEncoding = Hash.get();
  Rules.setupFromRulesEncoding(rulesEncoding);
  PresetRulesEncodings.displayNameForEncoding(rulesEncoding);
  Hash.set(rulesEncoding);
  Grid.setup();
});

main();
