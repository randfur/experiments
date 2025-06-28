export const TAU = Math.PI * 2;

export function assertTrue(condition, test) {
  if (!condition) {
    output.textContent += `Test failed: ${test}\n`;
  }
}