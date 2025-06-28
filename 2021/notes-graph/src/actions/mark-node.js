import {updateNodeDom} from '../dom.js';
import {kMouseClick, kButtonMiddle} from '../input.js';
import {getElementUnderMouse} from '../utils.js';


export function getMarkNodeActions(inputState) {
  const actions = [];

  if (!inputState.mode) {
    const node = getElementUnderMouse('node')?.node;
    if (node) {
      actions.push({
        eventType: kMouseClick,
        button: kButtonMiddle,
        blocking: true,
        name: 'Mark node',
        execute() {
          node.marked ^= true;
          updateNodeDom(node);
        },
      });
    }
  }
  
  return actions;
}
