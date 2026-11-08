(() => {
  const baseUrl = new URL('.', document.currentScript.src);
  const libraries = [
    'hex-lines/',
    'hex-game/',
    'ga/',
  ];
  const importMap = document.createElement('script');
  importMap.type = 'importmap';
  importMap.textContent = JSON.stringify({
    imports: Object.fromEntries(
      libraries.map(library => [library, baseUrl + library])
    ),
  });
  document.currentScript.after(importMap);
})();
