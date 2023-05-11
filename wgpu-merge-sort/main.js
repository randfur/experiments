async function main() {
  const input = createRandomList(10);
  console.log(await wgpuSort(input));
  return;



  const canvas = document.createElement('canvas');
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

  let n = 1_000;
  const nMax = 1_000;//_000;
  const yScale = 1 / 4;
  while (n <= nMax) {
    console.log(n);
    await new Promise(requestAnimationFrame);

    const input = createRandomList(n);
    for (const {sort, colour, results} of variants) {
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
      context.fillRect(n / nMax * canvas.width, canvas.height - 1 - delta * yScale, 4, 4);
    }

    n = Math.ceil(n * 1.5);
  }
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
  return Array(n).fill(0).map(() => Math.random());
}

function cpuSort(input) {
  return input.slice().sort((a, b) => a - b);
}

async function wgpuSort(input) {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const bufferA = device.createBuffer({
    size: input.length * 4,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Float32Array(bufferA.getMappedRange()).set(input);
  bufferA.unmap();

  const bufferB = device.createBuffer({
    size: input.length * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({
        code: `
          // @group(0) @binding(0) var<uniform> level: u32;
          @group(0) @binding(1) var<storage, read> input: array<f32>;
          @group(0) @binding(2) var<storage, read_write> output: array<f32>;

          @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3<u32>) {
            let i = id.x;
            output[i] = input[i];
          }
        `,
      }),
      entryPoint: 'main',
    },
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
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

  const commandEncoder = device.createCommandEncoder();
  const computePass = commandEncoder.beginComputePass();
  computePass.setPipeline(pipeline);
  computePass.setBindGroup(0, bindGroup);
  await device.queue.submit([commandEncoder.finish()]);

  await bufferB.mapAsync(GPUMapMode.READ);

  const result = new Float32Array(bufferB.getMappedRange().slice());

  device.destroy();

  return result;
}

main();