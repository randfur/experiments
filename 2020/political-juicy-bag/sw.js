importScripts('https://randfur.github.io/typescript-service-worker/sw-ts-compiler.js');

const tsCompiler = new TsCompiler({verbose: 0});

addEventListener('fetch', event => tsCompiler.handleFetch(event));
