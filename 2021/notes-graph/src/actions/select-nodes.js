import {kMouseDown, kMouseClick, kButtonLeft, kButtonRight} from '../input.js';
import {nodes, getSubTreeNodes} from '../model.js';
import {updateNodeDom} from '../dom.js';
import {selectedNodes, areSelected, selectNodes, unselectNodes} from '../selection.js';
import {getElementUnderMouse} from '../utils.js';


export function getSelectNodeActions(inputState) {
  const actions = [];

  if (!inputState.mode) {
    const nodeLeftElement = getElementUnderMouse('nodeLeft');
    if (nodeLeftElement) {
      actions.push({
        eventType: kMouseClick,
        button: kButtonRight,
        blocking: true,
        name: 'Toggle subtree selection',
        execute(event) {
          const subTreeNodes = getSubTreeNodes(nodeLeftElement.node);
          if (!areSelected(subTreeNodes)) {
            selectNodes(subTreeNodes);
          } else {
            unselectNodes(subTreeNodes);
          }
          for (const node of subTreeNodes) {
            updateNodeDom(node);
          }
        },
      });
    } else if (selectedNodes.size > 0) {
      actions.push({
        eventType: kMouseClick,
        button: kButtonLeft,
        blocking: true,
        name: 'Clear selection',
        execute: clearSelection,
      });
      const nodeElement = getElementUnderMouse('node');
      if (!nodeElement || !selectedNodes.has(nodeElement.node)) {
        actions.push({
          eventType: nodeElement ? kMouseDown : kMouseClick,
          button: kButtonRight,
          blocking: true,
          name: 'Clear selection',
          execute: clearSelection,
        });
      }
    }
  }

  return actions;
}

function clearSelection() {
  const affectedNodes = [...selectedNodes];
  selectedNodes.clear();
  for (const node of affectedNodes) {
    updateNodeDom(node);
  }
}