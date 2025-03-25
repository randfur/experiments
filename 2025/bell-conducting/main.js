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
    placesList: [],
  };

  let bells = [];
  for (let i = 1; i <= method.bells; ++i) {
    bells.push(i);
  }
  sequence.bellsList.push(bells);

  // while (touchIndex < touch.length) {
  //   touchCall = touch[touchIndex];
  //   console.log('todo');
  // }

  // Run until we see a repeated sequence.
  while (true) {
    const places = computePlaces(sequence.bellsList.length - 1);

    // if repeated sequence seen:
    break;
  }


  return sequence;
}

function computePlaces(step) {
  const method = model.methods[model.selected.methodName];
  const touch = model.selected.touch;
  // Find where step is inside a placeNotation sequence.
  const repeatLength = method.placeNotation.length;
  const placeNotationIndex = step % repeatLength;
  const touchIndex = Math.floor(step / repeatLength);
  const lastTouchCall = touchIndex > 0 && touchIndex <= touch.length ? touch[touchIndex - 1] : 'P';
  const touchCall = touchIndex >= 0 && touchIndex < touch.length ? touch[touchIndex] : 'P';

  // Overlay lastTouchCall work over the beginning.

  // Overlay touchCall work over the ending.
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
            [1],
            [3],
          ],
          offset: -1,
        },
        single: {
          work: [
            [3],
            [1, 2, 3],
            [3],
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
      methodName: 'Plain Bob Doubles',
      touch: '',
      bellLine: 2,
    },
  };
}

function saveModel() {
  localStorage.setItem('storage', JSON.stringify(model));
}

main();