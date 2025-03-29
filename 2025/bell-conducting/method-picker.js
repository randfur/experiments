export function renderMethodPicker(model, rerender) {
  const select = document.createElement('select');
  const methodEntries = Object.entries(model.methods).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [name, method] of methodEntries) {
    const option = document.createElement('option');
    option.textContent = name;
    if (name === model.selected.methodName) {
      option.selected = true;
    }
    select.append(option);
  }
  select.addEventListener('change', event => {
    model.selected.methodName = select.value;
    const method = model.methods[select.value];
    model.selected.touch = method.touches[0];
    model.selected.bellLine = Math.min(model.selected.bellLine, method.bells);
    rerender();
  });
  return select;
}
