import {
  mouse,
  kMouseDown,
  kMouseDragStart,
  kMouseDragMove,
  kMouseDragEnd,
  kMouseClick,
  kMouseUp,
  kMouseNonDragMove,
  kMouseWheel,
  kMouseContextMenu,
  kButtonLeft,
  kButtonMiddle,
  kButtonRight,
} from './input.js';


export function getLength(x, y) {
  return Math.sqrt(x ** 2 + y ** 2);
}

export function getElementUnderMouse(className) {
  let x = mouse.x;
  let y = mouse.y;
  if (mouse.down && !mouse.dragging) {
    x = mouse.down.x;
    y = mouse.down.y;
  }
  for (const element of document.elementsFromPoint(x, y)) {
    if (element.classList.contains(className)) {
      return element;
    }
  }
  return null;
}

export function removeItem(list, item) {
  const index = list.indexOf(item);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

export function filterList(list, predicate) {
  const removed = [];
  list.splice(0, Infinity, ...list.filter(x => {
    if (!predicate(x)) {
      removed.push(x);
      return false;
    }
    return true;
  }));
  return removed;
}

export function syncLists({sourceList, destinationList, createItem, updateItem, deleteItem}) {
  for (let i = 0; i < sourceList.length; ++i) {
    if (destinationList.length <= i) {
      destinationList.push(createItem());
    }
    updateItem(sourceList[i], destinationList[i]);
  }
  while (destinationList.length > sourceList.length) {
    deleteItem(destinationList.splice(-1, 1)[0]);
  }
}

export function beefyToJson(object) {
  return JSON.stringify(object, (key, value) => {
    if (value instanceof HTMLElement)
      return `<${value.tagName.toLowerCase()}>`;
    if (typeof value === 'symbol')
      return value.toString();
    if (typeof value === 'function')
      return value.toString().split('\n')[0];
    return value;
  }, '  ');
}

export function prettifyActions(actions) {
  return actions.map(({eventType, button, name}) => {
    if (!name) {
      return '';
    }
    const pieces = [];
    if (button !== null) {
      switch (button) {
        case kButtonLeft: pieces.push('left click'); break;
        case kButtonMiddle: pieces.push('middle click'); break;
        case kButtonRight: pieces.push('right click'); break;
      }
    }
    switch (eventType) {
      case kMouseDown: break;
      case kMouseDragStart: pieces.push('drag'); break;
      case kMouseDragMove: pieces.push('drag'); break;
      case kMouseDragEnd: pieces.push('release'); break;
      case kMouseClick: pieces.push('release'); break;
      case kMouseUp: pieces.push('release'); break;
      case kMouseNonDragMove: pieces.push('move'); break;
      case kMouseWheel: pieces.push('wheel'); break;
      case kMouseContextMenu: pieces.push('context menu'); break;
    }
    return ` - ${pieces.join(' ')}: ${name}`;
  }).filter(x => x !== '').join('\n');
}

export function setClass(element, className, value) {
  element.classList[value ? 'add' : 'remove'](className);
}

export function sleep({hours=0, minutes=0, seconds=0}) {
  return new Promise(resolve => {
    minutes += hours * 60;
    seconds += minutes * 60;
    setTimeout(resolve, seconds * 1000);
  });
}

export function computeArrowPosition(midX1, midY1, width1, height1, midX2, midY2, width2, height2, length) {
  if (length === 0) {
    return 0;
  }

  // Get edge start and direction.
  const deltaX = midX2 - midX1;
  const deltaY = midY2 - midY1;
  const dx = deltaX / length;
  const dy = deltaY / length;

  // Find smallest positive intersection with box side lines for both boxes.
  // Get intersections as lengths along the edge.
  const t1 = computeTForBox(midX1, midY1, width1, height1, dx, dy);
  const t2 = length - computeTForBox(midX2, midY2, width2, height2, -dx, -dy);

  // Return average.
  return (t1 + t2) / 2;
}

function computeTForBox(midX, midY, width, height, dx, dy) {
  let minT = Infinity;
  let t = computeTGivenX(midX, dx, midX + width / 2);
  if (t !== null && t >= 0 && t < minT) { minT = t; }
  t = computeTGivenX(midX, dx, midX - width / 2);
  if (t !== null && t >= 0 && t < minT) { minT = t; }
  t = computeTGivenY(midY, dy, midY + height / 2);
  if (t !== null && t >= 0 && t < minT) { minT = t; }
  t = computeTGivenY(midY, dy, midY - height / 2);
  if (t !== null && t >= 0 && t < minT) { minT = t; }
  return minT;
}

function computeTGivenX(px, dx, x) {
  // P + tD = (X, ?)
  // Px + tDx = X
  // t = (X - Px) / Dx
  return dx === 0 ? null : (x - px) / dx;
}

function computeTGivenY(py, dy, y) {
  // P + tD = (?, Y)
  // Py + tDy = Y
  // t = (Y - Py) / Dy
  return dy === 0 ? null : (y - py) / dy;
}
