importScripts('https://randfur.github.io/typescript-service-worker/sw-ts-compiler.js');

const tsCompiler = new TsCompiler({verbose: 1});

this.addEventListener('fetch', event => {
  tsCompiler.handleFetch(event);
});