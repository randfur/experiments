export function loadSavedModel() {
  try {
    const saved = JSON.parse(localStorage.getItem('storage'));
    if (saved) {
      return saved;
    }
  } catch (e) {
  }
  return {
    version: 1,
    viewport: {
      initialTouches: {},
      pan: {x: 0, y: 0},
      zoom: 1,
    },
    selected: {
      methodName: 'Plain Bob Doubles',
      touch: 'BPBPBP',
      blueLine: 2,
    },
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
          'BPSPBPBPSPBP',
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
          'BPBPBP',
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
          'BPBPBP',
        ],
      },
    },
  };
}

export function saveModel(model) {
  localStorage.setItem('storage', JSON.stringify(model));
}
