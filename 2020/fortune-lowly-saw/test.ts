import { runTests } from 'https://randfur.github.io/typescript-testing/testing';
import { Dog } from './test/dog';

runTests([
  Dog,
], document.body);