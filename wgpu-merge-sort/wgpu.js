export async function wgpuSort(input, perfResult) {
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

  perfResult.measure('#800');

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

  perfResult.measure('#a00');

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

  perfResult.measure('#f00');

  await device.queue.onSubmittedWorkDone();

  perfResult.measure('#fa0');

  await bufferOut.mapAsync(GPUMapMode.READ);
  const result = Array.from(new Float32Array(bufferOut.getMappedRange().slice()));
  device.destroy();

  perfResult.measure('#f00');
}

// TODO: Use, plumb failures through perfResult.
function isSorted(originalArray, sortedArray) {
  if (originalArray.length !== sortedArray.length) {
    return false;
  }
  for (let i = 1; i < sortedArray.length; ++i) {
    if (sortedArray[i - 1] > sortedArray[i]) {
      return false;
    }
  }
  return true;
}


