export class TestSuite {
  constructor() {
    this.errors = [];
  }

  tearDown() {}
  
  addError(error) {
    // Set a breakpoint here in your debugger to debug test failures.
    this.errors.push(error);
  }
  
  assertEqual(x, y) {
    if (x !== y) {
      this.addError(Error(`Expected "${x}" to equal "${y}"`));
      return false;
    }
    return true;
  }
  
  assertTrue(x) {
    if (!x) {
      this.addError(Error(`Expected "${x}" to be truthy`));
      return false;
    }
    return true;
  }
  
  assertLambda(f) {
    if (!f()) {
      this.addError(Error(`Expected "${f}" to evaluate truthy`));
      return false;
    }
    return true;
  }
  
  fail(message) {
    this.addError(Error(message));
    return false;
  }
}

export async function runTests(suites, container) {
  addCss();

  const passes = {};
  const failures = {};
  
  const scheduleRender = createScheduler(() => render(passes, failures, container));
  await runSuites(suites, passes, failures, scheduleRender);

  logResults(passes, failures);
}

function addCss() {
  const style = document.createElement('style');
  style.textContent = `
.results {
  padding: 20px;
  background-color: black;
  color: white;
  font-family: monospace;
  font-size: 13px;
}
h1 {
  margin-top: 0px;
  color: white;
}
.fail {
  color: red;
}
.pass {
  color: lime;
}
.suite {
  margin-left: 1em;
}
.test {
  margin-left: 2em;
}
.error {
  margin: 0;
  margin-left: 3em;
  color: #999;
}
`;
  document.head.appendChild(style);
}

function createScheduler(task) {
  let scheduled = false;
  return function scheduleTask() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        task();
      });
    }
  }
}

async function runSuites(suites, passes, failures, scheduleRender) {
  for (const suite of suites) {
    for (const testName of Object.getOwnPropertyNames(suite.prototype)) {
      if (!testName.startsWith('test')) {
        continue;
      }

      const test = new suite();
      try {
        await (test)[testName]();
      } catch (error) {
        test.errors.push(error);
      }
      test.tearDown();

      if (test.errors.length > 0) {
        if (!(suite.name in failures)) {
          failures[suite.name] = {};
        }
        failures[suite.name][testName] = test.errors;
      } else {
        if (!(suite.name in passes)) {
          passes[suite.name] = [];
        }
        passes[suite.name].push(testName);
      }
      scheduleRender();
    }
  }
}

function countPasses(passes) {
  let count = 0;
  for (const tests of Object.values(passes)) {
    count += tests.length;
  }
  return count;
}

function countFailures(failures) {
  let count = 0;
  for (const testErrors of Object.values(failures)) {
    count += Object.values(testErrors).length;
  }
  return count;
}

function createElement(tag, classNames, text, children) {
  const element = document.createElement(tag);
  if (classNames) {
    for (const className of classNames) {
      element.classList.add(className);
    }
  }
  if (text) {
    element.textContent = text;
  }
  if (children) {
    for (const child of children) {
      element.appendChild(child);
    }
  }
  return element;
}

function render(passes, failures, container) {
  container.textContent = '';
  const results = createElement('div', ['results'], null, [
    createElement('h1', null, 'Test results', null),
    createElement('h2', ['fail'], `Failures (${countFailures(failures)})`, null),
    ...Object.entries(failures).map(([suite, testErrors]) => {
      return createElement('div', ['suite', 'fail'], suite, [
        ...Object.entries(testErrors).map(([test, errors]) => { 
          return createElement('div', ['test'], test, [
            ...errors.map(error => createElement('pre', ['error'], error.stack || null, null)),
          ]);
        }),
      ]);
    }),
    createElement('h2', ['pass'], `Passes (${countPasses(passes)})`, null),
    ...Object.entries(passes).map(([suite, tests]) => {
      return createElement('div', ['suite', 'pass'], suite, [
        ...tests.map(test => createElement('div', ['test'], test, null)),
      ]);
    }),
  ]);
  container.appendChild(results);
}

function logResults(passes, failures) {
  console.log('Test results:');
  
  console.log(`Passes (${countPasses(passes)}):`, passes);
  for (const [suite, tests] of Object.entries(passes)) {
    console.log('  ' + suite);
    for (const test of tests) {
      console.log('    ' + test);
    }
  }

  console.log(`Failures (${countFailures(failures)}):`, failures);
  for (const [suite, testErrors] of Object.entries(failures)) {
    console.log('  ' + suite);
    for (const [test, errors] of Object.entries(testErrors)) {
      console.log('    ' + test);
      for (const failure of errors) {
        console.log('      ' + failure.stack);
      }
    }
  }
}