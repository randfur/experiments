export class Mouse {
  constructor() {
    this.down = false;
    this.x = 0;
    this.y = 0;
    addEventListener('pointerdown', event => {
      this.down = true;
      this.updatePosition(event);
    });
    addEventListener('pointermove', event => {
      if (this.down) {
        this.updatePosition(event);
      }
    });
    addEventListener('pointerup', event => {
      this.down = false;
    });
  }

  updatePosition(event) {
    this.x = event.clientX - (innerWidth / 2);
    this.y = -(event.clientY - (innerHeight / 2));
  }
}