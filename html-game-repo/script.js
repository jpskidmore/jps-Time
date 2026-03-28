const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreNode = document.getElementById('score');
const bestNode = document.getElementById('best');
const restartButton = document.getElementById('restart');

const width = canvas.width;
const height = canvas.height;

const laneCount = 5;
const laneWidth = width / laneCount;
const player = {
  lane: 2,
  y: height - 85,
  w: laneWidth * 0.65,
  h: 42,
};

let score = 0;
let best = Number(localStorage.getItem('sky-dodge-best') || 0);
let rocks = [];
let spawnTimer = 0;
let spawnDelay = 900;
let speed = 2.1;
let gameOver = false;
let lastTime = 0;

bestNode.textContent = String(best);

function resetGame() {
  score = 0;
  rocks = [];
  spawnTimer = 0;
  spawnDelay = 900;
  speed = 2.1;
  gameOver = false;
  lastTime = performance.now();
  player.lane = 2;
  scoreNode.textContent = '0';
  restartButton.hidden = true;
  requestAnimationFrame(loop);
}

function drawLanes() {
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 1; i < laneCount; i += 1) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawPlayer() {
  const x = player.lane * laneWidth + (laneWidth - player.w) / 2;

  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.roundRect(x, player.y, player.w, player.h, 10);
  ctx.fill();

  ctx.fillStyle = '#082f49';
  ctx.fillRect(x + 8, player.y + 8, player.w - 16, 10);
}

function spawnRock() {
  rocks.push({
    lane: Math.floor(Math.random() * laneCount),
    y: -50,
    w: laneWidth * 0.58,
    h: 38,
  });
}

function drawRock(rock) {
  const x = rock.lane * laneWidth + (laneWidth - rock.w) / 2;
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.roundRect(x, rock.y, rock.w, rock.h, 8);
  ctx.fill();

  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(x + 7, rock.y + 8, rock.w - 14, 8);
}

function intersects(rock) {
  const playerX = player.lane * laneWidth + (laneWidth - player.w) / 2;
  const rockX = rock.lane * laneWidth + (laneWidth - rock.w) / 2;

  return !(
    playerX + player.w < rockX ||
    playerX > rockX + rock.w ||
    player.y + player.h < rock.y ||
    player.y > rock.y + rock.h
  );
}

function endGame() {
  gameOver = true;
  restartButton.hidden = false;
  if (score > best) {
    best = score;
    localStorage.setItem('sky-dodge-best', String(best));
    bestNode.textContent = String(best);
  }
}

function update(dtMs) {
  const dt = dtMs / 1000;
  spawnTimer += dtMs;

  if (spawnTimer >= spawnDelay) {
    spawnRock();
    spawnTimer = 0;
    spawnDelay = Math.max(360, spawnDelay - 8);
    speed = Math.min(8.2, speed + 0.05);
  }

  for (const rock of rocks) {
    rock.y += speed * 60 * dt;
    if (intersects(rock)) {
      endGame();
      return;
    }
  }

  const remaining = [];
  for (const rock of rocks) {
    if (rock.y > height + 50) {
      score += 1;
      scoreNode.textContent = String(score);
    } else {
      remaining.push(rock);
    }
  }
  rocks = remaining;
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawLanes();

  for (const rock of rocks) {
    drawRock(rock);
  }

  drawPlayer();

  if (gameOver) {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', width / 2, height / 2 - 20);
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText(`Score: ${score}`, width / 2, height / 2 + 22);
  }
}

function loop(timestamp) {
  if (gameOver) {
    render();
    return;
  }

  const dt = Math.min(40, timestamp - lastTime);
  lastTime = timestamp;

  update(dt);
  render();
  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

function onKeyDown(event) {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    player.lane = Math.max(0, player.lane - 1);
  }

  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    player.lane = Math.min(laneCount - 1, player.lane + 1);
  }
}

document.addEventListener('keydown', onKeyDown);
restartButton.addEventListener('click', resetGame);

resetGame();
