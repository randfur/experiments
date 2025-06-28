import { runTests, TestSuite } from 'https://randfur.github.io/typescript-testing/testing';

runTests([
    class Bark extends TestSuite {
      testDog() {
        this.assertEqual(1, 1);
      }
    },
], document.body);