import {Engine} from './engine.js';
import {Collisions} from './collisions.js';
import {Ship} from './ship.js';
import {repeat} from './utils.js';

function main() {
  Engine.init();
  const collisions = Engine.add(new Collisions());
  repeat(10, () => {
    Engine.add(new Ship(collisions));
  });
  Engine.run();
}

main();