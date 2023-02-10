async function main() {
  let model = makeObservable({
    dog: [
      { bark: 1 },
      { bark: 2 },
      { bark: 3 },
    ],
    cow: 'moo',
  });


  reRenderScope(() => {
  });
}

window.addEventListener('DOMContentLoaded', main);