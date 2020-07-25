function setDifficulty(elBtn) {
    if (!gGame.isOn || gGame.shownCount > 0 || gGame.secsPassed > 0 || !gIsFirst || gIsManual) return
    toggleDiffBtnsColor(elBtn)
    var btnClassName = elBtn.className
    if (btnClassName === 'easy-btn') {
        gLevel.SIZE = 4;
        renderBestScores('level4')
        gLevel.MINES = 2
    } else if (btnClassName === 'medium-btn') {
        gLevel.SIZE = 8;
        renderBestScores('level8')
        gLevel.MINES = 12
    } else if (btnClassName === 'hard-btn') {
        gLevel.SIZE = 12;
        renderBestScores('level12')
        gLevel.MINES = 30
    }
    gGame.shownCount = 0
    gGame.markedCount = 0
    gCorrectMarks = 0
    gBoard = createBoard()
    renderBoard()
}


function initHints() {
    if (gElHintClicked) {
        gElHintClicked.classList.remove('hint-mode')
    }
    var elHints = document.querySelectorAll('.hints span');
    for (var i = 0; i < elHints.length; i++) {
        var elHint = elHints[i]
        if (elHint.classList.contains('hint-mode')) {
            elHint.classList.remove('hint-mode')
        }
        elHint.style.display = 'inline'
        elHint.style.cursor = 'auto'
        elHint.style.opacity = 0.4
    }
}

function allowHints() {
    var elHints = document.querySelectorAll('.hints span');
    for (var i = 0; i < elHints.length; i++) {
        var elHint = elHints[i]
        elHint.style.cursor = 'pointer'
        elHint.style.opacity = 1

    }
}



function showHintCells(cellI, cellJ) {
    gElHintClicked.style.display = 'none'
    gElHintClicked = null
    var newShownCells = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            var currCell = gBoard[i][j];
            if (!currCell.isShown) {
                currCell.isShown = true;

                newShownCells.push(currCell);
            }
        }
    }
    renderBoard()
    setTimeout(hideHintCells, 1000, newShownCells)
}


function hideHintCells(shownCells) {
    for (var i = 0; i < shownCells.length; i++) {
        var currCell = shownCells[i];
        currCell.isShown = false
    }
    renderBoard()
}


function renderHintsHtml(elHint) {
    if (gIsFirst) return
    var currHintName = elHint.className;
    if (gElHintClicked) {
        if (gElHintClicked.className === currHintName) {
            elHint.classList.remove('hint-mode');
            gElHintClicked = null
        } else {
            gElHintClicked.classList.remove('hint-mode')
            elHint.classList.add('hint-mode')
            gElHintClicked = elHint
        }

    } else {
        gElHintClicked = elHint
        elHint.classList.add('hint-mode')
    }
}


function undoMove() {
    if (!gGame.isOn) {
        var elRestart = document.querySelector('.restart-container p .restart')
        var elLogScreen = document.querySelector('.display .value')
        elLogScreen.innerText = '0.00'
        elRestart.innerText = NORMAL
        gGame.secsPassed = 0
        gGame.isOn = true
    }
    if (gIsFirst) return
    gIsUndo = true
    if (gRecenGameStats.length === 0) return
    // var currTime = gGame.secsPassed
    var prevMove = gRecentBoards.pop()
    var prevStats = gRecenGameStats.pop()
    reAssignObjValues(gGame, prevStats)

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var prevCell = prevMove[i][j]
            var currCell = gBoard[i][j]
            reAssignObjValues(currCell, prevCell)
        }
    }

    // gTime += (currTime - gGame.secsPassed) * 1000
    renderBoard()
}

function startManual(elManualBtn) {
    if (!gIsFirst) return
    var elGameContainer = document.querySelector('.game-container')
    var elOpenManual = document.querySelector('.open-manual')

    if (gIsManual) {
        elOpenManual.style.display = 'none'
        elManualBtn.style.display = 'none'
        gIsManual = false
        elGameContainer.classList.toggle('manual-mode')
        hideAllCells()
        renderBoard()
        return initManualGame()

    } else {
        gLevel.MINES = 0
        elOpenManual.style.display = 'block'
        elManualBtn.innerText = 'Start the game'
        gIsManual = true
        elGameContainer.classList.toggle('manual-mode')

    }

}

function startSafeClick(elSafeBtn) {
    if (!gGame.isOn) return
    if (gIsFirst) return
    if (gIsManual) return
    if (gSafeClicksLeft === 0) return
    var randSafeCell = getRandSafeCell()
    if (!randSafeCell) return
    gSafeClicksLeft--
    showSafeCell(randSafeCell)
    renderSafeClickBtn(elSafeBtn)


}


function showSafeCell(safeCell) {
    safeCell.isShown = true
    renderBoard()
    setTimeout(function () {
        safeCell.isShown = false
        renderBoard()
    }, 900)
}





function getRandSafeCell() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isShown && !currCell.isMine && !currCell.isMarked) {
                safeCells.push(currCell)
            }
        }
    }
    if (safeCells.length === 0) return null
    var randIdx = getRandomInt(0, safeCells.length);
    return safeCells[randIdx]
}

function renderSafeClickBtn(elSafeBtn) {
    var elClicksLeftSpan = elSafeBtn.querySelector('span')
    var opacity = (gSafeClicksLeft === 0) ? '0.4' : '1'
    elSafeBtn.style.opacity = opacity
    elClicksLeftSpan.innerText = gSafeClicksLeft
}

function initSafeClickBtn() {
    var elSafeBtn = document.querySelector('.safe-btn')
    elSafeBtn.style.opacity = '0.4'
    var elClicksLeftSpan = elSafeBtn.querySelector('span')
    elClicksLeftSpan.innerText = '3'
    elSafeBtn.style.cursor = 'auto'
}

function allowSafeClick() {
    var elSafeBtn = document.querySelector('.safe-btn')
    var elClicksLeftSpan = elSafeBtn.querySelector('span')
    elSafeBtn.style.opacity = '1'
    elClicksLeftSpan.innerText = '3'
    elSafeBtn.style.cursor = 'pointer'

}