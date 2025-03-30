import {createSvgElement} from './create-element.js';

export function renderSequence(model, rerender) {
  const svg = createSvgElement({tag: 'svg'});

  svg.append(createSvgElement({
    tag: 'style',
    textContent: `
      text {
        font-family: sans-serif;
      }
      .bell {
        font-size: 80px;
      }
      .places {
        font-size: 30px;
        fill: #ccc;
        text-align: end;
      }
      .blue-line {
        fill: none;
        stroke: blue;
        stroke-width: 20px;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `,
  }));

  const sequence = computeSequence(model);
  console.log(sequence);

  const blueLineXy = [];

  let y = 90;
  for (const bells of sequence.bellsList) {
    let x = 150;
    for (const bell of bells) {
      if (bell === model.selected.blueLine) {
        blueLineXy.push({
          x: x + 25,
          y: y - 30,
        });
      } else {
        svg.append(createSvgElement({
          tag: 'text',
          className: 'bell',
          textContent: bell,
          attributes: {
            x,
            y,
          },
        }));
      }
      x += 120;
    }
    y += 90;
  }

  svg.append(createSvgElement({
    tag: 'path',
    className: 'blue-line',
    attributes: {
      d: blueLineXy.map(({x, y}, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y} `).join(''),
      'stroke-linejoin': 'round',
    },
  }));

  y = 120;
  for (const annotatedPlaces of sequence.annotatedPlacesList) {
    let x = 100;
    svg.append(createSvgElement({
      tag: 'text',
      className: 'places',
      textContent: annotatedPlaces.places.join(''),
      attributes: {
        'text-anchor': 'end',
        x,
        y,
      },
    }));
    y += 90;
  }

  svg.setAttribute(
    'height',
    100 + Array.from(svg.children).reduce(
      (acc, child) => Math.max(acc, child.y?.baseVal[0]?.value ?? 0),
      0,
    ),
  );

  svg.setAttribute(
    'width',
    100 + Array.from(svg.children).reduce(
      (acc, child) => Math.max(acc, child.x?.baseVal[0]?.value ?? 0),
      0,
    ),
  );

  return svg;
}

function computeSequence(model) {
  const method = model.methods[model.selected.methodName];
  const touch = model.selected.touch;
  const sequence = {
    bellsList: [],
    annotatedPlacesList: [],
  };

  let bells = [];
  for (let i = 1; i <= method.bells; ++i) {
    bells.push(i);
  }
  sequence.bellsList.push(bells);

  // Run through all the touches.
  // while (touchIndex < touch.length) {
  //   touchCall = touch[touchIndex];
  //   console.log('todo');
  // }

  // Run until we see a repeated sequence.
  const seenBells = new Set([arrayLast(sequence.bellsList).join('')]);
  while (true) {
    const annotatedPlaces = computeAnnotatedPlaces(model, sequence.bellsList.length - 1);
    sequence.annotatedPlacesList.push(annotatedPlaces);
    const bells = makePlaces(arrayLast(sequence.bellsList), annotatedPlaces.places);
    sequence.bellsList.push(bells);
    const bellsKey = bells.join('');
    if (seenBells.has(bellsKey)) {
      break;
    }
    seenBells.add(bellsKey);
  }

  return sequence;
}

function computeAnnotatedPlaces(model, step) {
  const method = model.methods[model.selected.methodName];
  const touch = model.selected.touch;
  // Find where step is inside a placeNotation sequence.
  const repeatLength = method.placeNotation.length;
  const placeNotationIndex = step % repeatLength;
  const touchIndex = Math.floor(step / repeatLength);
  const lastOffsetWork = getOffsetWork(method, touch, touchIndex - 1);
  const offsetWork = getOffsetWork(method, touch, touchIndex);

  // Overlay lastOffsetWork work over the beginning.
  if (lastOffsetWork) {
    const places = arrayGet(
      lastOffsetWork.work,
      placeNotationIndex + 1 - lastOffsetWork.offset,
    );
    if (places) {
      return {
        places,
        isWork: true,
      };
    }
  }

  // Overlay offsetWork work over the ending.
  if (offsetWork) {
    const places = arrayGet(
      offsetWork.work,
      placeNotationIndex - repeatLength + 1 - offsetWork.offset,
    );
    if (places) {
      return {
        places,
        isWork: true,
      };
    }
  }

  return {
    places: method.placeNotation[placeNotationIndex],
    isWork: false,
  };
}

function getOffsetWork(method, touch, touchIndex) {
  if (touchIndex < 0 || touchIndex >= touch.length) {
    return null;
  }
  const call = touch[touchIndex];
  return (
    call === 'B'
    ? method.bob
    : (
      call === 'S'
      ? method.single
      : null
    )
  );
}

function arrayGet(array, index) {
  return (index < 0 || index >= array.length) ? null : array[index];
}

function arrayLast(array) {
  return array[array.length - 1];
}

function makePlaces(initialBells, places) {
  const bells = [...initialBells];
  let i = 0;
  for (const place of places) {
    while (true) {
      if (i + 1 < place) {
        [bells[i], bells[i + 1]] = [bells[i + 1], bells[i]];
        i += 2;
      } else {
        i += 1;
        break;
      }
    }
  }
  while (i < bells.length) {
    [bells[i], bells[i + 1]] = [bells[i + 1], bells[i]];
    i += 2;
  }

  return bells;
}
