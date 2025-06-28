importScripts('https://randfur.github.io/typescript-service-worker/sw-ts-compiler.js');
//importScripts('sw-ts-compiler.js');

const tsCompiler = new TsCompiler({verbose: 2});

addEventListener('fetch', event => tsCompiler.handleFetch(event));
