// Connects a set of objects together by a common set of names and initialises them.
export function bundleBundle(bundle) {
  for (const value of Object.values(bundle)) {
    value.bundle = bundle;
  }
  for (const value of Object.values(bundle)) {
    value.bundleInit?.();
  }
  return bundle;
}