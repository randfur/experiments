const maxCellValue = 9;

function main() {
  let numbers = [
    [0, 1, 0, 1, 1, 2],
    [1, 2, 1, 0, 0, 0],
    [4, 0, 1, 6, 1, 8],
    [1, 0, 4, 1, 0, 0],
    [0, 2, 0, 0, 9, 1],
    [0, 1, 2, 1, 1, 1],
  ];

  const runCount = 10000;

  print('heavy time: ' + time(() => {
    for (let i = 0; i < runCount; ++i) {
      numbers = heavyRadixSort(numbers);
    }
  }));

  print('swap time: ' + time(() => {
    for (let i = 0; i < runCount; ++i) {
      numbers = swapRadixSort(numbers);
    }
  }));

  for (const number of numbers) {
    print(number.join(' '));
  }
}

function time(f) {
  const startTime = performance.now();
  f();
  const endTime = performance.now();
  return endTime - startTime;
}

function swapRadixSort(numbers) {
  let numbersA = Array.from(numbers);
  let numbersB = Array.from(numbers);

  const columnCount = numbers[0].length;
  for (let columnIndex = columnCount - 1; columnIndex >= 0; --columnIndex) {
    let destinationIndex = 0;
    for (let findValue = 0; findValue <= maxCellValue; ++findValue) {
      for (const number of numbersA) {
        if (number[columnIndex] === findValue) {
          numbersB[destinationIndex++] = number;
        }
      }
    }
    [numbersA, numbersB] = [numbersB, numbersA];
  }

  return numbersA;
}

function heavyRadixSort(numbers) {
  const columnCount = numbers[0].length;
  for (let columnIndex = columnCount - 1; columnIndex >= 0; --columnIndex) {
    const partitions = [];
    for (let i = 0; i <= maxCellValue; ++i) {
      partitions.push([]);
    }

    for (const number of numbers) {
      partitions[number[columnIndex]].push(number);
    }

    numbers = [].concat(...partitions);
  }

  return numbers;
}

function print(text) {
  output.textContent += text + '\n';
}

main();