import { TestSuite } from 'https://randfur.github.io/typescript-testing/testing';

export class Dog extends TestSuite {
  testBark() {
    this.assertEqual(1, 1);
  }

  testBork() {
    this.assertEqual(1, 2);
  }
  
  testBlargb() {
    throw Error('aaaaaaa');
  }
  
  testBrlkdb() {
    this.assertTrue(3 < 2);
  }
  
  testBabkkb() {
    this.assertLambda(() => 3 < 2);
  }
}