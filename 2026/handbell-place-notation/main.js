const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
};
const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const upDownStyle = {
  padding: '10px 20px',
  backgroundColor: '#fa05',
  fontSize: '40px',
  ...rowStyle,
  alignItems: 'center',
  borderRadius: '10px',
  cursor: 'pointer',
};
const centreStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const model = {
  bells: 6,
  startingPlace: 1,
  currentPlaces: [1, 2],
  selectedPlace: null,
  showCurrentPlaces: false,
  currentRightLeading: true,
  nextRightLeading: true,
  currentPlaceNotation: null,
  status: 'Start',
  turnHistory: [],
};

function main() {
  updateStyle(document.body, {
    ...columnStyle,
    touchAction: 'manipulation',
    fontFamily: 'sans-serif',
    fontSize: '20px',
    userSelect: 'none',
  });

  document.body.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault();
      swapLeading();
      render();
      return;
    }

    const place = placeString.indexOf(event.key.toUpperCase());
    if (place !== -1) {
      selectPlace(place);
      render();
      return;
    }
  });

  render();
}

function render() {
  document.body.replaceChildren(
    createElement({
      tag: 'div',
      style: {
        ...columnStyle,
        alignItems: 'auto',
        width: '800px',
        backgroundColor: '#8321',
        padding: '20px',
        gap: '50px',
      },
      children: [
        createTitle(),
        createOptions(),
        createPlaceNotation(),
        createStatus(),
        createPlaceInput(),
        createLeadingHandInput(),
        createScore(),
        createReset(),
      ],
    }),
  );
}

function createTitle() {
  return createColumn(
    createElement({
      tag: 'h1',
      style: {alignSelf: 'center'},
      children: ['Handbell Place Notation Ringing'],
    }),
    'Practice handbell ringing by place notation, ring rounds on the starting places to start.',
  );
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
        },
        children: [
          createColumn(
            'Bells',
            upDown({
              children: [model.bells],
              upDownHandler(delta) {
                model.bells = Math.max(Math.min(model.bells + delta, 12), 2);
                clampStartingPlace();
                reset();
                render();
              },
            }),
          ),
          createColumn(
            'Starting places',
            upDown({
              children: [startingPlaces()],
              upDownHandler(delta) {
                model.startingPlace += delta;
                clampStartingPlace();
                reset();
                render();
              },
            }),
          ),
          createColumn(
            'Show current places',
            createDiv({
              style: {
                ...upDownStyle,
                justifyContent: 'center',
                width: '70px',
                backgroundColor: model.showCurrentPlaces ? '#fa05' : '#4442',
              },
              events: {
                click() {
                  model.showCurrentPlaces = !model.showCurrentPlaces;
                  render();
                }
              },
              children: [model.showCurrentPlaces ? 'On' : 'Off'],
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
          borderRadius: '20px',
          height: '150px',
          fontSize: model.currentPlaceNotation ? '100px' : '50px',
          backgroundColor: '#5555',
        },
        children: [
          model.currentPlaceNotation ?? `Ring ${startingPlaces()} to start`,
        ],
      }),
    ],
  });
}

function createStatus() {
  return createDiv({
    style: {
      ...columnStyle,
      alignItems: 'auto',
    },
    children: [
      createDiv({children: [`Turn status: ${model.status}`]}),
      ...(model.showCurrentPlaces ? [
        createDiv({children: [
          `Current places: ${model.currentPlaces.join(' ')} ${model.currentRightLeading ? 'right' : 'left'} leading`,
        ]}),
      ] : []),
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
        ...centreStyle,
        flex: 1,
        width: 'auto',
        height: '100px',
        fontSize: '50px',
        backgroundColor: model.selectedPlace === (i + 1) ? '#3af8' : '#7703',
        borderRadius: '10px',
        cursor: 'pointer',
      },
      events: {
        click() {
          selectPlace(i + 1);
          render();
        },
      },
      children: [i + 1],
    })),
  });
}

function createLeadingHandInput() {
  return createDiv({
    style: {
      ...centreStyle,
      flexDirection: 'column',
      gap: '5px',
    },
    children: [
      'Leading hand',
      createDiv({
        style: {
          ...rowStyle,
          borderRadius: '30px',
          fontSize: '40px',
          overflow: 'hidden',
        },
        children: [
          createDiv({
            style: {
              ...centreStyle,
              width: '140px',
              height: '100px',
              cursor: 'pointer',
              backgroundColor: !model.nextRightLeading ? '#00fc' : '#0001',
              color: !model.nextRightLeading ? 'white' : 'black',
            },
            events: {
              click() {
                swapLeading();
                render();
              },
            },
            children: [
              'Left'
            ],
          }),
          createDiv({
            style: {
              ...centreStyle,
              width: '140px',
              height: '100px',
              cursor: 'pointer',
              backgroundColor: model.nextRightLeading ? '#f00f' : '#0001',
              color: model.nextRightLeading ? 'white' : 'black',
            },
            events: {
              click() {
                swapLeading();
                render();
              },
            },
            children: [
              'Right'
            ],
          }),
        ],
      }),
    ],
  });
}

function createScore() {
  const history = model.turnHistory.map(correct => correct ? '✔' : '✖').join(' ');
  const percentage = (100 * score()).toFixed(0);
  return `Score: ${history} (${percentage}%)`;
}

function createReset() {
  return createDiv({
    style: {
      ...upDownStyle,
      backgroundColor: '#f425',
      justifyContent: 'center',
    },
    events: {
      click() {
        reset();
        render();
      },
    },
    children: ['Reset'],
  });
}

function startingPlaces() {
  return `${model.startingPlace} ${model.startingPlace + 1}`;
}

function reset() {
  model.currentPlaces = [model.startingPlace, model.startingPlace];
  model.selectedPlace = null;
  model.nextRightLeading = true;
  model.currentRightLeading = true;
  model.currentPlaceNotation = null;
  model.status = 'Start';
  model.turnHistory = [];
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

function swapLeading() {
  model.nextRightLeading = !model.nextRightLeading;
}

function selectPlace(place) {
  const {places: expectedPlaces, rightLeading: expectedRightLeading} = expectedPlacesAndHand();
  if (model.nextRightLeading !== expectedRightLeading) {
    model.status = 'Wrong hand leading';
    model.turnHistory.push(false);
  } else {
    if (model.selectedPlace === null) {
      if (place !== expectedPlaces[0]) {
        model.status = 'Wrong place';
        model.turnHistory.push(false);
      } else {
        model.selectedPlace = place;
        model.status = 'Halfway there';
      }
    } else {
      if (place !== expectedPlaces[1]) {
        model.status = 'Wrong place';
        model.turnHistory.push(false);
      } else {
        model.selectedPlace = null;
        model.currentPlaces = expectedPlaces;
        model.currentRightLeading = expectedRightLeading;
        model.status = 'Correct';
        model.turnHistory.push(true);
        model.currentPlaceNotation = rollNewValue(model.currentPlaceNotation, randomPlaceNotation);
      }
    }
  }
}

function expectedPlacesAndHand() {
  if (model.currentPlaceNotation === null) {
    return {
      places: [model.startingPlace, model.startingPlace + 1],
      rightLeading: true,
    };
  }

  const swappedLeadingPlace = applyPlaceNotation(model.currentPlaces[0], model.currentPlaceNotation);
  const swappedFollowingPlace = applyPlaceNotation(model.currentPlaces[1], model.currentPlaceNotation);
  return {
    places: [swappedLeadingPlace, swappedFollowingPlace].toSorted(),
    rightLeading: model.currentRightLeading !== (swappedLeadingPlace > swappedFollowingPlace),
  };
}

const placeString = 'z1234567890ET';
function applyPlaceNotation(place, placeNotation) {
  const evenPlace = place % 2 === 0;
  if (placeNotation === 'x') {
    return place + (evenPlace ? -1 : 1);
  }
  let lowestStayPlace = null;
  for (const stayString of placeNotation) {
    const stayPlace = placeString.indexOf(stayString);
    if (stayPlace < place) {
      lowestStayPlace = stayPlace;
    } else if (stayPlace === place) {
      return place;
    } else {
      break;
    }
  }
  const evenLowestStayPlace = (lowestStayPlace ?? 0) % 2 === 0;
  return place + (evenPlace === evenLowestStayPlace ? -1 : 1);
}

function randomPlaceNotation() {
  let placeNotation = '';
  for (let place = 1; place <= model.bells; ++place) {
    if (Math.random() < 1 / model.bells) {
      placeNotation += placeString[place];
    } else {
      ++place;
    }
  }
  if (placeNotation === '') {
    return model.bells % 2 === 0
      ? 'x'
      : placeString[Math.random() < 0.5 ? '1' : model.bells];
  }
  if ((model.bells - placeString.indexOf(placeNotation[placeNotation.length - 1])) % 2 === 1) {
    placeNotation += placeString[model.bells];
  }
  return placeNotation;
}

function score() {
  if (model.turnHistory.length === 0) {
    return 0;
  }
  return model.turnHistory.filter(x => x).length / model.turnHistory.length;
}

function rollNewValue(oldValue, createNewValue, maxAttempts=100) {
  for (let i = 0; i < maxAttempts; ++i) {
    const value = createNewValue();
    if (value !== oldValue) {
      return value;
    }
  }
  return oldValue;
}

main();
