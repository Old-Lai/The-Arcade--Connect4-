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
    defaultValues:{
        players: [1,2],
        curPlayer: 1,
        numOfRows: 6,
        numOfCols: 7
    },
    board: [],
    players: ['player1','player2'],
    curPlayer: 0,
    init: function(){
        initializeBoard(6, 7);
    }
}

const boardEle = document.querySelector('#board');

function initializeBoard(row, col){
    //creating board in array form
    //push col number of element inside one row
    let rowArr = []
    for(let i = 0; i < col; i++){
        rowArr.push(null);
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
            if(boardVal != null){
                cell.classList.add(state.players[boardVal])
            }
            cell.dataset.row = i;
            cell.dataset.col = j;
            boardEle.appendChild(cell);
        }
    }
}

//returns true if piece dropped successfully, false if column is full
function dropPiece(player, col){
    for(let i = state.board.length-1; i >= 0; i--){
        if(state.board[i][col] === null){
            state.board[i][col] = player;
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
}

function checkHorizontalWin(){
    let winObj = {lastCheckedStatus: null,
                  count: 0,
                  coordinate: []};
    
    //check from bottoms up, right to left
    for(let row = state.board.length - 1; row >= 0; row--){
        for(let col = state.board[0].length - 1; col >= 0; col--){
            if(state.board[row][col] !== null){
                if(winObj.lastCheckedStatus !== state.board[row][col]){
                    winObj.lastCheckedStatus = state.board[row][col];
                    winObj.count = 1;
                    winObj.coordinate.push([row, col]);
                } else {
                    winObj.count++;
                }

                if(winObj.count >= 4){
                    console.log(`Player ${state.board[row][col] + 1} Won!!!`);
                    return winObj;
                }

            } else {
                winObj = {lastCheckedStatus: null,
                          count: 0,
                          coordinate: []};
            }
        }
    }
    return null;
}

function checkVerticalWin(){
    let winObj = {lastCheckedStatus: null,
        count: 0,
        coordinate: []};

    //check from bottoms up, right to left
    for(let col = state.board[0].length - 1; col >= 0; col ++){
        for(let row = state.board.length - 1; row >= 0; row--){

        }
    }
}

boardEle.addEventListener('click', function(event){
    if(event.target.classList.contains('piece')){
        let row = event.target.dataset.row;
        let col = event.target.dataset.col;
        console.log(row,col)
        dropPiece(state.curPlayer, col);
        checkHorizontalWin();
        nextPlayer();
    }
})

state.init();