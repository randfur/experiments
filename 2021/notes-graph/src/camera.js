import {dom} from './dom.js';
import {kMouseDown, kMouseDragStart, kMouseDragMove, kMouseDragEnd, kMouseClick, kMouseNonDragMove, mouse} from './input.js';


export const camera = {
  x: 0,
  y: 0,
  zoomLevel: -300,
};

export const worldMouse = {
  x: 0,
  y: 0,
};


export function getCameraZoom() {
  return 2 ** (camera.zoomLevel / 500);
}

export function layoutCamera() {
  dom.graphLayer.style.transform = `
    translate(${camera.x}px, ${camera.y}px)
    scale(${getCameraZoom()})
  `;
}

export function updateWorldMousePosition() {
  const zoom = getCameraZoom();
  worldMouse.x = Math.round((mouse.x - camera.x) / zoom);
  worldMouse.y = Math.round((mouse.y - camera.y) / zoom);
}

export function handleWorldMousePositionUpdate(eventType, event) {
  switch (eventType) {
    case kMouseDown:
    case kMouseDragMove:
    case kMouseNonDragMove:
    case kMouseClick:
    case kMouseDragStart:
    case kMouseDragEnd: {
      updateWorldMousePosition();
      break;
    }
  }
}
