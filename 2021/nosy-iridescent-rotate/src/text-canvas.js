import {enumerate, range, replaceChar} from './utils.js';

const sectionSpaceGap = 8;

export class TextCanvas {
  constructor({width, height, redraw}) {
    this.width = width;
    this.height = height;
    this.redraw = redraw;
    this.data = range(height).map(_ => ' '.repeat(width));
    this.x = 0;
    this.y = 0;
  }
  
  setChar(x, y, char) {
    this.data[y] = replaceChar(this.data[y], x, char);
  }

  cursorJumpTo(x, y) {
    this.x = x;
    this.y = y;
    this.redraw();
  }
  
  cursorRight() {
    if (!this.atEndOfLine(this.x, this.y)) {
      ++this.x;
    } else if (this.y < this.height - 1) {
      this.x = Math.min(this.startOfLine(this.x, this.y), this.startOfLine(this.x, this.y + 1));
      ++this.y;
    }
  }
  
  atEndOfLine(x, y) {
    if (this.x == this.width)
      return true;
    if (this.x === this.width - 1 && this.data[y][x] !== ' ')
      return false;
    return this.rangeIsWhitespace(x, y, sectionSpaceGap);
  }
  
  rangeIsWhitespace(x, y, length) {
    return this.findNonWhitespaceIndexInRange(x, y, length) === null;
  }
  
  findNonWhitespaceIndexInRange(x, y, length) {
    for (let i of range(length)) {
      const testX = x + i;
      if (testX < 0)
        continue;
      if (testX >= this.width)
        return null;
      if (this.data[y][testX] !== ' ')
        return testX;
    }
    return null;
  }
  
  startOfLine(x, y) {
    let nonWhitespaceIndex = this.findNonWhitespaceIndexInRange(x - sectionSpaceGap, y, sectionSpaceGap * 2);
    if (nonWhitespaceIndex === null)
      return x;
    let whitespaceCount = 0;
    while (true) {
      const testX = nonWhitespaceIndex - whitespaceCount - 1;
      if (testX <= 0)
        return nonWhitespaceIndex;
      if (this.data[y][testX] !== ' ') {
        whitespaceCount = 0;
        nonWhitespaceIndex = testX;
      } else {
        ++whitespaceCount;
      }
      if (whitespaceCount >= sectionSpaceGap)
        return nonWhitespaceIndex;
    }
  }
  
  draw(context, leftPaddingPx, fontWidth, fontHeight) {
    for (let [y, line] of enumerate(this.data))
      context.fillText(line, leftPaddingPx, (y + 1) * fontHeight);
    context.fillRect(leftPaddingPx + this.x * fontWidth, (this.y + 1) * fontHeight - 2, fontWidth, 2);
  }
}