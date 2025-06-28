import {range, randInt} from './utils.js';


export default class Rule {
  static aliveOffset = 0;
  static aliveSize = 1;

  static transitionOffset = 1;
  static transitionSize = 9;

  static colourOffset = Rule.transitionOffset + Rule.transitionSize;
  static colourSize = 4;
  static colourEncodingBase = 16;
  static colourEncodingDigits = Math.ceil(Math.log(255) / Math.log(Rule.colourEncodingBase));

  static size = Rule.aliveSize + Rule.transitionSize + Rule.colourSize;
  static encodedSize = Rule.aliveSize + Rule.transitionSize + (Rule.colourSize * Rule.colourEncodingDigits);

  static _isColourChannelOffset(offset) {
    return offset >= Rule.colourOffset && offset < Rule.colourOffset + Rule.colourSize;
  }

  static stringify(buffer, ruleIndex) {
    return Array.from(range(Rule.size)).map(i => {
      const x = buffer[ruleIndex * Rule.size + i];
      if (Rule._isColourChannelOffset(i)) {
        return x.toString(Rule.colourEncodingBase).padStart(Rule.colourEncodingDigits, '0');
      }
      return x.toString();
    }).join('');
  }
  
  static parse(rulesEncoding, head, buffer, ruleIndex) {
    for (let i = 0; i < Rule.size; ++i) {
      if (Rule._isColourChannelOffset(i)) {
        buffer[ruleIndex * Rule.size + i] = parseInt(rulesEncoding.slice(head, head + Rule.colourEncodingDigits), Rule.colourEncodingBase);
        head += Rule.colourEncodingDigits;
      } else {
        buffer[ruleIndex * Rule.size + i] = parseInt(rulesEncoding[head]);
        head += 1;           
      }
    }
    return head;
  }

  static createFromRandom({buffer, ruleIndex, isAlive, ruleCount}) {
    buffer[ruleIndex * Rule.size + Rule.aliveOffset] = isAlive;
    for (let i = 0; i < Rule.transitionSize; ++i) {
      buffer[ruleIndex * Rule.size + Rule.transitionOffset + i] = randInt(ruleCount);
    }
    for (let i = 0; i < Rule.colourSize; ++i) {
      buffer[ruleIndex * Rule.size + Rule.colourOffset + i] = randInt(256);
    }
  }

  static isAlive(buffer, ruleIndex) {
    return buffer[ruleIndex * Rule.size + Rule.aliveOffset];
  }

  static colourChannel(buffer, ruleIndex, colourIndex) {
    return buffer[ruleIndex * Rule.size + Rule.colourOffset + colourIndex];
  }

  static transition(buffer, ruleIndex, aliveCount) {
    return buffer[ruleIndex * Rule.size + Rule.transitionOffset + aliveCount];
  }
};