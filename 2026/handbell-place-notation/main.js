const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
};
const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
};
const upDownStyle = {
  padding: '10px 20px',
  backgroundColor: '#fa05',
  fontSize: '40px',
  ...rowStyle,
  alignItems: 'center',
  borderRadius: '10px',
  userSelect: 'none',
  cursor: 'pointer',
};

const model = {
  bells: 6,
  startingPlace: 1,
  currentPlaces: [1, 2],
  selectedPlace: null,
  showCurrentPlaces: false,
  rightLeading: true,
  currentPlaceNotation: null,
};

function main() {
  updateStyle(document.body, {
    ...columnStyle,
    alignItems: 'center',
    touchAction: 'manipulation',
    fontFamily: 'sans-serif',
  });

  render();
}

function render() {
  document.body.replaceChildren(
    createElement({
      tag: 'div',
      style: {
        ...columnStyle,
        width: '800px',
        backgroundColor: '#8321',
        padding: '20px',
        gap: '50px',
      },
      children: [
        createTitle(),
        createOptions(),
        createPlaceNotation(),
        createPlaceInput(),
        createScore(),
        createHintReset(),
      ],
    }),
  );
}

function createTitle() {
  return createDiv({
    style: {
      ...columnStyle,
    },
    children: [
      createElement({
        tag: 'h1',
        style: {alignSelf: 'center'},
        children: ['Handbell Place Notation Ringing'],
      }),
      'Practice handbell ringing by place notation, ring rounds on the starting places to start.',
    ],
  });
}

function createOptions() {
  return createDiv({
    children: [
      createElement({
        tag: 'h2',
        children: ['Options'],
      }),
      createDiv({
        style: {
          ...rowStyle,
          gap: '40px',
          fontSize: '20px',
        },
        children: [
          createColumn(
            'Bells',
            upDown({
              children: [model.bells],
              upDownHandler(delta) {
                model.bells = Math.max(model.bells + delta, 2);
                clampStartingPlace();
                reset();
                render();
              },
            }),
          ),
          createColumn(
            'Starting places',
            upDown({
              children: [`${model.startingPlace} ${model.startingPlace + 1}`],
              upDownHandler(delta) {
                model.startingPlace += delta;
                clampStartingPlace();
                reset();
                render();
              },
            }),
          ),
        ],
      }),
    ],
  });
}

function clampStartingPlace() {
  model.startingPlace = Math.max(Math.min(model.startingPlace, model.bells - 1), 1);
}

function upDown({children, upDownHandler}) {
  return createDiv({
    style: {
      ...rowStyle,
      gap: '5px',
    },
    children: [
      createDiv({
        style: upDownStyle,
        events: {
          click: element => upDownHandler(-1),
        },
        children: ['-'],
      }),
      createDiv({
        style: {
          ...upDownStyle,
          backgroundColor: '#4442',
          cursor: 'auto',
        },
        children,
      }),
      createDiv({
        style: upDownStyle,
        events: {
          click: element => upDownHandler(1),
        },
        children: ['+'],
      }),
    ],
  });
}

function createPlaceNotation() {
  return createDiv({
    style: {
      ...columnStyle,
      alignItems: 'center',
    },
    children: [
      createElement({
        tag: 'h2',
        style: {fontSize: '40px'},
        children: ['Place Notation'],
      }),
      createDiv({
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '0px 40px',
          height: '150px',
          fontSize: model.currentPlaceNotation ? '100px' : '50px',
          backgroundColor: '#5555',
        },
        children: [
          model.currentPlaceNotation ?? `Ring ${model.startingPlace} ${model.startingPlace + 1} to start`,
        ],
      }),
    ],
  });
}

function createPlaceInput() {
  return createDiv({
    style: {
      ...rowStyle,
      gap: '5px',
    },
    children: range(model.bells).map(i => createDiv({
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: 'auto',
        height: '100px',
        fontSize: '50px',
        backgroundColor: model.selectedPlace === (i + 1) ? '#3af8' : '#7703',
        borderRadius: '10px',
        userSelect: 'none',
        cursor: 'pointer',
      },
      events: {
        click() {
          const place = i + 1;
          if (model.selectedPlace === null) {
            model.selectedPlace = place;
          } else if (model.selectedPlace === place) {
            return;
          } else {
            model.selectedPlace = null;
          }
          render();
        },
      },
      children: [i + 1],
    })),
  });
}

function createScore() {
  return createDiv();
}

function createHintReset() {
  return createDiv();
}

function reset() {
}

function createDiv({style, events, children}={}) {
  return createElement({
    tag: 'div',
    style,
    events,
    children,
  });
}

function createColumn(...children) {
  return createElement({
    tag: 'div',
    style: columnStyle,
    children,
  });
}

function createElement({tag, style, events, children}={}) {
  const element = document.createElement(tag);

  if (style) {
    updateStyle(element, style);
  }

  if (events) {
    for (const [eventName, handler] of Object.entries(events)) {
      element.addEventListener(eventName, event => handler(element, event));
    }
  }

  if (children) {
    element.append(...children);
  }

  return element;
}

function updateStyle(element, style) {
  for (const [property, value] of Object.entries(style)) {
    element.style[property] = value;
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();
