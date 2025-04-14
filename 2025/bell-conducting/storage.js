export function loadSavedModel() {
  // try {
  //   const saved = JSON.parse(localStorage.getItem('storage'));
  //   if (saved) {
  //     return saved;
  //   }
  // } catch (e) {
  // }
  return {
    version: 1,
    viewport: {
      initialTouches: {},
      pan: {x: 0, y: 0},
      zoom: 1,
    },
    selected: {
      methodName: 'Original Doubles',
      touch: 'P',
      blueLine: 2,
    },
    methods: {

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
          'P',
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
          'P',
        ],
      },

      'St Martin\'s Bob Doubles': {
        bells: 5,
        placeNotation: [
          [5],
          [1],
          [5],
          [1, 2, 3],
          [5],
          [1, 2, 3],
          [5],
          [1],
          [5],
          [1, 2, 5],
        ],
        bob: {
          work: [
            [1],
            [5],
            [1, 4, 5],
            [5],
            [1],
          ],
          offset: -2,
        },
        single: {
          work: [
            [1],
            [5],
            [1, 2, 3],
            [5],
            [1],
          ],
          offset: -2,
        },
        touches: [
          'P',
        ],
      },

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
            [5],
            [1],
            [3],
            [1],
            [3],
            [1],
          ],
          offset: -3,
        },
        single: {
          work: [
            [5],
            [1],
            [3],
            [1, 2, 3],
            [3],
            [1],
          ],
          offset: -3,
        },
        touches: [
          'P',
        ],
      },

      'Grandsire Triples': {
        bells: 7,
        placeNotation: [
          [3],
          [1],
          [7],
          [1],
          [7],
          [1],
          [7],
          [1],
          [7],
          [1],
          [7],
          [1],
          [7],
          [1],
        ],
        bob: {
          work: [
            [7],
            [1],
            [3],
            [1],
            [3],
            [1],
          ],
          offset: -3,
        },
        single: {
          work: [
            [7],
            [1],
            [3],
            [1, 2, 3],
            [3],
            [1],
          ],
          offset: -3,
        },
        touches: [
          'P',
        ],
      },

      'Cambridge Surprise Minor': {
        bells: 6,
        placeNotation: [
          [],
          [3, 6],
          [],
          [1, 4],
          [],
          [1, 2],
          [],
          [3, 6],
          [],
          [1, 4],
          [],
          [5, 6],
          [],
          [1, 4],
          [],
          [3, 6],
          [],
          [1, 2],
          [],
          [1, 4],
          [],
          [3, 6],
          [],
          [1, 2],
        ],
        bob: {
          work: [
            [1, 4],
            [],
            [3, 6],
            [],
            [1, 4],
            [],
            [3, 6],
            [],
            [1, 4],
          ],
          offset: -4,
        },
        single: {
          work: [
            [1, 4],
            [],
            [3, 6],
            [],
            [1, 2, 3, 4],
            [],
            [3, 6],
            [],
            [1, 4],
          ],
          offset: -4,
        },
        touches: [
          'P',
        ],
      },

      'Cambridge Surprise Major': {
        bells: 8,
        placeNotation: [
          [],
          [3, 8],
          [],
          [1, 4],
          [],
          [1, 2, 5, 8],
          [],
          [3, 6],
          [],
          [1, 4],
          [],
          [5, 8],
          [],
          [1, 6],
          [],
          [7, 8],
          [],
          [1, 6],
          [],
          [5, 8],
          [],
          [1, 4],
          [],
          [3, 6],
          [],
          [1, 2, 5, 8],
          [],
          [1, 4],
          [],
          [3, 8],
          [],
          [1, 2],
        ],
        bob: {
          work: [
            [1, 2, 5, 8],
            [],
            [1, 4],
            [],
            [3, 8],
            [],
            [1, 4],
            [],
            [3, 8],
            [],
            [1, 4],
            [],
            [1, 2, 5, 8],
          ],
          offset: -6,
        },
        single: {
          work: [
            [1, 2, 5, 8],
            [],
            [1, 4],
            [],
            [3, 8],
            [],
            [1, 2, 3, 4],
            [],
            [3, 8],
            [],
            [1, 4],
            [],
            [1, 2, 5, 8],
          ],
          offset: -6,
        },
        touches: [
          'P',
        ],
      },

    },
  };
}

export function saveModel(model) {
  localStorage.setItem('storage', JSON.stringify(model));
}
