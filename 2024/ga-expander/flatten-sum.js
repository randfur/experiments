/*
import {Sum} from './astiser.js';

export FlattenedSum = Array<
  Array<
    number | string | {func: string, flattenedSum: FlattenedSum
  >
>;

export function flattenSum(sum: Sum): Sum;
*/
export function flattenSum(sum) {
  for (const product of sum) {
    for (const term of product) {
      if (term.func === '()') {
      }
    }
  }
}
