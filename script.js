const canvas = document.querySelector('canvas');
const nameModal = document.getElementById('namemodal');
const input = document.getElementById('name')
const submitBtn = document.getElementById('submitBtn')
const cancelBtn = document.getElementById('cancelBtn')
const clearBtn = document.getElementById('clearleaderboard')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext('2d');

const gameHeight = canvas.height * 0.7;
const gameWidth = gameHeight;

const gameX = (canvas.width / 2) - (gameWidth / 2);
const gameY = canvas.height * 0.05;

const leaderboardX = canvas.width * 0.05
const leaderboardY = canvas.height * 0.05;
const leaderboardHeight = canvas.height * 0.8
const leaderboardWidth = canvas.width * 0.2

const instructionsX = canvas.width*0.85
const instructionsY = canvas.height*0.5;

const gridSize = 20;
const cellWidth = gameWidth / gridSize;
const cellHeight = gameHeight / gridSize;

const DIR = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function isOpposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    if (this.body && (this.body.length > 2)) {
      started = false;
      getName(this.body.length - 2);
    }
    this.body = [[1, 0], [0, 0]];
    this.currentDir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };
    this.dirQueue = [];
    this.ate = false;
  }

  setDirection(dir) {
    const baseline = this.dirQueue.length ? this.dirQueue[this.dirQueue.length - 1] : this.nextDir;
    if (isOpposite(dir, baseline)) return;
    if (dir.x === baseline.x && dir.y === baseline.y) return;
    if (this.dirQueue.length >= 2) return;
    this.dirQueue.push(dir);
  }

  eat() {
    this.ate = true;
  }

  step() {
    if (this.dirQueue.length) {
      const candidate = this.dirQueue.shift();
      if (!isOpposite(candidate, this.currentDir)) {
        this.nextDir = candidate;
      }
    }

    if (!isOpposite(this.nextDir, this.currentDir)) {
      this.currentDir = this.nextDir;
    }

    const [hx, hy] = this.body[0];
    const nx = hx + this.currentDir.x;
    const ny = hy + this.currentDir.y;

    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
      this.reset();
      return;
    }

    const tailIndex = this.body.length - 1;
    const [tx, ty] = this.body[tailIndex];
    for (let i = 0; i < this.body.length; i++) {
      const [bx, by] = this.body[i];
      if (bx === nx && by === ny) {
        if (!this.ate && i === tailIndex && tx === nx && ty === ny) {
          break;
        }
        this.reset();
        return;
      }
    }

    this.body.unshift([nx, ny]);
    if (!this.ate) {
      this.body.pop();
    } else {
      this.ate = false;
    }
  }

  draw() {
    c.fillStyle = 'green';
    for (const [x, y] of this.body) {
      c.fillRect(gameX + (x * cellWidth), gameY + (y * cellHeight), cellWidth, cellHeight);
    }
  }
}

const snake = new Snake();

let fx = Math.round((Math.random() * (gridSize - 2)) + 1);
let fy = Math.round((Math.random() * (gridSize - 2)) + 1);

function newfood() {
  let valid = false;
  while (!valid) {
    fx = Math.round(Math.random() * (gridSize - 1));
    fy = Math.round(Math.random() * (gridSize - 1));
    valid = true;
    for (const [x, y] of snake.body) {
      if (fx === x && fy === y) {
        valid = false;
        break;
      }
    }
  }
}

function getName(score) {
  document.removeEventListener('keydown', keydown)
  nameModal.style.display = 'block';

  function submit() {
    if (input.value) {
      saveScore(input.value, score)
      drawBoard()
      closeModal();
      submitBtn.removeEventListener('click', submit);
    } else {
      nameModal.classList.add('incorrect')
    }
  }

  submitBtn.addEventListener('click', submit)
}

cancelBtn.addEventListener('click', closeModal);

function closeModal() {
  nameModal.classList.remove('incorrect')
  nameModal.style.display = 'none';
  document.addEventListener('keydown', keydown)
  input.value = ''
}

function saveScore(name, score) {
  let scores = localStorage.getItem('scores')

  console.log('before adding')
  console.log(scores)

  if (!scores) {
    scores = []
  } else {
    scores = scores.split(';')
  }
  
  let entry = {}
  entry['name'] = name
  entry['score'] = score
  entry = JSON.stringify(entry)
  
  scores.push(entry)
  scores = scores.join(';')

  console.log('after adding')
  console.log(scores)

  localStorage.setItem('scores', scores)
}

function drawLeaderboard() {
  c.font = '30px Sans-Serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = 'white'
  c.strokeStyle = 'white';
  c.strokeRect(leaderboardX, leaderboardY, leaderboardWidth, leaderboardHeight)
  c.fillText('High Scores:', leaderboardX+(leaderboardWidth/2), leaderboardY+(leaderboardHeight*0.05))

  let scores = localStorage.getItem('scores')
  c.font = '20px Sans-Serif'
  if (scores) {
    scores = scores.split(';')
    scores.sort((a, b) => {
      return Number(JSON.parse(b)['score']) - Number(JSON.parse(a)['score'])
    })
    const space = leaderboardHeight*0.95 / (scores.length + 1)
    for (let i = 0; i < scores.length; i++) {
      let score = JSON.parse(scores[i])
      let text = `${i+1}) ${score['name']}: ${score['score']}`
      c.fillText(text, leaderboardX+(leaderboardWidth/2), leaderboardY+(leaderboardHeight*0.05)+(space*(i+1)))
    }
  }
}

clearBtn.addEventListener('click', () => {
  localStorage.clear();
  drawBoard();
})

function writeInstructions() {
  c.font = '20px Sans-Serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = 'white'
  c.strokeStyle = 'white';
  c.fillText('Use w,a,s,d or arrow keys to start', instructionsX, instructionsY)
}

function drawBoard() {
  c.clearRect(0, 0, canvas.width, canvas.height);

  // High scores
  drawLeaderboard();

  // Game
  c.strokeStyle = 'white';
  c.strokeRect(gameX, gameY, gameWidth, gameHeight);

  c.fillStyle = 'red';
  c.fillRect(gameX + (fx * cellWidth), gameY + (fy * cellHeight), cellWidth, cellHeight);

  snake.draw();

  writeInstructions();

  c.font = '30px Sans-Serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = 'white'
  c.fillText(`Score: ${snake.body.length - 2}`, canvas.width / 2, canvas.height*9/10)
}

const stepMs = 100;
let lastTime = 0;
let acc = 0;
let started = false;

function gameLoop(ts) {
  if (!started) return;

  if (lastTime === 0) lastTime = ts;
  acc += ts - lastTime;
  lastTime = ts;

  while (acc >= stepMs) {
    const [hx, hy] = snake.body[0];
    if (hx === fx && hy === fy) {
      newfood();
      snake.eat();
    }

    snake.step();
    acc -= stepMs;
  }

  drawBoard();
  requestAnimationFrame(gameLoop);
}

function directionFromCode(code) {
  if (code === 'KeyW' || code === 'ArrowUp') return DIR.up;
  if (code === 'KeyS' || code === 'ArrowDown') return DIR.down;
  if (code === 'KeyA' || code === 'ArrowLeft') return DIR.left;
  if (code === 'KeyD' || code === 'ArrowRight') return DIR.right;
  return null;
}

document.addEventListener('keydown', keydown);

function keydown(e) {
  const dir = directionFromCode(e.code);
  if (!dir) return;

  e.preventDefault();

  if (!started) {
    started = true;
    lastTime = 0;
    acc = 0;
    requestAnimationFrame(gameLoop);
  }

  snake.setDirection(dir);
}

drawBoard();
