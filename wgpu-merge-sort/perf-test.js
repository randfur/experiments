export class PerfTest {
  constructor(variants) {
    this.variants = variants;

    (async () => {
      const ticker = document.createElement('pre');
      document.body.append(ticker);
      let count = 0;
      while (true) {
        await new Promise(requestAnimationFrame);
        count = (count + 1) % 4;
        ticker.textContent = 'Main thread liveliness: ' + '.'.repeat(count);
      }
    })();

    this.canvas = document.createElement('canvas');
    this.canvas.style.border = 'solid';
    this.canvas.width = innerWidth * 0.9;
    this.canvas.height = innerHeight * 0.8;
    this.context = this.canvas.getContext('2d');
    document.body.append(this.canvas);

    this.nResultss = [];
  }

  // TODO: Get output from functions again.
  // sanityCheck() {
  //   console.log('Sanity check.');
  //   const input = createRandomList(80);
  //   console.log('Input:', input);
  //   let passed = true;
  //   for (const {sort} of this.variants) {
  //     const sortedArray = await sort(input);
  //     console.log(sort.name, sortedArray);
  //     passed &= isSorted(input, sortedArray);
  //   }
  //   return passed;
  // }

  async run({start, growth, max}) {
    console.log('Run');

    let n = start;
    while (n <= max) {
      console.log('Array length:', n);
      await new Promise(requestAnimationFrame);

      const input = createRandomList(n);
      const nResults = {
        n,
        results: [],
      };
      this.nResultss.push(nResults);
      for (const variant of this.variants) {
        const result = new PerfResult(this);
        nResults.results.push(result);
        await variant(input, result);
        console.log(variant.name, result?.total);
      }
      n = Math.ceil(n * growth);
    }
    console.log('Done');
  }

  renderResults() {
    console.log(this.nResultss);
    // TODO: Figure out colours now.
    // for (let i = 0; i < variants.length; ++i) {
    //   const {sort, colour} = variants[i];
    //   context.fillStyle = colour;
    //   context.fillText(sort.name, 0, 10 + i * 10);
    // }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const maxN = maxOf(function*() {
      for (const {n} of this.nResultss) {
        yield n;
      }
    }.call(this));

    const maxTotal = maxOf(function*() {
      for (const {results} of this.nResultss) {
        for (const result of results) {
          yield result.total;
        }
      }
    }.call(this));

    const barWidth = 6;
    const padding = 20;
    const nScale = (this.canvas.width - this.variants.length * barWidth - padding) / maxN;
    const deltaScale = (this.canvas.height - padding) / maxTotal;
    for (const {n, results} of this.nResultss) {
      for (let i = 0; i < results.length; ++i) {
        const x = n * nScale + i * barWidth;
        let y = this.canvas.height;
        const result = results[i];
        for (const {colour, delta} of result.measurements) {
          this.context.fillStyle = colour;
          const height = delta * deltaScale;
          this.context.fillRect(x, y - height, barWidth, height);
          y -= height;
        }
      }
    }
  }
}

function createRandomList(n) {
  return Array(n).fill(0).map(() => Math.round(100 * Math.random()));
}

function maxOf(list) {
  let result = -Infinity;
  for (const x of list) {
    result = Math.max(result, x);
  }
  return result;
}

class PerfResult {
  constructor(perfTest) {
    this.perfTest = perfTest;
    this.start = performance.now();
    this.measurements = [];
    this.total = 0;
  }

  measure(colour) {
    const now = performance.now();
    const delta = now - this.start;
    this.start = now;
    this.total += delta;
    this.measurements.push({colour, delta});
    this.perfTest.renderResults();
  }
}