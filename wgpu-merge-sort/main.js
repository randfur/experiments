async function main() {
  console.log('Sanity check.');
  const input = createRandomList(80);
  console.log(input);
  console.log(await wgpuSort(input));
  console.log(await cpuSort(input));


  console.log('Perf test.');
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

  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 400;
  canvas.style.border = 'solid';
  document.body.append(canvas);
  const context = canvas.getContext('2d');

  const variants = [{
    sort: cpuSort,
    colour: 'blue',
    results: [],
  }, {
    sort: wgpuSort,
    colour: 'orange',
    results: [],
  }];

  for (let i = 0; i < variants.length; ++i) {
    const {sort, colour} = variants[i];
    context.fillStyle = colour;
    context.fillText(sort.name, 0, 10 + i * 10);
  }

  let n = 1_000;
  const nMax = 10_000_000;
  const yScale = 1 / 20;
  const barWidth = 4;
  while (n <= nMax) {
    console.log('Array length:', n);
    await new Promise(requestAnimationFrame);

    const input = createRandomList(n);
    for (let i = 0; i < variants.length; ++i) {
      const {sort, colour, results} = variants[i];
      const startTime = performance.now();
      let output = sort(input);
      if (output instanceof Promise) {
        output = await output;
      }
      const endTime = performance.now();

      let delta = endTime - startTime;
      if (output.length !== n || !isSorted(output)) {
        delta = 0;
      }

      console.log(sort.name, delta);

      context.fillStyle = colour;
      context.fillRect(
        n / nMax * canvas.width + i * barWidth,
        canvas.height - 1 - delta * yScale,
        barWidth,
        canvas.height);
    }

    n = Math.ceil(n * 1.5);
  }
  console.log('Done');
}

function isSorted(array) {
  for (let i = 1; i < array.length; ++i) {
    if (array[i - 1] > array[i]) {
      return false;
    }
  }
  return true;
}

function createRandomList(n) {
  return Array(n).fill(0).map(() => Math.round(100 * Math.random()));
}

function cpuSort(input) {
  return input.slice().sort((a, b) => a - b);
}

async function wgpuSort(input) {
  console.log('wgpuSort:', 'start');
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const bufferUniforms = device.createBuffer({
    size: 2 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bufferA = device.createBuffer({
    size: input.length * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    mappedAtCreation: true,
  });
  new Float32Array(bufferA.getMappedRange()).set(input);
  bufferA.unmap();
  console.log('wgpuSort:', 'write data');

  const bufferB = device.createBuffer({
    size: input.length * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const bufferOut = device.createBuffer({
    size: input.length * 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const workgroupSize = 64;
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({
        code: `
          struct Uniforms {
            mergeWidth: u32,
            length: u32,
          }

          @group(0) @binding(0) var<uniform> uniforms: Uniforms;
          @group(0) @binding(1) var<storage, read> input: array<f32>;
          @group(0) @binding(2) var<storage, read_write> output: array<f32>;

          @compute @workgroup_size(${workgroupSize}) fn main(@builtin(global_invocation_id) id: vec3<u32>) {
            var left = id.x * uniforms.mergeWidth * 2;
            let leftEnd = left + uniforms.mergeWidth;
            var right = leftEnd;
            let rightEnd = right + uniforms.mergeWidth;
            var out = left;

            while (
              left < uniforms.length &&
              left < leftEnd &&
              right < uniforms.length &&
              right < rightEnd) {

              let leftValue = input[left];
              let rightValue = input[right];

              if (leftValue < rightValue) {
                output[out] = leftValue;
                left += 1;
              } else {
                output[out] = rightValue;
                right += 1;
              }
              out += 1;
            }

            while (left < uniforms.length && left < leftEnd) {
              output[out] = input[left];
              left += 1;
              out += 1;
            }

            while (right < uniforms.length && right < rightEnd) {
              output[out] = input[right];
              right += 1;
              out += 1;
            }
          }
        `,
      }),
      entryPoint: 'main',
    },
  });

  const bindGroupAToB = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: {
        buffer: bufferUniforms,
      },
    }, {
      binding: 1,
      resource: {
        buffer: bufferA,
      },
    }, {
      binding: 2,
      resource: {
        buffer: bufferB,
      },
    }],
  });

  const bindGroupBToA = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: {
        buffer: bufferUniforms,
      },
    }, {
      binding: 1,
      resource: {
        buffer: bufferB,
      },
    }, {
      binding: 2,
      resource: {
        buffer: bufferA,
      },
    }],
  });

  console.log('wgpuSort:', 'created buffers');
  let mergeWidth = 1;
  let inputBuffer = bufferB;
  let outputBuffer = bufferA;
  while (mergeWidth < input.length) {
    [inputBuffer, outputBuffer] = [outputBuffer, inputBuffer];
    device.queue.writeBuffer(bufferUniforms, 0, new Uint32Array([mergeWidth, input.length]));
    const commandEncoder = device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, inputBuffer === bufferA ? bindGroupAToB : bindGroupBToA);
    const workgroups = Math.ceil(input.length / (2 * mergeWidth) / workgroupSize);
    computePass.dispatchWorkgroups(workgroups);
    computePass.end();
    device.queue.submit([commandEncoder.finish()]);
    mergeWidth *= 2;
  }
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(outputBuffer, 0, bufferOut, 0, input.length * 4);
  device.queue.submit([commandEncoder.finish()]);
  console.log('wgpuSort:', 'awaiting queue work');
  await device.queue.onSubmittedWorkDone();
  console.log('wgpuSort:', 'queue work done');

  await bufferOut.mapAsync(GPUMapMode.READ);
  const result = new Float32Array(bufferOut.getMappedRange().slice());

  device.destroy();
  console.log('wgpuSort:', 'returning');

  return Array.from(result);
}

main();