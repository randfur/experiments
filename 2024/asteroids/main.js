import {Engine} from './engine.js';
import {Ship} from './ship.js';

function main() {
  Engine.init();
  Engine.add(new Ship());
  Engine.add(new Ship());
  Engine.add(new Ship());
  Engine.add(new Ship());
  Engine.add(new Ship());
  Engine.run();
}

main();