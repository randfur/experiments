import {app} from './app.js';
import {loadSavedModel} from './model.js';

function main() {
  loadSavedModel();
  document.body.style.margin = '0';
  document.body.style.touchAction = 'manipulation';
  document.body.append(app.render());
}

main();