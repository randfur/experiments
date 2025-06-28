const factorioDag = {
  coal: [],  
  stone: [],
  ironOre: [],
  copperOre: [],
  oil: [],
  iron: ['ironOre', 'coal'],  
  copper: ['copperOre', 'coal'],  
  gear: ['iron'],  
  redScience: ['copper', 'gear'],
  transportBelt: ['iron', 'gear'],  
  copperCable: ['copper'],
  greenCircuit: ['copperCable', 'iron'],
  inserter: ['greenCircuit', 'gear', 'iron'],
  greenScience: ['inserter', 'transportBelt'],
  grenade: ['coal', 'iron'],
  bullets: ['iron'],
  steel: ['iron'],
  piercingBullets: ['copper', 'bullets', 'steel'],
  stoneBrick: ['coal', 'stone'],
  wall: ['stoneBrick'],
  blackScience: ['grenade', 'piercingBullets', 'wall'],
  petroleumGas: ['oil'],
  water: [],
  sulfur: ['petroleumGas', 'water'],
  pipe: ['iron'],
  engine: ['gear', 'pipe', 'steel'],
  redCircuit: ['greenCircuit', 'copperCable', 'plastic'],
  plastic: ['coal', 'petroleumGas'],
  blueScience: ['redCircuit', 'engine', 'sulfur'],
  ironStick: ['iron'],
  rail: ['ironStick', 'steel', 'stone'],
  productivityModule: ['redCircuit', 'greenCircuit'],
  electricFurnace: ['redCircuit', 'steel', 'stoneBrick'],
  purpleScience: ['electricFurnace', 'productivityModule', 'rail'],
  heavyOil: [],
  blueCircuit: ['redCircuit', 'greenCircuit', 'sulfuricAcid'],
  sulfuricAcid: ['sulfur', 'iron', 'water'],
  lowDensityStructure: ['copper', 'plastic', 'steel'],
  lubricant: ['heavyOil'],
  electricEngine: ['engine', 'lubricant', 'greenCircuit'],
  battery: ['copper', 'iron', 'sulfuricAcid'],
  flyingRobotFrame: ['battery', 'electricEngine', 'greenCircuit', 'steel'],
  yellowScience: ['flyingRobotFrame', 'lowDensityStructure', 'blueCircuit'],
};

function buildDagRows(dag) {
  const itemRow = {};
  let maxRow = 0;
  
  function ensureItemRow(item) {
    if (item in itemRow) {
      return;
    }
    
    const dependencies = dag[item];
    if (dependencies.length === 0) {
      itemRow[item] = 0;
      return;
    }

    let row = 1;
    for (const dependency of dependencies) {
      ensureItemRow(dependency);
      row = Math.max(row, itemRow[dependency] + 1);
    }
    itemRow[item] = row;
    maxRow = Math.max(maxRow, row);
  }

  for (let item in dag) {
    ensureItemRow(item);
  }
  
  const rows = [];
  for (let i = 0; i <= maxRow; ++i) {
    rows.push([]);
  }
  
  for (const item in itemRow) {
    rows[itemRow[item]].push(item);
  }
  
  return {itemRow, rows};
}

function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [i, list[i]];
  }
}

function main() {
  const {itemRow, rows} = buildDagRows(factorioDag);
  const columns = rows.flat();

  const canvas = document.getElementById('canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  
  function columnX(columnIndex) {
    return 10 + columnIndex * 50;
  }
  
  for (const [i, item] of enumerate(columns)) {
    const x = columnX(i);
    const y = 10 + i * 20;
    context.fillStyle = 'white';
    context.fillText(item, x - item.length * 2, y - 4);
    context.fillStyle = 'grey';
    context.fillRect(x, y, 2, height - y);
    for (const dependency of factorioDag[item]) {
      const dependencyColumn = columns.indexOf(dependency);
      const dependencyX = columnX(dependencyColumn);
      context.fillStyle = 'grey';
      context.fillRect(dependencyX, y, x - dependencyX, 1);
      context.fillStyle = 'white';
      context.fillRect(dependencyX - 2, y - 2, 6, 5);
    }
  }
}
main();