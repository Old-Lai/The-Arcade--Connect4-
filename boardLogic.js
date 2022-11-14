/*
 * the board order goes like this
 * col[0] | col[1] | col[2] | ... | col[n]
 * 
 * row[m]
 * ------
 * ...
 * ------
 * row[2]
 * ------
 * row[1]
 * ------
 * row[0]
 * 
 * logic goes like 0 = empty cells, 1 = player1, 2 = player2
 */
let state = {
    board: [],
    players: ['player1','player2'],
    playerName: ['Player1','Player2'],
    curPlayer: 0,
    computerPlayAs: -1,
    computerWaitTime: 3,
    computerThinking: false,
    someoneWon: false,
    numOfRows: 6,
    numOfCols: 7,
    init: function(){
        initializeBoard(this.numOfRows, this.numOfCols);
    },
    reset: function(){
        this.board = [];
        this.playerName = ['', ''];
        this.curPlayer = 0;
        this.computerPlayAs = -1;
        this.computerThinking = false;
        this.someoneWon = false;
    }
}

const boardEle = document.querySelector('.board');
const menuEle = document.querySelector(".menu");
const gameEle = document.querySelector(".gameSection");
const messageEle = document.querySelector(".message");
const player1InputEle = document.querySelector(".nameInput1");
const player2InputEle = document.querySelector(".nameInput2");
const resetButton = document.querySelector(".reset")
let winIntervalId = false;

function initializeBoard(row, col){
    //creating board in array form
    //push col number of element inside one row
    let rowArr = []
    for(let i = 0; i < col; i++){
        rowArr.push('');
    }

    //pushing rowArr into rows completing our board
    for(let i = 0; i < row; i++){
        state.board.push([...rowArr]);
    }

    renderBoard();
}

function renderBoard(){
    //creating board in html form
    boardEle.innerHTML = '';
    for(let i = 0; i < state.board.length; i++){
        for(let j = 0; j < state.board[0].length; j++){
            const cell = document.createElement('div');
            cell.classList.add('piece');
            let boardVal = state.board[i][j];
            if(boardVal !== ''){
                cell.classList.add(state.players[boardVal])
            }
            cell.dataset.row = i;
            cell.dataset.col = j;
            boardEle.appendChild(cell);
        }
    }
}

//returns true if piece dropped successfully, false if column is full
function dropPiece(col, inBoard){
    for(let i = inBoard.length-1; i >= 0; i--){
        if(inBoard[i][col] === ''){
            inBoard[i][col] = state.curPlayer;
            renderBoard();
            return true;
        }
    }
    return false;
}

function nextPlayer(){
    if(state.curPlayer === 0){
        state.curPlayer = 1;
    } else {
        state.curPlayer = 0;
    }

    messageEle.textContent = `${state.playerName[state.curPlayer]}'s turn`;
}

function checkHorizontalWin(inBoard){
    let winObj = {lastCheckedStatus: '',
                  count: 0,
                  coordinate: []};
    
    //check from right to left, bottoms up
    for(let row = inBoard.length - 1; row >= 0; row--){
        for(let col = inBoard[0].length - 1; col >= 0; col--){
            if(inBoard[row][col] !== ''){
                if(winObj.lastCheckedStatus !== inBoard[row][col]){
                    winObj.lastCheckedStatus = inBoard[row][col];
                    winObj.count = 1;
                    winObj.coordinate.push([row, col]);
                } else {
                    winObj.count++;
                    winObj.coordinate.push([row, col]);
                }

                if(winObj.count >= 4){
                    console.log(`Player ${winObj.lastCheckedStatus + 1} Won!!!`);
                    console.log(winObj)
                    return winObj;
                }

            } else {
                winObj = {lastCheckedStatus: '',
                          count: 0,
                          coordinate: []};
            }
        }
    }
    return false;
}

function checkVerticalWin(inBoard){
    let winObj = {lastCheckedStatus: '',
        count: 0,
        coordinate: []};

    //check from bottoms up, right to left
    for(let col = inBoard[0].length - 1; col >= 0; col--){
        for(let row = inBoard.length - 1; row >= 0; row--){
            if(inBoard[row][col] !== ''){
                if(winObj.lastCheckedStatus !== inBoard[row][col]){
                    winObj.lastCheckedStatus = inBoard[row][col];
                    winObj.count = 1;
                    winObj.coordinate.push([row, col]);
                } else {
                    winObj.count++;
                    winObj.coordinate.push([row, col]);
                }

                if(winObj.count >= 4){
                    console.log(`Player ${winObj.lastCheckedStatus + 1} Won!!!`);
                    console.log(winObj)
                    return winObj;
                }

            } else {
                winObj = {lastCheckedStatus: '',
                          count: 0,
                          coordinate: []};
            }
        }
        winObj = {lastCheckedStatus: '',
                          count: 0,
                          coordinate: []};
    }
    return false
}

function checkDiagonalWin(inBoard){
    let boardShiftLeft = [];
    let boardShiftRight = [];
    let leftiInValidWinningCoordinate = []; //use to check for wins that looped through the sides
    let rightiInValidWinningCoordinate = [];

    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            leftiInValidWinningCoordinate.push([i, j + 4]);
            rightiInValidWinningCoordinate.push([i, j]);
        }
    }

    for(let row = 0; row < inBoard.length; row++){
        boardShiftLeft.push(inBoard[row].slice());
        boardShiftRight.push(inBoard[row].slice());
    }
    //create a board that rotated rowIndex amount of elements to the left for each row
    //this way, all left diagonals will become a horizontal (we can then use horizontal win check)
    for(let row = 1; row < inBoard.length; row++){
        for(let shiftAmt = 0; shiftAmt < row; shiftAmt++){
            boardShiftLeft[row].push(boardShiftLeft[row].shift());
            boardShiftRight[row].unshift(boardShiftRight[row].pop());
        }
    }

    let leftDiagonalWinObj = checkVerticalWin(boardShiftLeft);
    let rightDiagonalWinObj = checkVerticalWin(boardShiftRight);
    if(leftDiagonalWinObj){
        //reverse the shift for the stored coordinate to show the correct pieces
        for(let i = 0; i < leftDiagonalWinObj.coordinate.length; i++){
            leftDiagonalWinObj.coordinate[i][1] = Math.abs(leftDiagonalWinObj.coordinate[i][0] + leftDiagonalWinObj.coordinate[i][1]) % inBoard[0].length;
        }
        
        if(leftDiagonalWinObj.coordinate.some(ele => leftiInValidWinningCoordinate.includes(ele))){
            return false;
        }

        return leftDiagonalWinObj;
    } else if(rightDiagonalWinObj){
        for(let i = 0; i < rightDiagonalWinObj.coordinate.length; i++){
            rightDiagonalWinObj.coordinate[i][1] = Math.abs(rightDiagonalWinObj.coordinate[i][0] - rightDiagonalWinObj.coordinate[i][1]) % inBoard[0].length;
        }

        if(rightDiagonalWinObj.coordinate.some(ele => rightiInValidWinningCoordinate.includes(ele))){
            return false;
        }
        return rightDiagonalWinObj;
    }
    return false;
}

//returns an object containing winning informations, otherwise return false if no winning move found
function checkWin(inBoard){
    let winObj = '';

    winObj = checkHorizontalWin(inBoard);
    if(winObj){
        return winObj;
    }

    winObj = checkVerticalWin(inBoard);
    if(winObj){
        return winObj;
    }

    winObj = checkDiagonalWin(inBoard);
    if(winObj){
        return winObj;
    }

    return false;
}

function showWinningPieces(winObj){
    if(winObj){
        winIntervalId = setInterval(function(){
            for(let coor = 0; coor < winObj.coordinate.length; coor++){
                if(state.board[winObj.coordinate[coor][0]][winObj.coordinate[coor][1]] !== ''){
                    state.board[winObj.coordinate[coor][0]][winObj.coordinate[coor][1]] = '';
                } else {
                    state.board[winObj.coordinate[coor][0]][winObj.coordinate[coor][1]] = state.curPlayer;
                }
            }
            renderBoard();
        }, 500)
    }
}

function computerMoveDecider(){
    let availableCol = []
    for(let i = 0; i < state.board[0].length; i++){
        if(state.board[0][i] === ''){
            availableCol.push(i);
        }
    }
    //set the drop column to a random column
    let dropCol = availableCol[Math.floor(Math.random() * availableCol.length)];
    let nextMoveBoard;
    //check if there is a winning move
    for(let i = 0; i < state.board[0].length; i++){
        nextMoveBoard = [];
        //make a copy of the board to test next move
        for(let row = 0; row < state.board.length; row++){
            nextMoveBoard.push(state.board[row].slice());
        }

        if(dropPiece(i, nextMoveBoard) && checkWin(nextMoveBoard)){
            //set drop column to the winning move's column
            dropCol = i;
            break;
        }
    }

    return dropCol
}

function computerMoveDelay(){
    state.computerThinking = true;
    let count = 0;
    let intervalId = setInterval(function(){
        if(count < state.computerWaitTime){
            messageEle.textContent = messageEle.textContent + '.'
            count++;
        } else {
            state.computerThinking = false;
            dropPiece(computerMoveDecider(), state.board);
            let winObj = checkWin(state.board);
            if(winObj){
                showWinningPieces(winObj);
                state.someoneWon = true;
                messageEle.textContent = 'Computer has won!!!'
            } else {
                nextPlayer();
            }
            clearInterval(intervalId);
        }
    }, 1000)
}

boardEle.addEventListener('click', function(event){
    if(event.target.classList.contains('piece')){
        if(!state.someoneWon && !state.computerThinking){
            let col = event.target.dataset.col;
            if(dropPiece(col, state.board)){
                let winObj = checkWin(state.board);
                if(winObj){
                    showWinningPieces(winObj);
                    state.someoneWon = true;
                    messageEle.textContent = `${state.playerName[state.curPlayer]} has won!!!`
                } else {
                    nextPlayer();
                }
                
            } else {
                messageEle.textContent = `That column is full, choose another column ${state.playerName[state.curPlayer]}`;
            }
            if(state.curPlayer === state.computerPlayAs){
                computerMoveDelay();
            }
        }
    }
})

//menu section ------------------------------------------------------------------
function changeMode(){
    if(state.computerPlayAs === -1){
        messageEle.textContent = 'Current mode: Player vs Computer';
        state.computerPlayAs = 1;
        state.playerName[1] = 'Computer';
        player2InputEle.style.opacity = '1';
        player2InputEle.disabled = true;
        let intervalId = setInterval(function(){
            if(parseFloat(player2InputEle.style.opacity) > 0){
                player2InputEle.style.opacity = `${parseFloat(player2InputEle.style.opacity) - 0.01}`;
            } else {
                clearInterval(intervalId);
            }
        }, 5)
    } else {
        messageEle.textContent = 'Current mode: Player vs Player';
        state.computerPlayAs = -1;
        state.playerName[1] = '';
        player2InputEle.style.opacity = '0';
        player2InputEle.disabled = false;
        let intervalId = setInterval(function(){
            if(parseFloat(player2InputEle.style.opacity) < 1){
                player2InputEle.style.opacity = `${parseFloat(player2InputEle.style.opacity) + 0.01}`;
            } else {
                clearInterval(intervalId);
            }
        }, 5)
    }
}

function firstMoveSetup(){
    state.curPlayer = Math.floor(Math.random() * 2);
    console.log(state.curPlayer)
    
    if(state.computerPlayAs === -1){
        messageEle.textContent = `Lets start with ${state.playerName[state.curPlayer]}`
    } else if (state.curPlayer === state.computerPlayAs){
        messageEle.textContent = 'Computer is placing a piece';
        computerMoveDelay();
    } else {
        messageEle.textContent = `Lets start with ${state.playerName[state.curPlayer]}`
    }
}

function saveNames(){
    let player1Name = player1InputEle.value;
    let player2Name = player2InputEle.value;

    if(player1Name === ''){
        player1Name = 'Player 1'
    }

    if(player2Name === ''){
        player2Name = 'Player 2'
    }

    if(state.computerPlayAs === -1){
        state.playerName[0] = player1Name;
        state.playerName[1] = player2Name;
    } else {
        state.playerName[0] = player1Name;
        state.playerName[1] = 'Computer'
    }
}

function switchDisplay(){
    if(gameEle.classList.contains('hidden')){
        menuEle.style.opacity = '1';
        let menuIntervalId = setInterval(function(){
            if(parseFloat(menuEle.style.opacity) > 0){
                menuEle.style.opacity = `${parseFloat(menuEle.style.opacity) - 0.01}`;
            } else {
                menuEle.classList.toggle('hidden');
                gameEle.classList.toggle('hidden');
                gameEle.style.opacity = '0';
                let boardIntervalId = setInterval(function(){
                if(parseFloat(gameEle.style.opacity) < 1){
                    gameEle.style.opacity = `${parseFloat(gameEle.style.opacity) + 0.01}`;
                } else {
                    clearInterval(boardIntervalId);
                }
                }, 20)
                clearInterval(menuIntervalId);
            }
        }, 10)
    } else {
        gameEle.style.opacity = '1';
        let boardIntervalId = setInterval(function(){
            if(parseFloat(gameEle.style.opacity) > 0){
                gameEle.style.opacity = `${parseFloat(gameEle.style.opacity) - 0.01}`;
            } else {
                gameEle.classList.toggle('hidden');
                menuEle.classList.toggle('hidden');
                menuEle.style.opacity = '0';
                let menuIntervalId = setInterval(function(){
                    if(parseFloat(menuEle.style.opacity) < 1){
                        menuEle.style.opacity = `${parseFloat(menuEle.style.opacity) + 0.01}`;
                    } else {
                        clearInterval(menuIntervalId)
                    }
                }, 10)
                state.reset();
                clearInterval(boardIntervalId);
            }
        }, 20)
    }
}

menuEle.addEventListener('click', function(event){
    if(event.target.dataset.name === 'startButton'){
        console.log('start');
        state.init();
        switchDisplay();
        saveNames();
        firstMoveSetup();
    } else if (event.target.dataset.name === 'modeButton'){
        changeMode();
    }
})

resetButton.addEventListener('click', function(){
    if(!state.computerThinking){
        if(winIntervalId){
            clearInterval(winIntervalId);
        }
        switchDisplay();
        if(state.computerPlayAs === -1){
            state.computerPlayAs = 1;
        }
        changeMode();
    }
})