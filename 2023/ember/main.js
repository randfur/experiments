import {Engine} from './engine.js';
import {Ember} from './ember.js';
import {range} from './utils.js';

function main() {
  Engine.init();
  for (const i of range(10)) {
    Engine.add(new Ember({follow: i === 0}));
  }
  Engine.run();
}

main();
