export class Page {
  static width: number = window.innerWidth;
  static height: number = window.innerHeight;
  static canvas = document.getElementById('canvas')! as HTMLCanvasElement;
  static context: CanvasRenderingContext2D;
}

Page.canvas.width = Page.width;
Page.canvas.height = Page.height;
Page.context = Page.canvas.getContext('2d')!;

