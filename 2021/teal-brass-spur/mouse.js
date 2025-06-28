export class Mouse {
  static x = 0;
  static y = 0;

  static init() {
    window.addEventListener('mousemove', event => {
      Mouse.x = event.offsetX;
      Mouse.y = event.offsetY;
    });
  },
}