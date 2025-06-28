import {kMouseDown, kMouseClick, kMouseUp, kButtonLeft, kButtonRight} from '../../input.js';
import {getElementUnderMouse} from '../../utils.js';
import {dom} from '../../dom.js';
import {deleteNodesMenuOption} from './delete-nodes.js';
import {colourNodesMenuOption} from './colour-nodes.js';
import {sizeNodesMenuOption} from './size-nodes.js';
import {rotateNodesMenuOption} from './rotate-nodes.js';
import {collapseNodeMenuOption} from './collapse-node.js';

const kNodeMenuOptions = [
  collapseNodeMenuOption,
  deleteNodesMenuOption,
  colourNodesMenuOption,
  sizeNodesMenuOption,
  rotateNodesMenuOption,
];

let nodeMenuElement = null;


export function getNodeMenuActions(inputState) {
  const actions = [];

  const nodeRightElement = getElementUnderMouse('nodeRight');
  if (nodeRightElement) {
    const node = nodeRightElement.node;
    actions.push({
      eventType: kMouseClick,
      button: kButtonRight,
      name: 'Open menu',
      blocking: true,
      execute(event) {
        if (nodeMenuElement) {
          nodeMenuElement.remove();
        }

        nodeMenuElement = document.createElement('div');
        nodeMenuElement.classList.add('nodeMenu');
        nodeMenuElement.node = node;

        for (const option of kNodeMenuOptions) {
          const nodeMenuButtonElement = document.createElement('div');
          nodeMenuButtonElement.classList.add('nodeMenuButton');
          nodeMenuButtonElement.textContent = option.getName(node);
          nodeMenuButtonElement.option = option;
          nodeMenuElement.appendChild(nodeMenuButtonElement);
        }

        dom.graphMenuLayer.appendChild(nodeMenuElement);

        const nodeElement = nodeRightElement.nodeElement;
        nodeMenuElement.style.transform = `${nodeElement.style.transform} translateX(${nodeElement.clientWidth - 16}px)`;
      },
    });
  }

  if (nodeMenuElement) {
    if (!getElementUnderMouse('nodeMenu')) {
      for (const button of [kButtonLeft, kButtonRight]) {
        actions.push({
          eventType: kMouseDown,
          button,
          blocking: false,
          name: 'Close menu',
          execute: closeMenu,
        });
      }
    } else {
      const nodeMenuButtonElement = getElementUnderMouse('nodeMenuButton');
      if (nodeMenuButtonElement) {
        const {getName, eventType, execute} = nodeMenuButtonElement.option;
        actions.push({
          eventType,
          button: kButtonRight,
          blocking: true,
          name: getName(nodeMenuElement.node),
          execute(event) {
            execute(nodeMenuElement.node, inputState);
            closeMenu();
          },
        });
      }
    }
  }

  for (const {getExecutingActions} of kNodeMenuOptions) {
    actions.push(...(getExecutingActions?.(inputState) || []));
  }
  
  return actions;
}

function closeMenu() {
  nodeMenuElement.remove();
  nodeMenuElement = null;
}