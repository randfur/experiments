import {dom, removeNodeDom, updateNodeEdgesDom} from '../dom.js';
import {nodes, removeNode, getConnectedNodes} from '../model.js';
import {getElementUnderMouse} from '../utils.js';
import {kButtonLeft, kButtonRight, kMouseDown, kMouseClick, kMouseContextMenu, mouse} from '../input.js';


export const kModeEditText = Symbol('ModeEditText');


export function getEditTextActions(inputState) {
  const actions = [];

  if (!inputState.mode) {
    const nodeMiddleElement = getElementUnderMouse('nodeMiddle');
    if (nodeMiddleElement) {
      actions.push({
        eventType: kMouseClick,
        button: kButtonRight,
        blocking: true,
        name: 'Edit text',
        execute() {
          editTextStart(nodeMiddleElement.node, inputState);
        },
      });
    }
  }

  let noContextMenu = true;

  if (inputState.mode === kModeEditText) {
    const {node, skipContextMenu} = inputState.dataForMode(kModeEditText);

    const nodeElement = getElementUnderMouse('node');
    if (!nodeElement || nodeElement.node !== node) {
      actions.push({
        eventType: kMouseDown,
        button: null,
        blocking: true,
        name: 'Exit text editing',
        execute() {
          editTextFinish(inputState);
        }
      });
    }

    noContextMenu = skipContextMenu;
  }

  if (noContextMenu) {
    actions.push({
      eventType: kMouseContextMenu,
      button: null,
      blocking: true,
      name: null,
      execute(event) {
        if (inputState.mode === kModeEditText) {
          inputState.data.skipContextMenu = false;
        }
        event.preventDefault();
      },
    });
  }
  
  return actions;
}

export function editTextStart(node, inputState) {
  const nodeElement = dom.nodes[node.id];
  nodeElement.hitLayerElement.classList.add('disable');
  nodeElement.textElement.contentEditable = true;
  nodeElement.textElement.focus();
  inputState.setMode(kModeEditText, {
    node,
    skipContextMenu: true,
  });
}

export function editTextFinish(inputState) {
  const {node} = inputState.dataForMode(kModeEditText);
  const nodeElement = dom.nodes[node.id];
  nodeElement.textElement.contentEditable = false;
  nodeElement.hitLayerElement.classList.remove('disable');
  node.text = nodeElement.textElement.innerText;
  let deleted = false;
  const affectedNodes = getConnectedNodes(node);
  if (node.text === '') {
    removeNode(node);
    removeNodeDom(node.id);
    deleted = true;
  } else {
  }
  for (const affectedNode of affectedNodes) {
    if (affectedNode.id in nodes) {
      updateNodeEdgesDom(affectedNode);
    }
  }
  inputState.clear();
  return {deleted};
}

