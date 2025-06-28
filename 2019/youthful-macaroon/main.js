import init from './init.js';

let {data, program, gl, transformObj} = init();

gl.enable(gl.DEPTH_TEST)


function drawFrame() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.uniform1f(gl.getUniformLocation(program, 'translateX'), transformObj.translatePos.x);
  gl.uniform1f(gl.getUniformLocation(program, 'translateY'), transformObj.translatePos.y);
  gl.uniform1f(gl.getUniformLocation(program, 'rotateY'), transformObj.rotateY);
  gl.uniform1f(gl.getUniformLocation(program, 'lightness'), 1);
  gl.drawArrays(gl.TRIANGLES, 0, data.length / 2);
  gl.uniform1f(gl.getUniformLocation(program, 'lightness'), 0);
  gl.drawArrays(gl.LINES, 0, data.length / 2);
  window.requestAnimationFrame(drawFrame);
}

drawFrame();



console.log('All good.');