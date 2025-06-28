import Canvas from './canvas.js';
import Rule from './rule.js';
import Rules from './rules.js';
import {randInt} from './utils.js';

export default class Grid {
  static ruleIndices = null;
  static aliveCounts = null;
  static aliveCountsSnapshot = null;

  static setup() {
    Grid.ruleIndices = new Uint8Array(Canvas.width * Canvas.height);
    for (let i = 0; i < Canvas.width * Canvas.height; ++i) {
      Grid.ruleIndices[i] = randInt(Rules.count);
    }

    Grid.aliveCounts = new Uint8Array(Canvas.width * Canvas.height);
    for (let y = 0; y < Canvas.height; ++y) {
      for (let x = 0; x < Canvas.width; ++x) {
        if (Rule.isAlive(Rules.buffer, Grid.cellRuleIndex(x, y))) {
          Grid.updateAdjacentCounts(x, y, 1);
        }
      }
    }

    Grid.aliveCountsSnapshot = new Uint8Array(Grid.aliveCounts.length);
  }

  static update() {
    for (let i = 0; i < Grid.aliveCounts.length; ++i) {
      Grid.aliveCountsSnapshot[i] = Grid.aliveCounts[i];
    }
    for (let y = 0; y < Canvas.height; ++y) {
      for (let x = 0; x < Canvas.width; ++x) {
        const oldRuleIndex = Grid.cellRuleIndex(x, y);
        Grid.setCellRuleIndex(x, y, Rule.transition(Rules.buffer, oldRuleIndex, Grid.aliveCountsSnapshot[y * Canvas.width + x]));
      }
    }
  }
  
  static render() {
    Canvas.imageData.data.fill(0);
    for (let y = 0; y < Canvas.height; ++y) {
      for (let x = 0; x < Canvas.width; ++x) {
        const ruleIndex = Grid.cellRuleIndex(x, y);
        const pixelIndex = (y * Canvas.width + x) * 4;
        for (let i = 0; i < Rule.colourSize; ++i) {
          Canvas.imageData.data[pixelIndex + i] = Rule.colourChannel(Rules.buffer, ruleIndex, i);
        }
      }
    }
    Canvas.context.putImageData(Canvas.imageData, 0, 0);
  }

  static inBounds(x, y) {
    return x >= 0 && x < Canvas.width && y >= 0 && y < Canvas.height;
  }

  static cellRuleIndex(x, y) {
    return Grid.ruleIndices[y * Canvas.width + x];
  }

  static setCellRuleIndex(x, y, ruleIndex) {
    Grid.updateAdjacentCounts(x, y, Rule.isAlive(Rules.buffer, ruleIndex) - Rule.isAlive(Rules.buffer, Grid.cellRuleIndex(x, y)));
    Grid.ruleIndices[y * Canvas.width + x] = ruleIndex;
  }

  static updateAdjacentCounts(cellX, cellY, delta) {
    if (delta === 0) {
      return;
    }
    for (let y = cellY - 1; y <= cellY + 1; ++y) {
      for (let x = cellX - 1; x <= cellX + 1; ++x) {
        if ((x == cellX && y === cellY) || !Grid.inBounds(x, y)) {
          continue;
        }
        Grid.aliveCounts[y * Canvas.width + x] += delta;
      }
    }
  }
};