async function main() {
  // Generate inputs.

  // Set up DOM.
  document.body.style.backgroundColor = 'black';
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  const context = canvas.getContext('webgpu');

  // Set up WebGPU.
  // - Create compute pipeline.
  // - Create render pipeline.
  // - Set up buffers from inputs.
  // - Create bind groups.
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  window.device = device;
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const pipeline = device.createComputePipeline();


  // Render frames from input in loop.
}

main();