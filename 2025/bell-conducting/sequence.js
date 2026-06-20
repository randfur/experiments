import {RenderableElement} from './renderable-element.js';
import {model} from './model.js';
import {app} from './app.js';
import {createSvgElement} from './create-element.js';
import {range} from './utils.js';

const rowHeight = 22;
const columnWidth = 30;

export const sequence = new RenderableElement(() => {
  const bellSequence = computeBellSequence();
  return createSvgElement({
    tag: 'svg',
    style: {
      transformOrigin: 'top left',
      transform: 'scale(1.2)',
      position: 'absolute',
      left: '0px',
      top: '0px',
    },
    attributes: {
      width: 100 + model.methods[model.selected.methodName].bells * 60,
      height: 100 + bellSequence.bellsList.length * 50,
    },
    children: [
      renderStyle(),
      renderBells(bellSequence),
      renderRepeatLines(bellSequence),
      renderBlueLine(bellSequence),
      renderPlaces(bellSequence),
      renderTouches(bellSequence),
    ],
  });
});

function renderStyle() {
  return createSvgElement({
    tag: 'style',
    textContent: `
      text {
        font-family: sans-serif;
      }
      .bell {
        font-size: 20px;
      }
      .bell.highlight {
        fill: blue;
        font-weight: bold;
      }
      .bell.work {
        fill: green;
        font-weight: bold;
      }
      .bell.rounds {
        fill: orange;
        font-weight: bold;
      }
      .places {
        font-size: 12px;
        fill: #ccc;
        text-align: end;
      }
      .blue-line {
        fill: none;
        stroke: blue;
        stroke-width: 4px;
        stroke-linejoin: round;
      }
      .repeat-line {
        stroke: #ccc;
      }
      .touch-call {
        fill: #ccc;
        font-size: 25px;
        user-select: none;
      }
      .called {
        font-weight: bold;
      }
      .called.plain {
        fill: black;
      }
      .called.bob {
        fill: brown;
      }
      .called.single {
        fill: purple;
      }
    `,
  });
}

function renderBells(bellSequence) {
  return createSvgElement({
    tag: 'g',
    attributes: {
      transform: 'translate(60, 50)',
    },
    children: bellSequence.bellsList.flatMap((bells, i) => {
      return bells.map((bell, j) => {
        return createSvgElement({
            tag: 'text',
            classes: [
              'bell',
              ...(bell === model.selected.blueLine ? ['highlight'] : []),
              ...(isRounds(bells) ? ['rounds'] : []),
              ...(isDoingWork(bellSequence, i) ? ['work'] : []),
            ],
            textContent: bell,
            attributes: {
              x: j * columnWidth,
              y: i * rowHeight,
            },
          });
      });
    }),
  });
}

function renderBlueLine(bellSequence) {
  return createSvgElement({
    tag: 'path',
    classes: ['blue-line'],
    attributes: {
      transform: `translate(65, ${31 + rowHeight / 2})`,
      d: bellSequence.bellsList.map((bells, i) => {
        const j = bells.indexOf(model.selected.blueLine);
        return `${i === 0 ? 'M' : 'L'} ${j * columnWidth} ${i * rowHeight}`
      }).join(''),
    },
  });
}

function renderPlaces(bellSequence) {
  return createSvgElement({
    tag: 'g',
    attributes: {
      transform: `translate(50, ${47 + rowHeight / 2})`,
    },
    children: bellSequence.annotatedPlacesList.map((annotatedPlaces, i) => {
      return createSvgElement({
        tag: 'text',
        classes: ['places'],
        textContent: annotatedPlaces.places.join(' '),
        attributes: {
          'text-anchor': 'end',
          y: i * rowHeight,
        },
      });
    }),
  });
}

function renderRepeatLines(bellSequence) {
  const method = model.methods[model.selected.methodName];
  const placeNotationLength = method.placeNotation.length;
  return createSvgElement({
    tag: 'g',
    attributes: {
      transform: `translate(50, ${21 + rowHeight / 2})`,
    },
    children: range(bellSequence.bellsList.length / placeNotationLength - 1).map(i => {
      const y = (i + 1) * placeNotationLength * rowHeight;
      return createSvgElement({
        tag: 'path',
        classes: ['repeat-line'],
        attributes: {
          d: `M 0 ${y} L ${method.bells * columnWidth} ${y}`,
        },
      });
    }),
  });
}

function renderTouches(bellSequence) {
  const touch = model.selected.touch;
  const method = model.methods[model.selected.methodName];
  const placeNotationLength = method.placeNotation.length;
  return createSvgElement({
    tag: 'g',
    attributes: {
      transform: `translate(${70 + method.bells * columnWidth}, ${29 + rowHeight / 2})`,
    },
    children: range(bellSequence.bellsList.length / placeNotationLength - 1).flatMap(i => {
      const y = (i + 1) * placeNotationLength * rowHeight;
      const currentTouchCall = i < touch.length ? touch[i] : 'P';
      return ['P', 'B', 'S'].map((touchCall, j) => {
        return createSvgElement({
          tag: 'text',
          classes: [
            ...(currentTouchCall === touchCall ? ['called'] : []),
            touchCall === 'P' ? 'plain' : (touchCall === 'B' ? 'bob' : 'single'),
            'touch-call',
          ],
          textContent: touchCall,
          attributes: {
            x: j * 30,
            y,
          },
          events: {
            click: () => {
              let touch = model.selected.touch;
              if (i >= touch.length) {
                touch += 'P'.repeat(i - touch.length + 1);
              }
              if (touch[i] === touchCall) {
                return;
              }
              model.selected.touch = touch.substring(0, i) + touchCall + touch.substring(i + 1);
              sequence.render();
            },
          },
        });
      });
    }),
  });
}

function isRounds(bells) {
  return bells.every((bell, i) => i === 0 || bell > bells[i - 1]);
}

function isDoingWork(bellSequence, index) {
  return (
    index > 0 && bellSequence.annotatedPlacesList[index - 1].isWork
  ) || (
    index < bellSequence.annotatedPlacesList.length && bellSequence.annotatedPlacesList[index].isWork
  );
}

function computeBellSequence() {
  const method = model.methods[model.selected.methodName];
  const touch = model.selected.touch;
  const bellSequence = {
    bellsList: [],
    annotatedPlacesList: [],
    touches: [],
  };

  let bells = [];
  for (let i = 1; i <= method.bells; ++i) {
    bells.push(i);
  }
  bellSequence.bellsList.push(bells);

  let terminatingBellsString = bells.join('');
  let safetyLimit = 1000;
  while (true) {
    if (--safetyLimit <= 0) {
      break;
    }
    const annotatedPlaces = computeAnnotatedPlaces(bellSequence.bellsList.length - 1);
    bellSequence.annotatedPlacesList.push(annotatedPlaces);
    const bells = makePlaces(arrayLast(bellSequence.bellsList), annotatedPlaces.places);
    bellSequence.bellsList.push(bells);
    const bellsString = bells.join('');
    if (annotatedPlaces.isWork) {
      terminatingBellsString = bellsString;
    } else if (bellsString === terminatingBellsString) {
      break;
    }
  }

  return bellSequence;
}

function computeAnnotatedPlaces(step) {
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
