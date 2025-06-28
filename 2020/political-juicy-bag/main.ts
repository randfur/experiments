import { json, maybeJson, fromJson, toJson } from './json';
import { snek2, Project } from './nsek';

class Pokemon {
  @json() name: string;
  @json() lvl: number;
  @json() rare: boolean;
}

class Trainer {
  @json(Pokemon) pokemons: Map<string, Pokemon>;
}

console.log(fromJson(Trainer, {
  pokemons: {
    bark: {
      name: 'woof',
      lvl: 45,
      rare: true,
    }
  },
}));

const parseProject = fromJson(Project, snek2);
console.log(parseProject);
if (parseProject.ok) {
  console.log(toJson(parseProject.value));
}
