const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth; 
canvas.height = canvas.offsetHeight;

let cellSize, count;
let alivesCanvas = [];
let alivesBuffer = [];
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
  for (let i = 0; i < count.x; i++) {
    for (let j = 0; j < count.y; j++) {
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
  alives.length = count.x;
  alivesBuffer.length = count.x;
  for (let i = 0; i < count.x; i++) {
    alives[i] = new Array(count.y);
    alivesBuffer[i] = new Array(count.y);
    for (let j = 0; j < count.y; j++) {
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
  count = { x: Math.floor(canvas.width / cellSize) + 1, y: Math.floor(canvas.height / cellSize) + 1 };

  initAlives(alives, count, () => Math.random() < aliveChance);
  fillCanvas(c, alives);
};

const fillCell = (c, alives, x, y) => {
  let [cx, cy] = [-1, -1];

  for (let i = 0; i < count.x; i++) {
    if (x >= i * cellSize && x < (i + 1) * cellSize) {
      cx = i;
    }
  }

  for (let j = 0; j < count.y; j++) {
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
    ci <= ((i + 1) === count.x ? i : i + 1);
    ci++ 
  ) {
    for (
      let cj = (j - 1) < 0 ? j : j - 1;
      cj <= ((j + 1) === count.y ? j : j + 1);
      cj++ 
    ) {
      if ((ci !== i || cj !== j) && alives[ci][cj]) {
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
    for (let i = 0; i < count.x; i++) {
      for (let j = 0; j < count.y; j++) {
        const isAlive = calcAlive(alivesCanvas, i, j);
        alivesBuffer[i][j] = isAlive;
        drawRect(ctx, cellSize * i, cellSize * j, cellSize, cellSize, isAlive ? aliveColor : deadColor);
      }
    }
    for (let i = 0; i < count.x; i++) {
      for (let j = 0; j < count.y; j++) {
        alivesCanvas[i][j] = alivesBuffer[i][j];
      }
    }
  }, 500)
};

initCanvas(ctx, alivesCanvas);
runLife();

canvas.addEventListener('click', (e) => fillCell(ctx, alivesCanvas, e.offsetX, e.offsetY));

const switchRun = (stop = false) => {
  const e = document.getElementById('run');
  if (e.classList.contains('stop')) {
    clearInterval(interval);
    e.classList.remove('stop');
    e.innerHTML = 'run';
  }
  else if (!stop) {
    runLife();
    e.classList.add('stop');
    e.innerHTML = 'stop';
  }
}

document.getElementById('run').addEventListener('click', (e) => switchRun());
document.getElementById('clear').addEventListener('click', () => {
  switchRun(true);
  clearInterval(interval);
  emptyCanvas(ctx, alivesCanvas);
});

document.getElementById('plus').addEventListener('click', () => {
  if (multiplier === 10) return;
  multiplier += 1;
  aliveChance = Math.random();
  initCanvas(ctx, alivesCanvas);
});
document.getElementById('minus').addEventListener('click', () => {
  if (multiplier === 1) return;
  multiplier -= 1;
  aliveChance = Math.random();
  initCanvas(ctx, alivesCanvas);
});

canvas.addEventListener('mousedown', () => moved = true);
canvas.addEventListener('mouseup', () => moved = false);
canvas.addEventListener('mousemove', (e) => moved && fillCell(ctx, alivesCanvas, e.offsetX, e.offsetY));
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (moved) fillCell(
    ctx,
    alivesCanvas,
    e.touches[0].pageX - canvas.offsetLeft,
    e.touches[0].pageY - canvas.offsetTop
  );
}, { passive: false });
canvas.addEventListener('touchstart', () => moved = true, { passive: true});
canvas.addEventListener('touchend', () => moved = false);
