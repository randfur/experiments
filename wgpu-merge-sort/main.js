import {PerfTest} from './perf-test.js';
import {wgpuSort} from './wgpu.js';

async function main() {
  const perfTest = new PerfTest([
    function cpuSort(input, perfResult) {
      const copy = input.slice();
      perfResult.measure('cyan');
      copy.sort((a, b) => a - b);
      perfResult.measure('blue');
    },
    wgpuSort,
  ]);

  perfTest.run({
    start: 10,
    growth: 1.5,
    max: 10_000_000,
  });
}

main();