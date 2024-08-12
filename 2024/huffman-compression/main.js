let lastHuffmanTree = null;

function main() {
  compressButton.addEventListener('click', () => {
    const compressed = compress(inputText.value);
    compressedBinary.value = compressed.binary;
    lastHuffmanTree = compressed.tree;
  });
  decompressButton.addEventListener('click', () => {
    decompressedText.value = decompress(compress(inputText.value));
  });

  inputText.value = 'pants and dog';
}

function compress(text) {
  // - Count every character's frequency.
  // - Make every character a single node tree with the frequency as the weight.
  // - Put all trees into a priority queue biased by weight, smaller is more front.
  // - While queue size > 1:
  //   - Join front two trees in queue with the weight summed together and put back in queue.
  // - Huffman tree built.
  // - Use tree to create encoding table.
  //   - For each leaf, use the left/right traversal path as its encoded code e.g. left left right left is 0010.
  // - Rewrite entire original text in terms of these codes.
  // - Store tree next to encoded text.

  const frequencyMap = {};
  for (const c of text) {
    if (!(c in frequencyMap)) {
      frequencyMap[c] = 0;
    }
    frequencyMap[c]++;
  }

  const queue = Object.entries(frequencyMap).map(([c, count]) => ({
    tree: {
      value: c,
      left: null,
      right: null,
    },
    weight: count,
  }));

  while (queue.length > 1) {
    queue.sort((a, b) => a.weight - b.weight);
    const [a, b] = queue.splice(0, 2);
    queue.push({
      weight: a.weight + b.weight,
      tree: {
        value: null,
        left: a.tree,
        right: b.tree,
      },
    });
  }

  const tree = queue[0].tree;

  const encodingMap = {};
  function buildEncodingMap(node, currentCode) {
    if (node.value !== null) {
      encodingMap[node.value] = currentCode;
      return;
    }
    buildEncodingMap(node.left, currentCode + '0');
    buildEncodingMap(node.right, currentCode + '1');
  }
  buildEncodingMap(tree, '');

  return {
    binary: Array.from(text).map(c => encodingMap[c]).join(''),
    tree,
  };
}

function decompress({binary, tree}) {
  // - Read bits one by one and use them to traverse the huffman tree.
  // - Once you hit a leaf node use that character as the next character of the decompressed output.
  // - Repeat until done.
  let output = '';
  let currentNode = tree;
  for (const b of binary) {
    currentNode = b === '0' ? currentNode.left : currentNode.right;
    if (currentNode.value !== null) {
      output += currentNode.value;
      currentNode = tree;
    }
  }
  return output;
}

main();
