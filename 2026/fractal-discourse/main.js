async function main() {
  const counts = [{
    id: 'view-count',
    value: 0,
    rate: 300,
  }, {
    id: 'comment-count',
    value: 0,
    rate: 5,
  }, {
    id: 'retort-count',
    value: 0,
    rate: 2,
  }, {
    id: 'report-count',
    value: 0,
    rate: 1,
  }];

  let fullSentence = pick([
    'Isn\'t it weird how',
    'Has anyone noticed that',
    'It\'s ridiculous that',
    'It\'s obvious that',
    'Addressing the allegation that',
    'When will people finally see that',
    'So why do',
  ]);
  let inProgressSentence = '';

  while (true) {
    await new Promise(requestAnimationFrame);

    for (const count of counts) {
      count.value += Math.random() * count.rate;
      getElement(count.id).textContent = shortenNumber(Math.floor(count.value));
    }

    getElement('timestamp').textContent = Date();

    if (inProgressSentence.length >= fullSentence.length) {
      fullSentence += ' ' + generatePhrase();
    } else {
      repeat(Math.random() * 1.5, () => {
        if (inProgressSentence.length < fullSentence.length) {
          inProgressSentence += fullSentence[inProgressSentence.length]
        }
      });
    }
    getElement('post-body').textContent = inProgressSentence;
  }
}

function getElement(id) {
  return document.getElementById(id);
}

function shortenNumber(value) {
  if (value < 1000) {
    return value;
  }
  if (value < 1000000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return (value / 1000000).toFixed(1) + 'M';
}

function repeat(n, f) {
  for (let i = 0; i < n; ++i) {
    f();
  }
}

const phrases = [
  'you accept the fact that',
  'you assume that',
  'you assume the worst when',
  'you avoid accountability for how',
  'you avoid admitting that',
  'you avoid the fact that',
  'you avoid thinking about how',
  'you blame others when',
  'you can\'t accept when',
  'you can\'t believe that',
  'you cling to the belief that',
  'you conveniently forget that',
  'you deflect when',
  'you dismiss concerns about how',
  'you dismiss the idea that',
  'you don\'t feel that',
  'you don\'t like when',
  'you double down on the idea that',
  'you doubt that',
  'you exaggerate how',
  'you expect that',
  'you focus on how',
  'you frame them as the victim when',
  'you get defensive when',
  'you have a tendency to believe',
  'you have it twisted like',
  'you haven\'t considered how',
  'you haven\'t considered why',
  'you hesitate when',
  'you ignore the fact that',
  'you implied that',
  'you insist on being right rather than see',
  'you insist that',
  'you invalidate how',
  'you keep insisting that',
  'you make excuses for when',
  'you make excuses for why',
  'you minimize how',
  'you misjudge how',
  'you misrepresent how',
  'you never notice that',
  'you often feel that',
  'you overlook how',
  'you overreact when',
  'you pretend not to notice how',
  'you question whether',
  'you rationalise away how',
  'you react as if',
  'you reflect on how',
  'you refuse to acknowledge that',
  'you refuse to take responsibility when',
  'you said that',
  'you see how',
  'you shut down when',
  'you struggle with how',
  'you talk about how',
  'you talk around the issue that',
  'you tell them that',
  'you tend to think that',
  'you think that',
  'you thought that',
  'you undermine their argument that',
  'you weaponize the idea that',
  'you weren\'t aware that',
  'you wonder whether',
  'you worry about how',
  'you would contradict them when',
  'you\'re afraid that',
  'you\'re concerned that',
  'you\'re in denial about how',
  'you\'re never sure whether',
  'you\'re sensitive to how',
  'you\'re traumatized by the fact that',
  'you\'re uncomfortable when',
  'you\'re unwilling to accept that',
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function titleCase(string) {
  return string.substring(0, 1).toUpperCase() + string.substring(1);
}

function generatePhrase() {
  const phrase = pick(phrases);
  if (/you were/.test(phrase)) {
    return phrase.replace(
      'you were',
      pick([
        'I was',
        'you were',
        'they were',
      ]),
    );
  }
  if (/you are/.test(phrase)) {
    return phrase.replace(
      'you are',
      pick([
        'I am',
        'you are',
        'they are',
      ]),
    );
  }
  if (/you\'re/.test(phrase)) {
    return phrase.replace(
      'you\'re',
      pick([
        'I\'m',
        'you\'re',
        'they\'re',
      ]),
    );
  }
  return phrase.replace(
    'you',
    pick([
      'I',
      'you',
      'they',
    ]),
  );
}

main();