export default class Hash {
  static get() {
    // slice(1) to remove the # prefix.
    return location.hash.slice(1);
  }

  static _internallySetValue = null;
  static set(value) {
    Hash._internallySetValue = value;
    location.hash = value;
  }

  static isSetByUser() {
    return Hash.get() !== Hash._internallySetValue;
  }
};
