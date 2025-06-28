import {runTests, TestSuite} from './javascript-testing.js';
import {TextCanvas} from '../src/text-canvas.js';
import {enumerate, replaceChar} from '../src/utils.js';

class TestTextCanvas extends TextCanvas {
  constructor(testCase, initial) {
    super({
      width: initial[0].length,
      height: initial.length,
      redraw() {},
    });

    for (let [y, line] of enumerate(initial)) {
      for (let [x, char] of enumerate(line)) {
        if (char == 'C' || char == '_') {
          this.x = x;
          this.y = y;
          char = char == 'C' ? '.' : ' ';
        }
        this.setChar(x, y, char);
      }
    }

    this.testCase = testCase;
  }
  
  expect(template) {
    for (let [y, line] of enumerate(this.data)) {
      if (this.y == y) {
        const onWhitespace = this.x === this.width || line[this.x] == ' ';
        line = replaceChar(line, this.x, onWhitespace ? 'c' : 'C');
      }
      if (!this.testCase.assertEqual(line, template[y])) {
        return;
      }
    }
  }
}

runTests([
  class Test extends TestSuite {
    testCursorRightToWidth() {
      const canvas = new TestTextCanvas(this, ['C..']);
      canvas.cursorRight();
      canvas.expect(['.C.']);
      canvas.cursorRight();
      canvas.expect(['..C']);
      canvas.cursorRight();
      canvas.expect(['...c']);
    }

    testCursorRightToGap() {
      const canvas = new TestTextCanvas(this, ['C.. ..    ..        ..']);
      canvas.cursorRight();
      canvas.expect(['.C. ..    ..        ..']);
      canvas.cursorRight();
      canvas.expect(['..C ..    ..        ..']);
      canvas.cursorRight();
      canvas.expect(['...c..    ..        ..']);
      canvas.cursorRight();
      canvas.expect(['... C.    ..        ..']);
      canvas.cursorRight();
      canvas.expect(['... .C    ..        ..']);
      canvas.cursorRight();
      canvas.expect(['... ..c   ..        ..']);
      canvas.cursorRight();
      canvas.expect(['... .. c  ..        ..']);
      canvas.cursorRight();
      canvas.expect(['... ..  c ..        ..']);
      canvas.cursorRight();
      canvas.expect(['... ..   c..        ..']);
      canvas.cursorRight();
      canvas.expect(['... ..    C.        ..']);
      canvas.cursorRight();
      canvas.expect(['... ..    .C        ..']);
      canvas.cursorRight();
      canvas.expect(['... ..    ..c       ..']);
      canvas.cursorRight();
      canvas.expect(['... ..    ..c       ..']);
    }

    testCursorRightToWidthWrap() {
      const canvas = new TestTextCanvas(this, [
        'C..',
        '.. ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.C.',
        '.. ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '..C',
        '.. ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...c',
        '.. ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...',
        'C. ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...',
        '.C ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...',
        '..c',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...',
        '..c',
      ]);
    }

    testCursorRightToGapWrap() {
      const canvas = new TestTextCanvas(this, [
        'C..  ..        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.C.  ..        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '..C  ..        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...c ..        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '... c..        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  C.        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  .C        ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  ..c       ..',
        '..             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  ..        ..',
        'C.             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  ..        ..',
        '.C             . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  ..        ..',
        '..c            . ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '...  ..        ..',
        '..c            . ',
      ]);
    }

    testCursorRightIndentation() {
      const canvas = new TestTextCanvas(this, [
        'C    ',
        ' ..  ',
        '     ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.c   ',
        ' ..  ',
        '     ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        'c..  ',
        '     ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' C.  ',
        '     ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' .C  ',
        '     ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..c ',
        '     ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        ' c   ',
        '  .  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        ' c.  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        '  C  ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        '  .c ',
        '..   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        '  .  ',
        'C.   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        '  .  ',
        '.C   ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        '  .  ',
        '..c  ',
      ]);
      canvas.cursorRight();
      canvas.expect([
        '.    ',
        ' ..  ',
        '     ',
        '  .  ',
        '..c  ',
      ]);
    }
  },
], document.body);