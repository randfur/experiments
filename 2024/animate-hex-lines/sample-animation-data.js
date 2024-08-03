export const sampleAnimationData = {
  spriteMap: {
    '': {
      id: '',
      framesPerSecond: 10,
      fillStart: 'clamp',
      fillEnd: 'repeat',
      guideLayers: [],
      visibleLayers: [{
        animatedTransform: null,
        keyframes: [{
          frame: 0,
          frames: 4,
          group: {
            type: 'group',
            animatedTransform: null,
            pixelSize: 1,
            opacity: 1,
            children: [{
              type: 'lineBuffer',
              animatedTransform: null,
              lineBufferId: 0,
            }],
          },
        }, {
          frame: 4,
          frames: 4,
          group: {
            type: 'group',
            animatedTransform: null,
            pixelSize: 1,
            opacity: 1,
            children: [{
              type: 'lineBuffer',
              animatedTransform: null,
              lineBufferId: 1,
            }],
          },
        }],
      }],
    },
  },
  lineBufferDataMap: {
    [0]: [
      0, 0, 10, 255, 255, 255,
      100, 40, 9, 200, 220, 255,
      -100, 70, 8, 200, 220, 200,
      0, 0, 0, 0, 0, 0,
    ],
    [1]: [
      0, 0, 9, 255, 255, 255,
      110, 45, 10, 255, 255, 200,
      -120, 65, 11, 200, 220, 200,
      0, 0, 0, 0, 0, 0,
    ],
  },
};
