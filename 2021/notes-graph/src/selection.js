export const selectedNodes = new Set();

export function areSelected(nodeSet) {
  for (const node of nodeSet) {
    if (!selectedNodes.has(node)) {
      return false;
    }
  }
  return true;
}

export function selectNodes(nodeSet) {
  for (const node of nodeSet) {
    selectedNodes.add(node);
  }
}

export function unselectNodes(nodeSet) {
  for (const node of nodeSet) {
    selectedNodes.delete(node);
  }
}