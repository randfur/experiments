// @ts-check

/**
 * @typedef {import('./types.ts').KeyboardState} KeyboardState
 */

export class Inputs {
  /** @type {number} */
  #currentFrame = 0;

  /** @type {number} */
  #repeatInitialDelayFrames = 18;

  /** @type {number} */
  #repeatDelayFrames = 2;

  /** @type {KeyboardState} */
  #key = {
    justPressed: {},
    whenPressedFrame: {},
  };

  /** @type {KeyboardState} */
  #code = {
    justPressed: {},
    whenPressedFrame: {},
  };

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat) {
        return;
      }
      this.#key.justPressed[event.key] = true;
      this.#key.whenPressedFrame[event.key] = this.#currentFrame;
      this.#code.justPressed[event.code] = true;
      this.#code.whenPressedFrame[event.code] = this.#currentFrame;
    });
    window.addEventListener('keyup', (event) => {
      delete this.#key.whenPressedFrame[event.key];
      delete this.#code.whenPressedFrame[event.code];
    });
  }

  /**
  * @param {string} key
  * @returns boolean
  */
  isKeyJustPressed(key) {
    return this.#key.justPressed[key];
  }

  /**
  * @param {string} code
  * @returns boolean
  */
  isCodeJustPressed(code) {
    return this.#code.justPressed[code];
  }

  update() {
    ++this.#currentFrame;

    this.#key.justPressed = {};
    this.#code.justPressed = {};

    this.#repeatKeyOrCodes(this.#key);
    this.#repeatKeyOrCodes(this.#code);
  }

  /** @param {string} code */
  resetCodeRepeat(code) {
    this.#code.whenPressedFrame[code] = this.#currentFrame;
  }

  /** @param {KeyboardState} keyboardState */
  #repeatKeyOrCodes(keyboardState) {
    for (const [keyOrCode, whenPressedFrame] of Object.entries(keyboardState.whenPressedFrame)) {
      const repeatCurrentFrame = this.#currentFrame - whenPressedFrame - this.#repeatInitialDelayFrames;
      if (repeatCurrentFrame > 0 && repeatCurrentFrame % this.#repeatDelayFrames === 0) {
        keyboardState.justPressed[keyOrCode] = true;
      }
    }
  }
}