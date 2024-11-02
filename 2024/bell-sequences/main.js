function main() {
  const stage = 5;
  const placeNotation = [
    [3],
    [1,4,5],
    [1,2,5],
  ];
  const {placesSequence, error} = compilePlaceNotation(placeNotation, stage);
  if (error) {
    document.body.append(document.createTextNode(error));
  }
  const seenOrders = new Set();

  const orderHistory = [];
  const order = range(stage).map(i => i + 1);
  let placesSequenceIndex = 0;
  let firstRounds = true;
  const roundsOrderCode = getOrderCode(order);
  while (true) {
    const orderCode = getOrderCode(order);

    if (firstRounds) {
      firstRounds = false;
    } else if (orderCode === roundsOrderCode) {
      break;
    }

    orderHistory.push(order.slice());
    seenOrders.add(orderCode);
    permuteOrder(order, placesSequence[placesSequenceIndex]);
    placesSequenceIndex = (placesSequenceIndex + 1) % placesSequence.length;
  }

  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: monospace;
      line-height: 100%;
      font-size: 150%;
      white-space: pre;
    }
    .blueLine {
      background: blue;
    }
  `;
  document.head.append(style);
  const methodDiv = document.createElement('div');
  for (const {i, value: order} of enumerate(orderHistory)) {
    const rowDiv = document.createElement('div');
    rowDiv.append(document.createTextNode(i.toString().padStart(3, ' ') + ']  '));
    for (let highlightBell = 1; highlightBell <= stage; ++highlightBell) {
      for (const bell of order) {
        if (bell === highlightBell) {
          const bellSpan = document.createElement('span');
          bellSpan.classList.toggle('blueLine');
          bellSpan.textContent = bell;
          rowDiv.append(bellSpan);
        } else {
          rowDiv.append(document.createTextNode(bell));
        }
      }
      rowDiv.append(document.createTextNode('  |  '));
    }
    methodDiv.append(rowDiv);
  }
  document.body.append(methodDiv);

  const url = `https://rsw.me.uk/blueline/methods/view?stage=${stage}&notation=${placeNotation.map(places => places.length === 0 ? 'x' : places.join('')).join('.')}`;
  const blueLineLink = document.createElement('a');
  blueLineLink.href = url;
  blueLineLink.textContent = url;
  blueLineLink.target = '_blank';
  document.body.append(blueLineLink);
}

function compilePlaceNotation(placeNotation, stage) {
  const placesSequence = [];
  for (const placePositions of placeNotation) {
    let result = 0;
    for (const placePosition of placePositions) {
      result += 1 << (placePosition - 1);
    }
    placesSequence.push(result);
  }
  return {placesSequence};
}

function placesContains(places, place) {
  return (places & (1 << place)) !== 0;
}

function getOrderCode(order) {
  let result = 0;
  for (let i = 0; i < order.length; ++i) {
    result += order.length ** i * order[i];
  }
  return result;
}

function permuteOrder(order, places) {
  let i = 0;
  while (i < order.length) {
    if (placesContains(places, i)) {
      i += 1;
    } else {
      [order[i], order[i + 1]] = [order[i + 1], order[i]];
      i += 2;
    }
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield {i, value: list[i]};
  }
}

main();