import {kMouseClick, kButtonRight, mouse} from '../input.js';
import {kModeEditText, editTextStart} from './edit-text.js';
import {kSizeStep} from './node-menu/size-nodes.js';
import {addNode} from '../model.js';
import {updateNodeDom} from '../dom.js';
import {worldMouse} from '../camera.js';
import {getElementUnderMouse} from '../utils.js';


export function getCreateNodeActions(inputState) {
  const actions = [];

  if (!inputState.mode && !getElementUnderMouse('menu')) {
    actions.push({
      eventType: kMouseClick,
      button: kButtonRight,
      blocking: true,
      name: 'Create new node',
      execute(event) {
        createNodeAction(inputState, { size: kSizeStep * 4 });
      },
    });
  }

  return actions;
}

export function createNodeAction(inputState, {size=null, hue=null}) {
  const node = addNode();
  node.x = worldMouse.x - 40;
  node.y = worldMouse.y - 30;
  if (size !== null) {
    node.size = size;
  }
  if (hue !== null) {
    node.hue = hue;
  }
  updateNodeDom(node);
  editTextStart(node, inputState);
  return node;
}