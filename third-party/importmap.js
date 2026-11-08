(() => {
  const baseUrl = new URL('.', document.currentScript.src);
  const imports = {
    'hex-lines': `${baseUrl}hex-lines/src/hex-lines.js`,
    'hex-game': `${baseUrl}hex-game/src/hex-game.js`,
    'ga': `${baseUrl}ga/src/index.js`,
  };
  const importMap = document.createElement('script');
  importMap.type = 'importmap';
  importMap.textContent = JSON.stringify({imports});
  document.currentScript.after(importMap);
})();
