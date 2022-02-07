const WALL = "WALL";
const FLOOR = "FLOOR";
const BALL = "BALL";
const GAMER = "GAMER";
const GLUE = "GLUE";

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/candy.png">';

// Model:
var gBoard;
var gGamerPos;
var gEmptyCells;
var gIntervalBall;
var gIntervalGlue;
var gIntervalrem;
var gCollectedBallCount;
var gBallCounter;
var isGlued;
var isGameOn;
// DOM global els
var elWinDisplay = document.querySelector(".win-display");
var elBallsCounter = document.querySelector(".balls-counter");

function initGame() {
  isGameOn = true;
  isGlued = false;
  gBallCounter = 2;
  gCollectedBallCount = 0;
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  gEmptyCells = findEmptyCells(gBoard);
  elBallsCounter.innerText = 0;
  renderBoard(gBoard);
  gIntervalBall = setInterval(newRandBall, 3000);
  gIntervalGlue = setInterval(newRandGlue, 5000);

  elWinDisplay.style.display = "none";
}

function buildBoard() {
  // Create the Matrix 10 * 12
  var board = createMat(10, 12);
  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = { type: FLOOR, gameElement: null };
      if (
        (i === 0 || j === 0 || i === board.length - 1 || j === board[0].length - 1) &&
        i !== 5 &&
        j !== 5
      ) {
        cell.type = WALL;
      }
      board[i][j] = cell;
    }
  }
  // Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
  board[2][6].gameElement = BALL;
  board[3][3].gameElement = BALL;
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  var elBoard = document.querySelector(".board");
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j }); // cell-i-j

      if (currCell.type === FLOOR) cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";

      strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`;

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      }

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }
  // console.log('strHTML is:');
  // console.log(strHTML);
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  if (!isGameOn) return;
  // gEmptyCells = findEmptyCells(gBoard);
  // { type:WALL, gameElement:null }
  if (isGlued) return;
  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i); // 1-2 = -1 === 1
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    (gGamerPos.j === 0 && j === 11) ||
    (gGamerPos.j === 11 && j === 0) ||
    (gGamerPos.i === 9 && i === 0) ||
    (gGamerPos.i === 0 && i === 9)
  ) {
    if (targetCell.gameElement === BALL) {
      collectBall();
      checkWin();
    }

    if (targetCell.gameElement === GLUE) {
      isGlued = true;
      setTimeout(function () {
        isGlued = false;
      }, 3000);
      console.log("ITS A GLUE");
    }

    // TODO: Move the gamer

    // MODEL
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

    // DOM
    renderCell(gGamerPos, "");

    // update game pos
    gGamerPos = { i: i, j: j };

    // MODEL
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    // DOM
    renderCell(gGamerPos, GAMER_IMG);

    // if win
  } else console.log("TOO FAR", iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element

// .cell-0-0
function renderCell(location, value) {
  var cellSelector = "." + getClassName(location);
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (event.key) {
    case "ArrowLeft":
      if (i === 5 && j === 0) {
        moveTo(5, 11);
        break;
      }
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      if (i === 5 && j === 11) {
        moveTo(5, 0);
        break;
      }
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      if (i === 0 && j === 5) {
        moveTo(9, 5);
        break;
      }
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      if (i === 9 && j === 5) {
        moveTo(0, 5);
        break;
      }
      moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

function findEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      if (currCell.type !== WALL && currCell.gameElement === null) {
        emptyCells.push({
          i: i,
          j: j,
        });
      }
    }
  }
  return emptyCells;
}

function randomCell(cells) {
  var randCell = cells.splice(getRandomInt(0, cells.length - 1), 1);
  return randCell[0];
}

function newRandBall() {
  var randCell = randomCell(findEmptyCells(gBoard));

  // update MODEL
  gBoard[randCell.i][randCell.j].gameElement = BALL;

  // update DOM
  renderCell(randCell, BALL_IMG);

  gBallCounter++;
}

function newRandGlue() {
  clearInterval(gIntervalrem);
  var randCell = randomCell(findEmptyCells(gBoard));

  gBoard[randCell.i][randCell.j].gameElement = GLUE;

  renderCell(randCell, GLUE_IMG);
  gIntervalrem = setInterval(removeGluedCell, 3000);
}

function collectBall() {
  console.log("Collecting!");
  gCollectedBallCount++;
  var audio = new Audio("audio/ballpick.mp3");
  audio.play();

  elBallsCounter.innerText = gCollectedBallCount;
}

function removeGluedCell() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.gameElement === GLUE) {
        // MODUL
        currCell.gameElement = null;
        // DOM
        renderCell({ i: i, j: j }, "");
      }
    }
  }
}

function checkWin() {
  if (gBallCounter === gCollectedBallCount) {
    clearInterval(gIntervalBall);
    clearInterval(gIntervalGlue);
    // diplay win message
    console.log("Win!");
    elWinDisplay.style.display = "block";
    isGameOn = false;
  }
}
