import {randInt, range, biasedRandInt} from './utils.js';
import Config from './config.js';
import Rule from './rule.js';

export default class Rules {
  static count = null;
  static buffer = null;

  static setupFromRulesEncoding(rulesEncoding) {
    Rules.count = rulesEncoding.length / Rule.encodedSize;
    Rules.buffer = new Uint8Array(Rules.count * Rule.size);
    let head = 0;
    for (let i = 0; i < Rules.count; ++i) {
      head = Rule.parse(rulesEncoding, head, Rules.buffer, i);
    }
  }

  static setupFromRandom() {
    Rules.count = 2 + biasedRandInt(Config.maxRuleCount - 2, 0);
    const aliveRules = 1 + randInt(Rules.count - 1);
    Rules.buffer = new Uint8Array(Rules.count * Rule.size);
    for (let i = 0; i < Rules.count; ++i) {
      Rule.createFromRandom({
        buffer: Rules.buffer,
        ruleIndex: i,
        isAlive: i < aliveRules,
        ruleCount: Rules.count,
      });
    }

    return Array.from(range(Rules.count)).map(i => Rule.stringify(Rules.buffer, i)).join('');
  }
};

// Debugging
window.Rules = Rules;