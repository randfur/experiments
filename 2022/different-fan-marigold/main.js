function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function swapBells(bellOrder, holdPositions) {
  let nextHoldPositionIndex = 0;
  const bellCount = bellOrder.length;
  for (let position = 1; position <= bellCount - 1; ++position) {
    let shouldSwap = true;
    if (nextHoldPositionIndex < holdPositions.length) {
      const nextHoldPosition = holdPositions[nextHoldPositionIndex];
      if (position === nextHoldPosition) {
        ++nextHoldPositionIndex;
        shouldSwap = false;
      } else if (position + 1 === nextHoldPosition) {
        shouldSwap = false;
      }
    }
    if (shouldSwap) {
      [
        bellOrder[position - 1],
        bellOrder[position],
      ] = [
        bellOrder[position],
        bellOrder[position - 1],
      ];
      ++position;
    }
  }
}

function isRounds(bellOrder) {
  for (let i = 0; i < bellOrder.length - 1; ++i) {
    if (bellOrder[i] > bellOrder[i + 1]) {
      return false;
    }
  }
  return true;
}

class Method {
  constructor(bellCount) {
    this.bellCount = bellCount;
  }

  *holdPositionsSequence() {
    throw 'Not implemented';
  }

  *bellOrders() {
    const bellOrder = range(this.bellCount).map(i => i + 1);
    for (const holdPositions of this.holdPositionsSequence()) {
      yield [...bellOrder];
      swapBells(bellOrder, holdPositions);
    }
  }

  *bellOrdersBackToRounds() {
    const sequence = this.bellOrders();
    yield sequence.next().value;
    while (true) {
      const bellOrder = sequence.next().value;
      yield bellOrder;
      if (isRounds(bellOrder)) {
        return;
      }
    }
  }
}

class PlainHunt extends Method {
  constructor(bellCount) {
    super(bellCount);
  }

  *holdPositionsSequence() {
    const evenNumberOfBells = this.bellCount % 2 === 0;
    while (true) {
      if (evenNumberOfBells) {
        yield [];
        yield [1, this.bellCount];
      } else {
        yield [this.bellCount];
        yield [1];
      }
    }
  }
}

function main() {
  for (const bellOrder of new PlainHunt(6).bellOrdersBackToRounds()) {
    console.log(bellOrder);
    output.textContent += bellOrder.join(' ') + '\n';
  }
}

main();