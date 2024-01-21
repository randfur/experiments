/*
import {AST, Sum} from './astiser.js';

export function inlineAssignments(ast: AST): Sum;
*/
export function inlineAssignments(ast) {
  const assignmentMap = Object.fromEntries(ast.assignments.map(assignment => [assignment.ident, assignment.sum]));
  const inlinedAssignmentMap = inlineAssignmentsInAssignmentMap(assignmentMap);
  return inlineAssignmentsInSum(ast.sum, inlinedAssignmentMap, []);
}

function inlineAssignmentsInAssignmentMap(assignmentMap) {
  return Object.fromEntries(
    Object.entries(assignmentMap).map(
      ([ident, sum]) => [ident, inlineAssignmentsInSum(sum, assignmentMap, [ident])]
    )
  );
}

function inlineAssignmentsInSum(sum, assignmentMap, seenIdents) {
  return sum.map(product => product.map(term => {
    if (term.ident && assignmentMap[term.ident]) {
      if (seenIdents.includes(term.ident)) {
        throw 'Cycle found';
      }
      return inlineAssignmentsInSum(assignmentMap[term.ident], assignmentMap, [...seenIdents, term.ident]);
    }

    if (term.func) {
      return {
        func: term.func,
        sum: inlineAssignmentsInSum(term.sum, assignmentMap, seenIdents),
      };
    }

    return term;
  }));
}

