import {TextCanvas} from './text-canvas.js';

const context = canvas.getContext('2d');

const leftPaddingPx = 3;
let fontWidth = null;
let fontHeight = null;

let textCanvas = null;

function init() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  context.font = '14px monospace';
  const fontMetrics = context.measureText('#');
  fontWidth = fontMetrics.width;
  fontHeight = fontMetrics.fontBoundingBoxDescent + fontMetrics.fontBoundingBoxAscent;
  textCanvas = new TextCanvas({
    width: Math.floor(canvas.width / fontWidth),
    height: Math.floor(canvas.height / fontHeight),
    redraw: draw,
  });
  
  // addEventListener('keydown', keydownEvent);
  addEventListener('mousedown', mousedownEvent);
}

// function keydownEvent(event) {
//   if (event.key.length == 1) {
//     text[cursorRow] = replaceChar(text[cursorRow], cursorColumn, event.key);
//     ++cursorColumn;
//     draw();
//     return;
//   }

//   const oldCursorRow = cursorRow;
//   const oldCursorColumn = cursorColumn;
//   switch (event.code) {
//     case 'ArrowUp':
//       cursorRow = Math.max(cursorRow - 1, 0);
//       break;
//     case 'ArrowDown':
//       cursorRow = Math.min(cursorRow + 1, textHeight - 1);
//       break;
//     case 'ArrowLeft': {
//       const rowStart = findSectionStart(text[cursorRow], cursorColumn);
//       if (rowStart == null) {
//         cursorColumn = Math.max(cursorColumn - 1, 0);
//         break;
//       }
//       if (cursorColumn == rowStart) {
//         if (cursorRow == 0)
//           break;
//         const aboveRowEnd = findSectionEnd(text[cursorRow - 1], rowStart);
//         if (aboveRowEnd == rowStart)
//           break;
//         --cursorRow;
//         cursorColumn = aboveRowEnd;
//         break;
//       }
//       --cursorColumn;
//       break;
//     }
//     case 'ArrowRight': {
//       const rowStart = findSectionStart(text[cursorRow], cursorColumn);
//       if (rowStart == null) {
//         cursorColumn = Math.min(cursorColumn + 1, textWidth - 1);
//         break;
//       }
//       const rowEnd = findSectionEnd(text[cursorRow], cursorColumn);
//       if (cursorColumn < rowEnd) {
//         ++cursorColumn;
//         break;
//       }
//       if (cursorRow < textHeight - 1) {
//         ++cursorRow;
//         cursorColumn = rowStart;
//         break;
//       }
//       break;
//     }
//     case 'ArrowRight':
//       cursorColumn = Math.min(cursorColumn + 1, textHeight - 1);
//       break;
//   }
//   if (cursorRow != oldCursorRow || cursorColumn != oldCursorColumn)
//     draw();
// }

// function findFirstSectionNonWhitespace(text, index) {
//   for (let i = 0; i < sectionGap; ++i) {
//     if (index + i >= text.length)
//       return null;
//     if (text[index + i] != ' ')
//       return index + i;
//   }
//   return null;
// }

// function findSectionStart(text, index) {
//   index = findFirstSectionNonWhitespace(text, index > 0 ? index - 1 : 0);
//   if (index == null)
//     return null;
//   while (true) {
//     let redo = false;
//     for (let i = 1; i <= sectionGap; ++i) {
//       if (index - i < 0)
//         return 0;
//       if (text[index - i] != ' ') {
//         index -= i;
//         redo = true;
//         break;
//       }
//     }
//     if (!redo)
//       return index;
//   }
// }

// function findSectionEnd(text, index) {
//   while (true) {
//     let redo = false;
//     for (let i = 0; i < sectionGap; ++i) {
//       if (index + i >= text.length)
//         return index;
//       if (text[index + i] != ' ') {
//         index += i + 1;
//         redo = true;
//         break;
//       }
//     }
//     if (!redo)
//       return index;
//   }
// }

function mousedownEvent(event) {
  textCanvas.cursorJumpTo(Math.floor((event.offsetX - leftPaddingPx) / fontWidth), Math.floor(event.offsetY / fontHeight));
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  textCanvas.draw(context, leftPaddingPx, fontWidth, fontHeight);
}

function main() {
  init();
  draw();
}
main();