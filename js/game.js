'use strict'
const NORMAL = "😃"
const WIN = "😎"
const DEAD = "😵"
const MINE = "&#128163"
const HINT = "💡"
const FLAG = "🚩"
var gIsUndo = false

var gName = '@4stav'
var gEasyBetScores = []

var gIsFirst = true
var gBoard;
var gTime = 0
var gTimeInterval;
var gCorrectMarks;
var gElHintClicked = null
var gRecentBoards = []
var gRecenGameStats = []
var gIsManual = false
var gVisited;
var gSafeClicksLeft;

// localStorage.setItem('level4', [])
// localStorage.setItem('level8', [])
// localStorage.setItem('level12', [])


var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

// im sorry about the mess.. it was a hard problem and ill try to make it more readeble and nit on the weekend


function init() {

    initHints()
    initSafeClickBtn()
    resetDiffBtnsColor()
    gIsFirst = true
    gIsManual = false
    gElHintClicked = null
    gCorrectMarks = 0
    gVisited = []
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gSafeClicksLeft = 3
    gGame.secsPassed = 0
    gIsUndo = false
    gLevel.SIZE = 4
    gLevel.MINES = 2
    clearInterval(gTimeInterval)
    
    ////// css stuff
    var elTime = document.querySelector('.display .value')
    var elRestart = document.querySelector('.restart-container p .restart')
    var elManualBtn = document.querySelector('.manual-btn')
    var elGameContainer = document.querySelector('.game-container')
    if (elGameContainer.classList.contains('manual-mode')) {
        elGameContainer.classList.remove('manual-mode')
    }
    var elOpenManual = document.querySelector('.open-manual')
    elOpenManual.style.display = 'none'
    elManualBtn.style.display = 'block'
    elManualBtn.innerText = 'Manual'
    elRestart.innerText = NORMAL
    elTime.innerText = '0.00'
    //////////////////
    
    
    gBoard = createBoard()
    gRecentBoards = [copyBoard(gBoard)]
    gRecenGameStats = []
    initSafeClickBtn()
    renderBoard()
    renderBestScores('level4')
}




function renderBoard() {
    var board = gBoard;
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            strHtml += '<td '
            var cell = board[i][j];
            var cellClass = '';
            var cellContent = (cell.minesAroundCount) ? cell.minesAroundCount : ''

            if (cell.isMine) {
                cellClass += ' mine'
                cellContent = MINE
            }

            if (cell.isMarked && !cell.isShown) {
                numColor = 'blue'
                cellContent = FLAG
                cellClass += ' mark'

            } else {
                var numColor = 'transparent'
            }

            if (!cell.isShown) {
                cellClass += ' hidden'

            } else {
                var numColor = getNumberColor(cellContent)
            }

            strHtml += `class="cell ${cellClass}" 
            onclick="cellClicked(event, ${i}, ${j}), setMinesManual(${i}, ${j})" 
            oncontextmenu="mark(${i},${j})" style="color: ${numColor};">`
            strHtml += `${cellContent}</td>`
        }
        strHtml += '</tr>'
    }

    var elCells = document.querySelector('.game-cells');
    elCells.innerHTML = strHtml
}


function createBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell(i, j)
        }
    }
    return board
}


function createCell(i, j) {
    var cell = {
        location: { i, j },
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    }

    return cell
}


function cellClicked(ev, i, j) {
    var cell = gBoard[i][j]
    if (gIsManual) return
    if (!gGame.isOn) return
    if (cell.isMarked) return
    if (cell.isShown) return
    if (gElHintClicked) {
        return showHintCells(i, j)
    }
    if (cell.isMine) gameOver(false)



    if (gIsFirst) {
        gIsFirst = false
        firstClick({ i, j })

    } else {
        gRecentBoards.push(copyBoard(gBoard))
        var gameCopy = copyObj(gGame)
        gRecenGameStats.push(gameCopy)
    }


    if (cell.minesAroundCount === 0) {
        expandShown([{ i, j }])
    } else {
        gGame.shownCount++
    }

    cell.isShown = true
    gElHintClicked = null
    renderBoard()
    if (winCheck()) return gameOver(true)
}


function firstClick(firstPos) {

    var elManualBtn = document.querySelector('.manual-btn')
    elManualBtn.style.display = 'none'
    gTime = Date.now()
    gTimeInterval = setInterval(renderTime, 10)
    allowHints()
    allowSafeClick()
    gBoard = createBoard()
    var cell = gBoard[firstPos.i][firstPos.j]
    if (cell.isMine) gameOver(false)
    setMinesFirst(firstPos)
    countMinesNegs()
    setMinesNegsCount()

    // adding for the Undo
    gRecentBoards.push(copyBoard(gBoard))
    var gameCopy = copyObj(gGame)
    gRecenGameStats.push(gameCopy)
}


function winCheck() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j]
            if (!(cell.isMarked === cell.isMine)) return false
        }
    }
    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES)) {
        return true
    }
}


function gameOver(isWin) {
    gRecentBoards.push(copyBoard(gBoard))
    var gameCopy = copyObj(gGame)
    gRecenGameStats.push(gameCopy)
    showAllMineCells()
    clearInterval(gTimeInterval)
    gGame.isOn = false
    console.log("Game Over!")
    var elRestart = document.querySelector('.restart-container p .restart')
    if (isWin) {
        elRestart.innerText = WIN
        if (!gIsUndo) {
            switch (gLevel.SIZE) {
    
                case 4:
                    localStorage['level4'] += ` ${gGame.secsPassed}`
                    renderBestScores('level4')
                    break;
    
                case 8:
                    localStorage['level8'] += ` ${gGame.secsPassed}`
                    renderBestScores('level8')
                    break;
    
                case 12:
                    localStorage['level12'] += ` ${gGame.secsPassed}`
                    renderBestScores('level12')
    
                default:
                    break;
            }
        }

    } else {
        elRestart.innerText = DEAD
    }
    gGame.isOn = false
}


function mark(i, j) {
    gRecentBoards.push(copyBoard(gBoard))
    var gameCopy = copyObj(gGame)
    gRecenGameStats.push(gameCopy)
    if (!gGame.isOn) return
    if (gIsFirst) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--
    } else {
        cell.isMarked = true
        gGame.markedCount++
        renderBoard()
        if (winCheck()) return gameOver(true)
    }
    renderBoard()
}

function renderTime() {
    var currTime = Date.now()
    var elLogScreen = document.querySelector('.display .value')
    var timePassed = currTime - gTime
    gGame.secsPassed = (timePassed / 1000).toFixed(2)
    elLogScreen.innerText = `${gGame.secsPassed}`
}





function setMinesManual(i, j) {
    if (!gIsManual) return
    var cell = gBoard[i][j]
    gLevel.MINES++
    cell.isMine = true
    cell.isShown = true
    gLevel.MINES
    renderBoard()

}


function initManualGame() {
    gIsFirst = false
    gIsManual = false
    allowHints()
    allowSafeClick()
    countMinesNegs()
    setMinesNegsCount()
    // adding for the Undo
    gRecentBoards.push(copyBoard(gBoard))
    var gameCopy = copyObj(gGame)
    gRecenGameStats.push(gameCopy)

    gTime = Date.now()
    gTimeInterval = setInterval(renderTime, 10)
}

function renderBestScores(level) {
    var elScoresHead = document.querySelector('.scores-head span')
    var elOl = document.querySelector('ol')
    elScoresHead.innerText = `(${gLevel.SIZE}x${gLevel.SIZE})`
    if (!localStorage[level]) return
    var scoresArray = localStorage[level]
    scoresArray = scoresArray.split(' ')
    scoresArray.sort(function (a, b) { return parseFloat(a) - parseFloat(b) })
    elOl.innerHTML = ''
    for (var i = 1; i < scoresArray.length; i++) {
        elOl.innerHTML += `<li>  ${scoresArray[i]} sec`
        elOl.innerHTML += `</li> `

    }
}
