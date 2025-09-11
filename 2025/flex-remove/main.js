async function main() {
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = 1000;
  canvas.height = 200;
  const context = canvas.getContext('2d');

  const a = {min: 50, max: 300, style: '#f00'};
  const b = {min: 20, max: 20, style: '#f80'};

  const c = {min: 50, max: 100, style: '#f80'};
  const d = {min: 20, max: 20, style: '#f88'};

  const e = {min: 50, max: 100, style: '#840'};
  const f = {min: 20, max: 20, style: '#884'};


  const g = {min: 50, max: 300, style: '#0f0'};
  const h = {min: 20, max: 20, style: '#2f8'};

  const i = {min: 50, max: 100, style: '#0f8'};
  const j = {min: 20, max: 20, style: '#084'};

  const k = {min: 50, max: 100, style: '#00f'};
  const l = {min: 20, max: 20, style: '#40f'};


  const m = {min: 50, max: 300, style: '#f0f'};
  const n = {min: 20, max: 20, style: '#f08'};

  const o = {min: 50, max: 100, style: '#808'};
  const p = {min: 20, max: 20, style: '#408'};

  const q = {min: 50, max: 100, style: '#804'};
  const r = {min: 20, max: 20, style: '#404'};

  for (let width = 1000; width > 0; --width) {
    width = 900;
    await new Promise(requestAnimationFrame);
    const placements = layout({
      start: [
        [a, b],
        // [c, d],
        // [e, f],
      ],
      middle: [
        [g, h],
        // [i, j],
        // [k, l],
      ],
      end: [
        [m, n],
        // [o, p],
        // [q, r],
      ],
      removeOrder: [a, g, m, c, i, o, b, h, n, e, k, q],
      width,
    });

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeRect(0, 0, width, canvas.height);
    for (const placement of placements) {
      context.fillStyle = placement.item.style;
      context.fillRect(placement.position, 0, placement.width, canvas.height);
    }
    break;
  }
}

function layout({start, middle, end, removeOrder, width}) {
  const removeItemIndexMap = new Map(removeOrder.map((item, i) => [item, i]));

  function firstUnremoved(itemsList, removeIndex) {
    return itemsList
      .map(
        items => items.find(
          item => (
            removeIndex === null ||
            (removeItemIndexMap.get(item) ?? Infinity) > removeIndex
          )
        )
      )
      .filter(item => item);
  }

  function layoutAttempt({eatFlex=Infinity, removeIndex=null}) {
    const sectionedItems = {
      start: firstUnremoved(start, removeIndex),
      middle: firstUnremoved(middle, removeIndex),
      end: firstUnremoved(end, removeIndex),
    };

    const allItems = [
      ...sectionedItems.start,
      ...sectionedItems.middle,
      ...sectionedItems.end,
    ];
    const totalFlexCapacity = allItems.reduce((total, item) => total + item.max - item.min, 0);
    function getWidth(item) {
      return totalFlexCapacity > 0
        ? Math.max(item.min, item.max - eatFlex * (item.max - item.min) / totalFlexCapacity)
        : item.min;
    }

    let middleStart = 0;
    let middleEnd = width;

    const placements = [];
    for (const item of sectionedItems.start) {
      const width = getWidth(item);
      placements.push({item, position: middleStart, width});
      middleStart += width;
    }

    for (const item of sectionedItems.end.toReversed()) {
      const width = getWidth(item);
      middleEnd -= width;
      placements.push({item, position: middleEnd, width});
    }

    const middleWidth = sectionedItems.middle.reduce((total, item) => total + getWidth(item), 0);
    let middlePosition = Math.min(middleEnd - middleWidth, width / 2 - middleWidth / 2);
    middlePosition = Math.max(middleStart, middlePosition);
    for (const item of sectionedItems.middle) {
      const width = getWidth(item);
      placements.push({item, position: middlePosition, width})
      middlePosition += width;
    }

    return {
      success: middlePosition <= middleEnd,
      deficit: Math.max(0, middlePosition - middleEnd),
      placements,
    }
  }

  let attempt = layoutAttempt({eatFlex: 0});
  if (attempt.success) {
    return attempt.placements;
  }

  attempt = layoutAttempt({eatFlex: attempt.deficit});
  if (attempt.success) {
    return attempt.placements;
  }

  for (let removeIndex = 0; removeIndex < removeOrder.length; ++removeIndex) {
    attempt = layoutAttempt({removeIndex});
    if (attempt.success) {
      return attempt.placements;
    }
  }

  return attempt.placements;
}

main();
