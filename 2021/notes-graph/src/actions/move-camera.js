import {kMouseDragStart, kMouseDragMove, kMouseUp, kMouseWheel, kButtonLeft, mouse} from '../input.js';
import {camera, getCameraZoom, updateWorldMousePosition, layoutCamera} from '../camera.js';
import {kModeEditText} from './edit-text.js';


const kModeMoveCamera = Symbol('ModeMoveCamera');


export function getMoveCameraActions(inputState) {
  const actions = [];

  if (!mouse.down) {
    actions.push({
      eventType: kMouseWheel,
      button: null,
      blocking: true,
      name: 'Zoom',
      execute(event) {
        const oldZoom = getCameraZoom();
        camera.zoomLevel -= event.deltaY;
        const zoomZoom = getCameraZoom() / oldZoom;
        camera.x += (camera.x - (innerWidth / 2)) * (zoomZoom - 1);
        camera.y += (camera.y - (innerHeight / 2)) * (zoomZoom - 1);
        updateWorldMousePosition();
        layoutCamera();
      },
    });
  }
  
  if (!inputState.mode) {
    actions.push({
      eventType: kMouseDragStart,
      button: kButtonLeft,
      blocking: true,
      name: 'Pan',
      execute() {
        inputState.setMode(kModeMoveCamera, {
          cameraX: camera.x,
          cameraY: camera.y,
          mouseX: mouse.x,
          mouseY: mouse.y,
        });
      },
    });
  }
  
  if (inputState.mode === kModeMoveCamera) {
    const {cameraX, cameraY, mouseX, mouseY} = inputState.dataForMode(kModeMoveCamera);
    actions.push({
      eventType: kMouseDragMove,
      button: kButtonLeft,
      blocking: true,
      name: 'Pan',
      execute() {
        camera.x = cameraX + (mouse.x - mouseX);
        camera.y = cameraY + (mouse.y - mouseY);
        updateWorldMousePosition();
        layoutCamera();
      },
    });
    
    actions.push({
      eventType: kMouseUp,
      button: kButtonLeft,
      blocking: true,
      name: 'Stop panning',
      execute() {
        inputState.clear();
      },
    });
  }
  
  return actions;
}
