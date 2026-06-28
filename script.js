const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("statusText");
const undoBtn = document.getElementById("undoBtn");
const restartBtn = document.getElementById("restartBtn");

const size = 15;
const padding = 32;
const cell = (canvas.width - padding * 2) / (size - 1);
const board = Array.from({ length: size }, () => Array(size).fill(null));
const moves = [];

let currentPlayer = "black";
let winner = null;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawStarPoints();
  drawStones();
}

function drawGrid() {
  ctx.strokeStyle = "#6f4317";
  ctx.lineWidth = 1.5;

  for (let i = 0; i < size; i += 1) {
    const pos = padding + i * cell;
    ctx.beginPath();
    ctx.moveTo(padding, pos);
    ctx.lineTo(canvas.width - padding, pos);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pos, padding);
    ctx.lineTo(pos, canvas.height - padding);
    ctx.stroke();
  }
}

function drawStarPoints() {
  const points = [3, 7, 11];
  ctx.fillStyle = "#5a3512";

  points.forEach((x) => {
    points.forEach((y) => {
      ctx.beginPath();
      ctx.arc(padding + x * cell, padding + y * cell, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function drawStones() {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (board[row][col]) {
        drawStone(row, col, board[row][col]);
      }
    }
  }
}

function drawStone(row, col, player) {
  const x = padding + col * cell;
  const y = padding + row * cell;
  const gradient = ctx.createRadialGradient(x - 7, y - 8, 4, x, y, 18);

  if (player === "black") {
    gradient.addColorStop(0, "#777");
    gradient.addColorStop(0.5, "#111");
    gradient.addColorStop(1, "#000");
  } else {
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(0.7, "#ededed");
    gradient.addColorStop(1, "#bfbfbf");
  }

  ctx.beginPath();
  ctx.arc(x, y, cell * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function handleMove(event) {
  if (winner) return;

  const { row, col } = getBoardPosition(event);
  if (row < 0 || row >= size || col < 0 || col >= size || board[row][col]) return;

  board[row][col] = currentPlayer;
  moves.push({ row, col, player: currentPlayer });

  if (hasFiveInARow(row, col, currentPlayer)) {
    winner = currentPlayer;
  } else if (moves.length === size * size) {
    winner = "draw";
  } else {
    currentPlayer = currentPlayer === "black" ? "white" : "black";
  }

  drawBoard();
  updateStatus();
}

function getBoardPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  return {
    row: Math.round((y - padding) / cell),
    col: Math.round((x - padding) / cell),
  };
}

function hasFiveInARow(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  return directions.some(([dr, dc]) => {
    const count = 1 + countDirection(row, col, dr, dc, player) + countDirection(row, col, -dr, -dc, player);
    return count >= 5;
  });
}

function countDirection(row, col, dr, dc, player) {
  let total = 0;
  let nextRow = row + dr;
  let nextCol = col + dc;

  while (board[nextRow]?.[nextCol] === player) {
    total += 1;
    nextRow += dr;
    nextCol += dc;
  }

  return total;
}

function undoMove() {
  if (winner === "draw") winner = null;
  if (winner && moves.at(-1)?.player === winner) winner = null;

  const lastMove = moves.pop();
  if (!lastMove) return;

  board[lastMove.row][lastMove.col] = null;
  currentPlayer = lastMove.player;
  drawBoard();
  updateStatus();
}

function restartGame() {
  for (let row = 0; row < size; row += 1) {
    board[row].fill(null);
  }

  moves.length = 0;
  currentPlayer = "black";
  winner = null;
  drawBoard();
  updateStatus();
}

function updateStatus() {
  undoBtn.disabled = moves.length === 0 || Boolean(winner);

  if (winner === "draw") {
    statusText.textContent = "平局！棋盘已满";
  } else if (winner) {
    statusText.textContent = `${winner === "black" ? "黑棋" : "白棋"}获胜！`;
  } else {
    statusText.textContent = `${currentPlayer === "black" ? "黑棋" : "白棋"}回合`;
  }
}

canvas.addEventListener("click", handleMove);
undoBtn.addEventListener("click", undoMove);
restartBtn.addEventListener("click", restartGame);

drawBoard();
updateStatus();
