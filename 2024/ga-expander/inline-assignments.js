/*
import {AST, Sum} from './astiser.js';

export function inlineAssignments(ast: AST): Sum;
*/
export function inlineAssignments(ast) {
  const assignmentMap = Object.fromEntries(
    ast.assignments.map(
      assignment => [assignment.ident, assignment.sum]
    )
  );

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
  return {
    type: 'sum',
    products: sum.products.map(product => ({
      type: 'product',
      terms: product.terms.map(term => {
        switch (term.type) {
        case 'number':
          return term;

        case 'ident':
          const ident = term.value;
          if (assignmentMap[ident]) {
            if (seenIdents.includes(ident)) {
              throw `Cycle found: ${ident} -> ${seenIdents.join(', ')}`;
            }
            return {
              type: 'parens',
              sum: inlineAssignmentsInSum(
                assignmentMap[ident],
                assignmentMap,
                [...seenIdents, ident],
              ),
            };
          }
          return term;

        case 'func':
          return {
            ...term,
            arg: inlineAssignmentsInSum(term.arg, assignmentMap, seenIdents),
          };

        case 'parens':
          return {
            ...term,
            sum: inlineAssignmentsInSum(term.sum, assignmentMap, seenIdents),
          };
        }
        throw `Unknown type: ${JSON.stringify(term)}`;
      }),
    })),
  };
}

