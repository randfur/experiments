async function* chatStream(messages) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3',
      messages,
    }),
  });

  let total = '';
  for await (const value of response.body) {
    const raw = new TextDecoder().decode(value);
    total += JSON.parse(raw).message.content;
    yield total;
  }
}

function nextEvent(target, eventName, predicate) {
  return new Promise(resolve => {
    const handler = event => {
      if (!predicate || predicate(event)) {
        resolve(event);
        target.removeEventListener(eventName, handler);
      }
    }
    target.addEventListener(eventName, handler);
  });
}

function renderMessages(messages, log) {
  log.textContent = JSON.stringify(messages, null, '  ');
}

async function main() {
  const log = document.createElement('div');
  log.style.whiteSpace = 'pre-wrap';
  log.style.fontFamily = 'monospace';

  const input = document.createElement('input');
  input.type = 'text';
  input.style.backgroundColor = 'black';
  input.style.color = 'currentColor';

  document.body.append(log, input);
  document.body.style.backgroundColor = 'black';
  document.body.style.color = '#18a';

  let messages = [];
  while (true) {
    await nextEvent(input, 'keypress', event => event.code === 'Enter');
    messages.push({
      role: 'user',
      content: input.value,
    });
    input.value = '';
    const responseStream = chatStream(messages);
    const responseMessage = {
      role: 'assistant',
      content: '',
    };
    messages.push(responseMessage);
    for await (const content of responseStream) {
      responseMessage.content = content;
      renderMessages(messages, log);
    }
  }
}

main();