const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth; 
canvas.height = canvas.width;

const canvasBuilder = document.getElementById('builder');
const ctxBuilder = canvasBuilder.getContext('2d');
canvasBuilder.width = canvas.offsetWidth; 
canvasBuilder.height = canvasBuilder.width;

let cellSize, count;
let alivesCanvas = [];
let alivesBuilder = [];
let interval;
let multiplier = 1.0;
let basicCellSize = canvas.width / 30;
let aliveChance = Math.random();
let moved = false;

const aliveColor = '#59d070';
const deadColor = '#e3ebe9';
const strokeColor = '#729099';

const drawRect = (c, x, y, w, h, fill) => {
  c.beginPath();
  c.rect(x, y, w, h);
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = cellSize / 20;
  c.strokeStyle = strokeColor;
  c.stroke();
};

const fillCanvas = (c, alives) => {
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      drawRect(
        c,
        i * cellSize,
        j * cellSize,
        cellSize,
        cellSize,
        alives[i][j] ? aliveColor : deadColor
      );
    }
  }
};

const initAlives = (alives, count, initValue) => {
  alives.length = count;
  for (let i = 0; i < count; i++) {
    alives[i] = new Array(count);
    for (let j = 0; j < count; j++) {
      alives[i][j] = initValue();
    }
  }
};

const clearCanvas = (c) => {
  c.beginPath();
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
};

const emptyCanvas = (c, alives) => {
  clearCanvas(c);
  initAlives(alives, count, () => false);
  fillCanvas(c, alives);
};

const initCanvas = (c, alives) => {
  clearCanvas(c);

  cellSize = basicCellSize / (multiplier / 3);
  count = Math.floor(canvas.width / cellSize);

  initAlives(alives, count, () => Math.random() < aliveChance);
  fillCanvas(c, alives);
};

const fillCell = (c, alives, x, y) => {
  let [cx, cy] = [-1, -1];

  for (let i = 0; i < count; i++) {
    if (x >= i * cellSize && x < (i + 1) * cellSize) {
      cx = i;
    }
  }

  for (let j = 0; j < count; j++) {
    if (y >= j * cellSize && y < (j + 1) * cellSize) {
      cy = j;
    }
  }

  alives[cx][cy] = moved || !alives[cx][cy];
  drawRect(c, cx * cellSize, cy * cellSize, cellSize, cellSize, alives[cx][cy] ? aliveColor : deadColor);
};

const calcAlive = (alives, i, j) => {
  const nowAlive = alives[i][j];
  let aliveNeighbours = 0;

  for (
    let ci = (i - 1) < 0 ? i : i - 1;
    ci <= ((i + 1) === count ? i : i + 1);
    ci++ 
  ) {
    for (
      let cj = (j - 1) < 0 ? j : j - 1;
      cj <= ((j + 1) === count ? j : j + 1);
      cj++ 
    ) {
      if (ci !== i && cj !== j && alives[ci][cj]) {
        aliveNeighbours++;
      }
    }
  }

  if (!nowAlive) return aliveNeighbours === 3;

  return [2, 3].includes(aliveNeighbours);
}

const runLife = () => {
  interval = setInterval(() => {
    clearCanvas(ctx);
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const isAlive = calcAlive(alivesCanvas, i, j);
        alivesCanvas[i][j] = isAlive;
        drawRect(ctx, cellSize * i, cellSize * j, cellSize, cellSize, isAlive ? aliveColor : deadColor);
      }
    }
  }, 1000)
};

initCanvas(ctx, alivesCanvas);
emptyCanvas(ctxBuilder, alivesBuilder);
runLife();

canvasBuilder.addEventListener('click', (e) => fillCell(ctxBuilder, alivesBuilder, e.offsetX, e.offsetY));

document.getElementById('send').addEventListener('click', () => {
  clearInterval(interval);
  alivesCanvas = JSON.parse(JSON.stringify(alivesBuilder));
  fillCanvas(ctx, alivesCanvas);
  runLife();
});
document.getElementById('clear').addEventListener('click', () => {
  clearInterval(interval);
  emptyCanvas(ctx, alivesCanvas);
  emptyCanvas(ctxBuilder, alivesBuilder);
});

document.getElementById('plus').addEventListener('click', () => {
  if (multiplier === 10) return;
  multiplier += 1;
  aliveChance = Math.random();
  initCanvas(ctx, alivesCanvas);
  emptyCanvas(ctxBuilder, alivesBuilder);
});
document.getElementById('minus').addEventListener('click', () => {
  if (multiplier === 1) return;
  multiplier -= 1;
  aliveChance = Math.random();
  initCanvas(ctx, alivesCanvas);
  emptyCanvas(ctxBuilder, alivesBuilder);
});

canvasBuilder.addEventListener('mousedown', () => moved = true);
canvasBuilder.addEventListener('mouseup', () => moved = false);
canvasBuilder.addEventListener('mousemove', (e) => moved && fillCell(ctxBuilder, alivesBuilder, e.offsetX, e.offsetY));
canvasBuilder.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (moved) fillCell(
    ctxBuilder,
    alivesBuilder,
    e.touches[0].pageX - canvasBuilder.offsetLeft,
    e.touches[0].pageY - canvasBuilder.offsetTop
  );
}, { passive: false });
canvasBuilder.addEventListener('touchstart', () => moved = true, { passive: true});
canvasBuilder.addEventListener('touchend', () => moved = false);
