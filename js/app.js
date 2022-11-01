'use strict'

var WALL = 'WALL'
var FLOOR = 'FLOOR'
var BALL = 'BALL'
var GAMER = 'GAMER'
var GLUE = 'GLUE'
var GAMER_PURPLE = 'GAMER_PURPLE'
var BOMB = 'BOMB'

const VICTORY_SOUND = new Audio('sound/win.mp3')
const EAT_SOUND = new Audio('sound/eat.wav')
const GLUE_SOUND = new Audio('sound/glue.mp3')
var GAME_OVER = new Audio('sound/game over.mp3')

const BOMB_IMG = '💣'
const BALL_IMG = '<img src="img/ball.png" />'
const GLUE_IMG = '\n\t\t<img src="img/candy.png">\n'
var GAMER_IMG = '<img src="img/gamer.png" />'
var GAMER_PURPLE_IMG = '<img src="img/gamer-purple.png">'

var gBoard
var gGamerPos
var gCollectingBalls
var gBalls
var gCurrLevel = '.eazy'
var gGameSpeed = 1200

var gGlueInterval
var gBallInterval
var gBombInterval

var gIsPlay = false
var gIsGlued = false
var gIsBlowUpBomb = false
var isGameOver
var isVictory
var gIsPause = false


function initGame() {
	isGameOver = false
	isVictory = false
	gIsBlowUpBomb = false
	gIsGlued = false
	gCollectingBalls = 0
	gBalls = 2
	document.querySelector('span').innerText = gCollectingBalls
	document.querySelector('.restart').style.opacity = 0
	document.querySelector('.gameOver').style.opacity = 0
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	renderBoard(gBoard)
	document.querySelector(gCurrLevel).style.backgroundColor = 'white'
	playGame()
}

function playGame() {
	gIsPlay = true
	gBallInterval = setInterval(addBall, gGameSpeed, gBoard)
	gGlueInterval = setInterval(addGlue, 5000, gBoard)
	gBombInterval = setInterval(addBomb, 10000, gBoard)
}

function chooseLevel(level) {
	if (gIsPause) return
	if (isGameOver || isVictory) return
	if (gIsPlay) {
		document.querySelector(gCurrLevel).style.backgroundColor = 'brown'
		clearIntervals()
	}
	if (level.innerText === 'Eazy') {
		gCurrLevel = '.eazy'
		gGameSpeed = 1200
	}
	else if (level.innerText === 'Normal') {
		gCurrLevel = '.normal'
		gGameSpeed = 800
	}
	else if (level.innerText === 'Hard') {
		gCurrLevel = '.hard'
		gGameSpeed = 500
	}
	document.querySelector(gCurrLevel).style.backgroundColor = 'white'
	initGame()
}

function addElement(board, cell, element) {
	board[cell.i][cell.j].gameElement = element
}

function deleteElement(board, cell, element) {
	if (board[cell.i][cell.j].gameElement === element) {
		board[cell.i][cell.j].gameElement = null
		renderCell(cell, null)
	}
}

function clearIntervals() {
	clearInterval(gBallInterval)
	clearInterval(gGlueInterval)
	clearInterval(gBombInterval)
}

function pause() {
	if (!gIsPlay) return
	if (!gIsPause) {
		clearIntervals()
		document.querySelector('.pause').style.backgroundColor = 'white'
		gIsPause = true
	} else {
		gIsPause = false
		playGame()
		document.querySelector('.pause').style.backgroundColor = 'brown'
	}
}

function restart() {
	document.querySelector(gCurrLevel).style.backgroundColor = 'brown'
	gCurrLevel = '.eazy'
	gGameSpeed = 1200
	initGame()
}

function checkIfVictory() {
	if (gBalls === 0) return true
	return false
}

function checkIfGameOver(board) {
	if (gIsBlowUpBomb === true) return true

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j].type === FLOOR && board[i][j].gameElement === null) return false
		}
	}
	return true
}

function gameOver() {
	clearIntervals()
	isGameOver = true
	gIsPlay = false
	GAME_OVER.play()
	document.querySelector('.gameOver').innerText = 'GAME OVER'
	document.querySelector('.restart').style.opacity = 1
	document.querySelector('.gameOver').style.opacity = 1
	document.querySelector('.restart').style.opacity = 1
}

function victory() {
	isVictory = true
	gIsPlay = false
	VICTORY_SOUND.play()
	document.querySelector('.gameOver').innerText = 'You win!'
	document.querySelector('.gameOver').style.opacity = 1
	document.querySelector('.restart').style.opacity = 1
	clearIntervals()
}

function moveTo(i, j) {
	if (!gIsPlay) return
	if (gIsGlued) return
	if (gIsBlowUpBomb) return

	var iAbsDiff = Math.abs(i - gGamerPos.i)
	var jAbsDiff = Math.abs(j - gGamerPos.j)

	if ((iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) || (jAbsDiff === gBoard[0].length - 1 && iAbsDiff === 0) || (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
			if (i > gBoard.length - 1) i = 0
			else if (i < 0) i = gBoard.length - 1
			if (j > gBoard[0].length - 1) j = 0
			else if (j < 0) j = gBoard[0].length - 1
		}

		var targetCell = gBoard[i][j]
		if (targetCell.type === WALL) return

		else if (targetCell.gameElement === BALL) ballMeeting()
		else if (targetCell.gameElement === GLUE) glueMeeting()
		else if (targetCell.gameElement === BOMB) bombMeeting(i, j)

		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
		renderCell(gGamerPos, '')

		gGamerPos.i = i
		gGamerPos.j = j
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER

		renderCell(gGamerPos, GAMER_IMG)
	}
	if (checkIfVictory()) victory()
}

// function goUp() {
// 	var i = gGamerPos.i
// 	var j = gGamerPos.j
// 	moveTo(i - 1, j)
// }

// function goRigth() {
// 	var i = gGamerPos.i
// 	var j = gGamerPos.j
// 	moveTo(i, j + 1)
// }

// function goDown() {
// 	var i = gGamerPos.i
// 	var j = gGamerPos.j
// 	moveTo(i + 1, j)
// }

// function goLeft() {
// 	var i = gGamerPos.i
// 	var j = gGamerPos.j
// 	moveTo(i, j - 1)
// }

function addBall(board) {
	if (!checkIfGameOver(board)) {
		var emptyCell = findEmptyCell(board)
		addElement(board, emptyCell, BALL)
		renderCell(emptyCell, BALL_IMG)
		gBalls++
	} else {
		gameOver()
	}
}

function addGlue(board) {
	var emptyCell = findEmptyCell(board)
	addElement(board, emptyCell, GLUE)
	renderCell(emptyCell, GLUE_IMG)
	setTimeout(deleteElement, 3000, board, emptyCell, GLUE)
}

function addBomb(board) {
	var emptyCell = findEmptyCell(board)
	addElement(board, emptyCell, BOMB)
	renderCell(emptyCell, BOMB_IMG)
	setTimeout(deleteElement, 5000, board, emptyCell, BOMB)
}

function blowUpNeighbors(i, j) {
	for (var I = i - 1; I <= i + 1; I++) {
		if (I < 0 || I > gBoard.length - 1) continue
		for (var J = j - 1; J <= j + 1; J++) {
			if (J < 0 || J > gBoard[i].length - 1) continue
			if (gBoard[I][J].type !== WALL) {
				document.querySelector(`.cell-${I}-${J}`).style.backgroundColor = 'red'
				document.querySelector(`.cell-${I}-${J}`).innerText = null
			}
		}
	}
}

function buildBoard() {
	var board = createMat(10, 12)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	board[0][5].type = FLOOR
	board[4][0].type = FLOOR
	board[4][11].type = FLOOR
	board[9][5].type = FLOOR
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	// console.log(board);
	return board;
}

function renderBoard(board) {

	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j]

			var cellClass = getClassName({ i: i, j: j })
			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall'

			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n'

			if (currCell.gameElement === GAMER) strHTML += GAMER_IMG
			else if (currCell.gameElement === BALL) strHTML += BALL_IMG
			else if (currCell.gameElement === GLUE) strHTML += GLUE_IMG
			else if (currCell.gameElement === GAMER_PURPLE) strHTML += GAMER_PURPLE_IMG

			strHTML += '\t</td>\n'
		}
		strHTML += '</tr>\n'
	}
	var elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

function ballMeeting() {
	EAT_SOUND.play()
	gBalls--
	gCollectingBalls++
	document.querySelector('span').innerText = gCollectingBalls
}

function glueMeeting() {
	GLUE_SOUND.play()
	GAMER_IMG = GAMER_PURPLE_IMG
	gIsGlued = true
	setTimeout(() => {
		GAMER_IMG = '<img src="img/gamer.png" />'
		gIsGlued = false
	}, 3000)
}

function bombMeeting(i, j) {
	GAME_OVER = new Audio('sound/bomb.mp3')
	setTimeout(() => {
		GAME_OVER = new Audio('sound/game over.mp3')
	}, 5000)
	gIsBlowUpBomb = true
	gameOver()
	blowUpNeighbors(i, j)
}

function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}

}

function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function findEmptyCell(board) {
	var emptyCells = []
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j].type === FLOOR && board[i][j].gameElement === null) emptyCells.push({ i, j })
		}
	}
	return emptyCells[getRandomInt(0, emptyCells.length)]
}
