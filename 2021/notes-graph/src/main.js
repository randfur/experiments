import {registerInputs} from './input.js';
import {getNodeMenuActions} from './actions/node-menu/node-menu.js';
import {getMoveCameraActions} from './actions/move-camera.js';
import {getEditTextActions} from './actions/edit-text.js';
import {getAttachNodesActions} from './actions/attach-nodes.js';
import {getAssociateNodesActions} from './actions/associate-nodes.js';
import {getCreateNodeActions} from './actions/create-node.js';
import {getSelectNodeActions} from './actions/select-nodes.js';
import {getMoveNodesActions} from './actions/move-nodes.js';
import {getMarkNodeActions} from './actions/mark-node.js';
import {dom, initDom} from './dom.js';
import {prettifyActions, beefyToJson, sleep} from './utils.js';
import {layoutCamera, handleWorldMousePositionUpdate} from './camera.js';
import {load, save} from './storage.js';
import {nodes} from './model.js';


function main() {
  initDom(document.body);
  layoutCamera();
  load();

  registerInputs({
    element: dom.root,
    handlers: [
      handleWorldMousePositionUpdate,
    ],
    actionGenerators: [
      getNodeMenuActions,
      getMoveCameraActions,
      getSelectNodeActions,
      getEditTextActions,
      getMoveNodesActions,
      getAttachNodesActions,
      getAssociateNodesActions,
      getCreateNodeActions,
      getMarkNodeActions,
    ],
    onActionsUpdated(inputState, actions) {
      dom.debugLayer.textContent = `\
# Available actions
${prettifyActions(actions)}
`;

// # inputState
// ${beefyToJson(inputState)}

// # nodes
// ${beefyToJson(nodes)}

// # actions
// ${beefyToJson(actions)}`;
    },
  });
  
  window.addEventListener('beforeunload', save);
  (async () => {
    while (true) {
      await sleep({hours: 1});
      save();
    }
  })();
}
main();

