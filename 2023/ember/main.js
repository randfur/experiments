import {Engine} from './engine.js';
import {Ember} from './ember.js';
import {Arrow} from './arrow.js';
import {range} from './utils.js';

function main() {
  Engine.init();
  Engine.add(new Ember());
  Engine.add(new Ember());
  Engine.add(new Ember());
  Engine.add(new Ember());
  Engine.add(new Ember());
  Engine.add(new Ember());
  Engine.add(new Ember());
  Engine.add(new Ember());
  // Engine.add(new Arrow());
  Engine.run();
}

main();
