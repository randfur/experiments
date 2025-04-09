import {createElement} from './create-element.js';

export function renderPinchZoomableSection(model, rerender, children) {
  const {viewport} = model;

  const viewportElement = createElement({
    tag: 'div',
    style: {
      transformOrigin: 'top left',
      transform: computeTransform(viewport),
    },
    children,
  });

  function calculatePinchZoom(activeTouches) {
    console.assert(hasSameKeys(viewport.initialTouches, activeTouches), JSON.stringify([viewport.initialTouches, activeTouches]));

    if (Object.keys(activeTouches).length === 0) {
      return null;
    }

    const initialCentre = calculateCentre(viewport.initialTouches);
    const activeCentre = calculateCentre(activeTouches);
    const panDelta = subtractXy(activeCentre, initialCentre);

    let zoomDelta = 1;
    if (Object.keys(activeTouches).length > 1) {
      const initialDistance = calculateDistanceFromCentre(viewport.initialTouches, initialCentre);
      const activeDistance = calculateDistanceFromCentre(activeTouches, activeCentre);
      zoomDelta = activeDistance / initialDistance;
    }

    return {
      pan: addXy(viewport.pan, panDelta),
      zoom: viewport.zoom * zoomDelta,
    };
  }

  function touchListToObject(touchList) {
    return Object.fromEntries(Array.from(
      touchList,
      touch => [touch.identifier, {x: touch.screenX, y: touch.screenY}],
    ));
  }

  function bakeTouches(touches) {
    const pinchZoom = calculatePinchZoom(touches);
    if (pinchZoom) {
      viewport.pan = pinchZoom.pan;
      viewport.zoom = pinchZoom.zoom;
    }
  }

  return createElement({
    tag: 'div',
    style: {
      overflow: 'hidden',
    },
    events: {
      touchstart: event => {
        const currentTouches = touchListToObject(event.touches);

        bakeTouches(objectSubtract(
          currentTouches,
          touchListToObject(event.changedTouches),
        ));

        viewport.initialTouches = currentTouches;
      },
      touchmove: event => {
        const pinchZoom = calculatePinchZoom(touchListToObject(event.touches));
        if (pinchZoom) {
          viewportElement.style.transform = computeTransform(pinchZoom);
        }
      },
      touchend: event => {
        const currentTouches = touchListToObject(event.touches);

        bakeTouches({
          ...currentTouches,
          ...touchListToObject(event.changedTouches),
        });

        viewport.initialTouches = currentTouches;
      },
    },
    children: [
      viewportElement,
    ],
  });
}

function computeTransform({pan, zoom}) {
  return `translate(${pan.x}px, ${pan.y}px) scale(${Math.min(zoom, 100)})`;
}

function objectSubtract(a, b) {
  const result = {};
  for (const [key, value] of Object.entries(a)) {
    if (!(key in b)) {
      result[key] = value;
    }
  }
  return result;
}

function hasSameKeys(a, b) {
  return new Set(Object.keys(a)).difference(new Set(Object.keys(b))).size === 0;
}

function subtractXy(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

function addXy(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function calculateCentre(touches) {
  const centre = {x: 0, y: 0};
  for (const {x, y} of Object.values(touches)) {
    centre.x += x;
    centre.y += y;
  }
  centre.x /= Object.keys(touches).length;
  centre.y /= Object.keys(touches).length;
  return centre;
}

function calculateDistanceFromCentre(touches, centre) {
  let distance = 0;
  for (const {x, y} of Object.values(touches)) {
    distance += ((x - centre.x) ** 2 + (y - centre.y) ** 2) ** 0.5;
  }
  return distance;
}

