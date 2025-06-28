import {BasicEntity} from 'https://randfur.github.io/async-game-engine/presets/basic-entity.js';
import {random} from 'https://randfur.github.io/async-game-engine/utils/random.js';

const node = {
  a: {},
  b: {},
  c: {},
  d: {},
};

const nodes = [node.a, node.b, node.c, node.d];

Object.assign(node.a, {
  x: 0,
  y: 0,
  next: node.b,
  joinChoices: [
    {
      node: node.b,
      next: node.a,
      disallowedSideJoin: node.a,
    },
    {
      node: node.a,
      next: node.d,
      disallowedSideJoin: node.d,
    },
  ],
});
Object.assign(node.b, {
  x: Math.sqrt(3),
  y: 0,
  next: node.c,
  joinChoices: [
    {
      node: node.c,
      next: node.b,
      disallowedSideJoin: node.b,
    },
    {
      node: node.d,
      next: node.c,
      disallowedSideJoin: node.c,
    },
  ],
});
Object.assign(node.c, {
  x: Math.sqrt(3),
  y: 1,
  next: node.d,
  joinChoices: [
    {
      node: node.c,
      next: node.b,
      disallowedSideJoin: node.b,
    },
    {
      node: node.d,
      next: node.c,
      disallowedSideJoin: node.c,
    },
  ],
});
Object.assign(node.d, {
  x: Math.sqrt(3) / 2,
  y: 3 / 2,
  next: node.a,
  joinChoices: [
    {
      node: node.b,
      next: node.a,
      disallowedSideJoin: node.a,
    },
    {
      node: node.a,
      next: node.d,
      disallowedSideJoin: node.d,
    },
  ],
});

const shapeScale = 8;

export class ShapeSnake extends BasicEntity {
  init() {
    const game = this.game;

    this.orientation = {
      originNode: node.a,
      position: { x: game.width / 2, y: game.height / 2 },
      rotation: { x: 1, y: 0 },
      disallowedSideJoin: null,
    };

    this.targetPosition = {
      x: game.width / 2,
      y: game.height / 2,
    };
    window.addEventListener("pointermove", (event) => {
      this.targetPosition.x = event.offsetX;
      this.targetPosition.y = event.offsetY;
    });

    this.colour = '';
    this.do(async job => {
      while (true) {
        this.colour = `hsl(${random(360)}deg, 100%, ${random(50) + 50}%)`;
        await job.sleep(30 + random(30));
      }
    });
  }
  
  async run() {
    const squareTargetDistanceLimit = (shapeScale + 10) ** 2;

    while (true) {
      await this.tick();

      this.orientation = createJoinedOrientation(this.orientation, this.targetPosition);

      if (
        squareDistance(
          this.orientation.position.x,
          this.orientation.position.y,
          this.targetPosition.x,
          this.targetPosition.y
        ) < squareTargetDistanceLimit
      ) {
        this.targetPosition.x = random(this.game.width);
        this.targetPosition.y = random(this.game.height);
      }
    }
  }
  
  onDraw(context, width, height) {
    context.strokeStyle = this.colour;
    context.beginPath();
    for (let i = 0; i < nodes.length; ++i) {
      const [x, y] = orient(nodes[i], this.orientation);
      if (i == 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    context.stroke();
  }
}

function createJoinedOrientation(orientation, targetPosition) {
  const options = [];
  for (const side of nodes) {
    if (side == orientation.disallowedSideJoin) {
      continue;
    }
    const [sideStartX, sideStartY] = orient(side, orientation);
    const [sideEndX, sideEndY] = orient(side.next, orientation);
    const [sideDirX, sideDirY] = normalise(
      sideEndX - sideStartX,
      sideEndY - sideStartY
    );

    for (const joinWith of side.joinChoices) {
      const [joinSideDirX, joinSideDirY] = normalise(
        joinWith.next.x - joinWith.node.x,
        joinWith.next.y - joinWith.node.y
      );

      const [rotateX, rotateY] = rotate(
        sideDirX,
        sideDirY,
        joinSideDirX,
        -joinSideDirY
      );

      options.push({
        originNode: joinWith.node,
        position: {
          x: sideStartX,
          y: sideStartY,
        },
        rotation: {
          x: rotateX,
          y: rotateY,
        },
        disallowedSideJoin: joinWith.disallowedSideJoin,
        squareDistanceToTarget: squareDistance(
          sideStartX,
          sideStartY,
          targetPosition.x,
          targetPosition.y
        ),
      });
    }
  }
  options.sort((a, b) => a.squareDistanceToTarget - b.squareDistanceToTarget);
  return chooseBiasLow(options);
}

function chooseBiasLow(list) {
  return list[Math.floor(random(random(list.length)))];
}

function squareDistance(aX, aY, bX, bY) {
  return (bX - aX) ** 2 + (bY - aY) ** 2;
}

const normaliseResult = [0, 0];
function normalise(x, y) {
  const length = Math.sqrt(x * x + y * y);
  normaliseResult[0] = x / length;
  normaliseResult[1] = y / length;
  return normaliseResult;
}

const rotateResult = [0, 0];
function rotate(x, y, rotateX, rotateY) {
  rotateResult[0] = x * rotateX - y * rotateY;
  rotateResult[1] = x * rotateY + y * rotateX;
  return rotateResult;
}

const orientResult = [0, 0];
function orient(node, orientation) {
  const [x, y] = rotate(
    (node.x - orientation.originNode.x) * shapeScale,
    (node.y - orientation.originNode.y) * shapeScale,
    orientation.rotation.x,
    orientation.rotation.y
  );
  orientResult[0] = orientation.position.x + x;
  orientResult[1] = orientation.position.y + y;
  return orientResult;
}

function chooseRandomly(list) {
  return list[Math.floor(Math.random(list.length))];
}

function getRandomSide(disallowedSide) {
  const i = Math.floor(random(nodes.length - 1));
  return nodes[nodes[i] === disallowedSide ? i + 1 : i];
}
