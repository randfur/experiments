export function injectStyles(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}