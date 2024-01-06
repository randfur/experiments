import {AnimationPack} from './animation-pack.js'
import {Editor} from './editor.js'

async function main() {
  const animationPack = new AnimationPack();
  const animationEditor = new AnimationEditor(animationPack);

  window.addEventListener('keypress', event => {
    editor.keyPress(event);
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    animationEditor.render();
  }
}

main();