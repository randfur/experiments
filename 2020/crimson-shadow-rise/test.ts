import { runTests, TestSuite } from 'https://randfur.github.io/typescript-testing/testing';
import { SketchPad } from 'ts/sketchpad';

runTests([
  class Basics extends TestSuite {
    testExists() {
      this.assertTrue(SketchPad);
    }
  },
], document.body);