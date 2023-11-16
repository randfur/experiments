import {Engine} from './engine.js';
import {Ember} from './ember.js';
import {range} from './utils.js';

function main() {
  Engine.init();
  Engine.add(new Ember());
  Engine.run();
}

main();
