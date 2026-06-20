export class RenderableElement {
  constructor(create) {
    this.element = null;
    this.create = create;
  }

  render() {
    const newElement = this.create();
    if (this.element !== null) {
      this.element.replaceWith(newElement);
    }
    this.element = newElement;
    return this.element;
  }
}
