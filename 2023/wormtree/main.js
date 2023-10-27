import {Engine} from './engine.js';

function main() {
  Engine.init();
  Engine.spawn(Main);
  Engine.run();
}

main();
