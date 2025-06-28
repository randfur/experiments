importScripts('https://randfur.github.io/typescript-service-worker/sw-ts-compiler.js');

const tsCompiler = new TsCompiler();

addEventListener('fetch', event => tsCompiler.handleFetch(event));