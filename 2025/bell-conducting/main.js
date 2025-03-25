const svgNamespace = 'http://www.w3.org/2000/svg';

let model = null;
let container = null;

function main() {
  model = loadSavedModel();
  container = document.createElement('div');
  document.body.append(container);
  render();
}

function render() {
  container.replaceChildren(
    renderMethodPicker(),
    renderBr(),
    renderSavedTouchPicker(),
    renderBr(),
    renderTouch(),
    renderBr(),
    // renderBellLinePicker(),
    renderBr(),
    renderSequence(),
  );
}

function renderMethodPicker() {
  const select = document.createElement('select');
  const methodEntries = Object.entries(model.methods).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [name, method] of methodEntries) {
    const option = document.createElement('option');
    option.textContent = name;
    if (name === model.selected.methodName) {
      option.selected = true;
    }
    select.append(option);
  }
  select.addEventListener('change', event => {
    model.selected.methodName = select.value;
    const method = model.methods[select.value];
    model.selected.touch = method.touches[0];
    model.selected.bellLine = Math.min(model.selected.bellLine, method.bells);
    render();
  });
  return select;
}

function renderBr() {
  return document.createElement('br');
}

function renderSavedTouchPicker() {
  const select = document.createElement('select');
  const method = model.methods[model.selected.methodName];
  for (const touch of method.touches) {
    const option = document.createElement('option');
    option.textContent = touch;
    if (name === model.selected.touch) {
      option.selected = true;
    }
    select.append(option);
  }
  select.addEventListener('change', event => {
    model.selected.touch = select.value;
    render();
  });
  return select;
}

function renderTouch() {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = model.selected.touch;
  input.disabled = true;
  return input;
}

function renderSequence() {
  const svg = document.createElementNS(svgNamespace, 'svg');
  const sequence = computeSequence();
  console.log(sequence.bellsList);
  const text = document.createElementNS(svgNamespace, 'text');
  text.setAttribute('x', 10);
  text.setAttribute('y', 40);
  text.textContent = sequence.bellsList;
  svg.append(text);
  return svg;
}

function computeSequence() {
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
    const annotatedPlaces = computeAnnotatedPlaces(sequence.bellsList.length - 1);
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

function loadSavedModel() {
  try {
    const saved = JSON.parse(localStorage.getItem('storage'));
    if (saved) {
      return saved;
    }
  } catch (e) {
  }
  return {
    version: 1,
    methods: {
      'Grandsire Doubles': {
        bells: 5,
        placeNotation: [
          [3],
          [1],
          [5],
          [1],
          [5],
          [1],
          [5],
          [1],
          [5],
          [1],
        ],
        bob: {
          work: [
            [3],
          ],
          offset: -1,
        },
        single: {
          work: [
            [3],
            [1, 2, 3],
          ],
          offset: -1,
        },
        touches: [
          '',
        ],
      },
      'Plain Bob Doubles': {
        bells: 5,
        placeNotation: [
          [5],
          [1],
          [5],
          [1],
          [5],
          [1],
          [5],
          [1],
          [5],
          [1, 2, 5],
        ],
        bob: {
          work: [
            [1, 4, 5],
          ],
          offset: 0,
        },
        single: {
          work: [
            [1, 2, 3],
          ],
          offset: 0,
        },
        touches: [
          '',
        ],
      },
      'Original Doubles': {
        bells: 5,
        placeNotation: [
          [5],
          [1],
        ],
        bob: {
          work: [
            [3],
          ],
          offset: -1,
        },
        single: {
          work: [
            [3, 4, 5],
          ],
          offset: -1,
        },
        touches: [
          '',
        ],
      },
    },
    selected: {
      methodName: 'Grandsire Doubles',
      touch: '',
      bellLine: 2,
    },
  };
}

function saveModel() {
  localStorage.setItem('storage', JSON.stringify(model));
}

main();