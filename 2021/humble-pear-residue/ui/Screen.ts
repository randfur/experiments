export class Screen {
  static canvas?: HTMLCanvasElement;
  static context?: CanvasRenderingContext2D;
  static width = window.innerWidth;
  static height = window.innerHeight;
  static init(canvas: HTMLCanvasElement) {
    Screen.canvas = canvas;
    Screen.canvas.width = Screen.width;
    Screen.canvas.height = Screen.height;
    Screen.context = Screen.canvas.getContext('2d')!;
  }
}