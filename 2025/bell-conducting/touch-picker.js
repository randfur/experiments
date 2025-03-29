export function renderTouchPicker(model, rerender) {
  const select = document.createElement('select');
  const method = model.methods[model.selected.methodName];
  for (const touch of method.touches) {
    const option = document.createElement('option');
    option.textContent = touch;
    if (name === model.selected.touch) {
      option.selected = true;
    }
    select.append(option);
  }
  select.addEventListener('change', event => {
    model.selected.touch = select.value;
    rerender();
  });
  return select;
}
