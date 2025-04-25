document.addEventListener('DOMContentLoaded', () => {
    const BOARD_SIZE = 8;
    const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const STRIPED_COLORS = ['striped-red-horizontal', 'striped-red-vertical', 'striped-blue-horizontal', 'striped-blue-vertical', 'striped-green-horizontal', 'striped-green-vertical', 'striped-yellow-horizontal', 'striped-yellow-vertical', 'striped-purple-horizontal', 'striped-purple-vertical', 'striped-orange-horizontal', 'striped-orange-vertical'];

    const CANDY = 'candy';
    const CHOCOLATE = 'chocolate';
    
    let board = [];
    let selectedCandy = null;
    let score = 0;
    let turnsLeft = 20;
    let isProcessing = false;
    
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const turnsDisplay = document.getElementById('turns');
    const gameOverDisplay = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');

    function handleComboSwap(row1, col1, candy1, row2, col2, candy2) {
        const isChocolate1 = candy1 === CHOCOLATE;
        const isChocolate2 = candy2 === CHOCOLATE;
        const isStriped1 = candy1?.startsWith('striped-');
        const isStriped2 = candy2?.startsWith('striped-');
        const isWrapped1 = candy1?.startsWith('wrapped');
        const isWrapped2 = candy2?.startsWith('wrapped');
    
        const baseColor1 = getBaseColor(candy1);
        const baseColor2 = getBaseColor(candy2);
    
        if (isChocolate1 && isChocolate2) {
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    board[r][c] = null;
                }
            }
            score += 200;
            return true;
        }
    
        if (isChocolate1 || isChocolate2) {
            const targetColor = isChocolate1 ? baseColor2 : baseColor1;
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (getBaseColor(board[r][c]) === targetColor) {
                        board[r][c] = null;
                    }
                }
            }
            score += 100;
            return true;
        }
    
        if (isStriped1 && isStriped2) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                board[row1][c] = null;
            }
            for (let r = 0; r < BOARD_SIZE; r++) {
                board[r][col2] = null;
            }
            score += 60;
            return true;
        }
    
        if (isWrapped1 && isWrapped2) {
            const centerRow = Math.floor((row1 + row2) / 2);
            const centerCol = Math.floor((col1 + col2) / 2);
            for (let r = centerRow - 2; r <= centerRow + 2; r++) {
                for (let c = centerCol - 2; c <= centerCol + 2; c++) {
                    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                        board[r][c] = null;
                    }
                }
            }
            score += 80;
            return true;
        }
    
        if ((isStriped1 && isWrapped2) || (isWrapped1 && isStriped2)) {
            const rows = [row1 - 1, row1, row1 + 1].filter(r => r >= 0 && r < BOARD_SIZE);
            const cols = [col1 - 1, col1, col1 + 1].filter(c => c >= 0 && c < BOARD_SIZE);
            rows.forEach(r => {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    board[r][c] = null;
                }
            });
            cols.forEach(c => {
                for (let r = 0; r < BOARD_SIZE; r++) {
                    board[r][c] = null;
                }
            });
            score += 90;
            return true;
        }
    
        return false;
    }
    
    function initGame() {
        const oldCandies = document.querySelectorAll('.candy');
    oldCandies.forEach(candy => {
        candy.replaceWith(candy.cloneNode(true));
    });

        if (!gameBoard || !scoreDisplay || !turnsDisplay || !gameOverDisplay) {
            console.error('Required DOM elements not found');
            return;
        }
        score = 0;
        turnsLeft = 20;
        scoreDisplay.textContent = '0';
        turnsDisplay.textContent = turnsLeft;
        gameOverDisplay.style.display = 'none';
        gameBoard.innerHTML = '';
        
        createBoard();
        renderBoard();
        
        while (findMatches().length > 0) {
            const matches = findMatches();
            matches.forEach(pos => {
                board[pos.row][pos.col] = null;
            });
            fillBoard();
        }
    }
    
    function createBoard() {
        board = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            board[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                board[row][col] = getRandomColor();
            }
        }
    }
    
    function getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    
    function renderBoard() {
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const candy = document.createElement('div');
                candy.className = `candy ${board[row][col]}`;
                candy.dataset.row = row;
                candy.dataset.col = col;
                
                candy.addEventListener('click', () => handleCandyClick(row, col));
                
                gameBoard.appendChild(candy);
            }
        }
    }

    function getBaseColor(candy) {
        if (!candy) return null;
        if (candy.startsWith('wrapped ')) {
            return candy.split(' ')[1];
        } else if (candy.startsWith('striped-')) {
            return candy.split('-')[1];
        } else {
            return candy;
        }
    }    
    
    function handleCandyClick(row, col) {
        if (isProcessing || turnsLeft <= 0) return;
        
        const clickedCandy = board[row][col];
        
        if (!selectedCandy) {
            selectedCandy = { row, col, color: clickedCandy };
            highlightCandy(row, col, true);
        } else {
            if ((Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) || 
                (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row)) {
                highlightCandy(selectedCandy.row, selectedCandy.col, false);
                swapCandies(selectedCandy.row, selectedCandy.col, row, col);
                selectedCandy = null;
            } else {
                highlightCandy(selectedCandy.row, selectedCandy.col, false);
                selectedCandy = null;
                handleCandyClick(row, col);
            }
        }
    }
    
    function highlightCandy(row, col, highlight) {
        const candies = document.querySelectorAll('.candy');
        const index = row * BOARD_SIZE + col;
        candies[index].classList.toggle('selected', highlight);
    }
    
    function swapCandies(row1, col1, row2, col2) {
        isProcessing = true;
        
        [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
        
        renderBoard();

        const candy1 = board[row1][col1];
const candy2 = board[row2][col2];

if (handleComboSwap(row1, col1, candy1, row2, col2, candy2)) {
    renderBoard();
    setTimeout(() => {
        fillBoard();
        let cascadeMatches = findMatches();
        while (cascadeMatches.length > 0) {
            clearMatches();
            fillBoard();
            cascadeMatches = findMatches();
        }
        isProcessing = false;
    }, 500);
    return;
}

        
        const matches = findMatches();
        
        if (matches.length > 0) {

            turnsLeft--;
            turnsDisplay.textContent = turnsLeft;

            if (turnsLeft <= 0) {
                setTimeout(() => endGame(), 500);
            }
            
            setTimeout(async () => { 
                clearMatches();
                fillBoard();
                
                let cascadeMatches = findMatches();
                while (cascadeMatches.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    clearMatches();
                    fillBoard();
                    cascadeMatches = findMatches();
                }
                isProcessing = false;
            }, 500);
        } else {
            setTimeout(() => {
                [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
                renderBoard();
                isProcessing = false;
            }, 500);
        }
    }
    
    function findMatches() {
        const matches = [];
    
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const baseColor = getBaseColor(board[row][col]);
                if (
                    baseColor &&
                    baseColor === getBaseColor(board[row][col + 1]) &&
                    baseColor === getBaseColor(board[row][col + 2])
                ) {
                    let match = [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }];
    
                    if (
                        col < BOARD_SIZE - 3 &&
                        baseColor === getBaseColor(board[row][col + 3])
                    ) {
                        match.push({ row, col: col + 3 });
                        if (
                            col < BOARD_SIZE - 4 &&
                            baseColor === getBaseColor(board[row][col + 4])
                        ) {
                            match.push({ row, col: col + 4 });
                        }
                    }
    
                    match.forEach(pos => {
                        if (!matches.some(m => m.row === pos.row && m.col === pos.col)) {
                            matches.push(pos);
                        }
                    });
    
                    col += match.length - 1;
                }
            }
        }
    
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE - 2; row++) {
                const baseColor = getBaseColor(board[row][col]);
                if (
                    baseColor &&
                    baseColor === getBaseColor(board[row + 1][col]) &&
                    baseColor === getBaseColor(board[row + 2][col])
                ) {
                    let match = [{ row, col }, { row: row + 1, col }, { row: row + 2, col }];
    
                    if (
                        row < BOARD_SIZE - 3 &&
                        baseColor === getBaseColor(board[row + 3][col])
                    ) {
                        match.push({ row: row + 3, col });
                        if (
                            row < BOARD_SIZE - 4 &&
                            baseColor === getBaseColor(board[row + 4][col])
                        ) {
                            match.push({ row: row + 4, col });
                        }
                    }
    
                    match.forEach(pos => {
                        if (!matches.some(m => m.row === pos.row && m.col === pos.col)) {
                            matches.push(pos);
                        }
                    });
    
                    row += match.length - 1;
                }
            }
        }
    
        for (let row = 0; row < BOARD_SIZE - 1; row++) {
            for (let col = 0; col < BOARD_SIZE - 1; col++) {
                const baseColor = getBaseColor(board[row][col]);
                if (
                    baseColor &&
                    baseColor === getBaseColor(board[row][col + 1]) &&
                    baseColor === getBaseColor(board[row + 1][col]) &&
                    baseColor === getBaseColor(board[row + 1][col + 1])
                ) {
                    const squareMatch = [
                        { row, col },
                        { row, col: col + 1 },
                        { row: row + 1, col },
                        { row: row + 1, col: col + 1 }
                    ];
    
                    squareMatch.forEach(pos => {
                        if (!matches.some(m => m.row === pos.row && m.col === pos.col)) {
                            matches.push(pos);
                        }
                    });
                }
            }
        }
    
        return matches;
    }
    
    
function clearMatches() {
    const matches = findMatches();

    if (matches.length === 0) return;

    const matchGroups = groupMatches(matches);

    matchGroups.forEach(group => {
        const baseScore = 10;
        const multiplier = group.positions.length - 2;
        score += baseScore * multiplier * multiplier;

        let stripedTrigger = null;
        let wrappedTrigger = null;

        for (const pos of group.positions) {
            const val = board[pos.row][pos.col];
            if (val && val.startsWith('striped-')) {
                stripedTrigger = { ...pos, val };
            }
            if (val && val.startsWith('wrapped')) {
                wrappedTrigger = { ...pos, val };
            }
        }

        const isColorMatch = group.positions.every(p => {
            const val = board[p.row][p.col];
            return val && (val.includes(group.color) || val === group.color);
        });

        if (stripedTrigger && isColorMatch) {
            const isHorizontal = stripedTrigger.val.includes('horizontal');
            if (isHorizontal) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    board[stripedTrigger.row][c] = null;
                }
            } else {
                for (let r = 0; r < BOARD_SIZE; r++) {
                    board[r][stripedTrigger.col] = null;
                }
            }
            score += 30;
        }

        if (wrappedTrigger && isColorMatch) {
            const centerRow = wrappedTrigger.row;
            const centerCol = wrappedTrigger.col;
            for (let r = centerRow - 1; r <= centerRow + 1; r++) {
                for (let c = centerCol - 1; c <= centerCol + 1; c++) {
                    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                        board[r][c] = null;
                    }
                }
            }
            score += 50;
        }

        if (!stripedTrigger && !wrappedTrigger) {
            group.positions.forEach(pos => {
                board[pos.row][pos.col] = null;
            });

            if (group.positions.length === 4 || group.positions.length === 5) {
                createSpecialCandy(group);

                const middlePos = group.positions[Math.floor(group.positions.length / 2)];
                group.positions = group.positions.filter(pos =>
                    !(pos.row === middlePos.row && pos.col === middlePos.col)
                );
            }
        }
    });

    scoreDisplay.textContent = score;
    renderBoard();
}


    
    function groupMatches(matches) {
        
        const groups = [];
        const processed = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
        
        for (const match of matches) {
            if (processed[match.row][match.col]) continue;
            
            const color = getBaseColor(board[match.row][match.col]);
            const group = { color, positions: [] };
            const queue = [match];
            
            while (queue.length > 0) {
                const current = queue.shift();
                if (processed[current.row][current.col]) continue;
                
                processed[current.row][current.col] = true;
                group.positions.push(current);
                
                const directions = [
                    { row: -1, col: 0 }, 
                    { row: 1, col: 0 }, 
                    { row: 0, col: -1 }, 
                    { row: 0, col: 1 }  
                ];
                
                for (const dir of directions) {
                    const newRow = current.row + dir.row;
                    const newCol = current.col + dir.col;
                    
                    if (newRow >= 0 && newRow < BOARD_SIZE && 
                        newCol >= 0 && newCol < BOARD_SIZE && 
                        !processed[newRow][newCol] && 
                        getBaseColor(board[newRow][newCol]) === color) {
                        queue.push({ row: newRow, col: newCol });
                    }
                }
            }
            
            if (group.positions.length >= 3) {
                groups.push(group);
            }
        }
        
        return groups;
    }
    
    function createSpecialCandy(group) {
        const positions = group.positions;
        const colorIndex = COLORS.indexOf(group.color);
        const middlePos = positions[Math.floor(positions.length / 2)];
        
        const isHorizontal = positions.every((p, i, arr) => 
            i === 0 || p.row === arr[0].row
        );
        const isSquare = positions.length === 4 && 
        positions.some(p1 => 
            positions.some(p2 => 
                Math.abs(p1.row - p2.row) === 1 && 
                Math.abs(p1.col - p2.col) === 1
            )
        );
        
        if (positions.length === 5) {

            if (Math.random() < 0.5) {
                board[middlePos.row][middlePos.col] = CHOCOLATE;
            } else {
                board[middlePos.row][middlePos.col] = 
                    STRIPED_COLORS[colorIndex * 2 + (isHorizontal ? 0 : 1)];
            }
        } else if (positions.length === 4) {
            if (isSquare) {

                board[middlePos.row][middlePos.col] = `wrapped ${group.color}`;
            } else {

                const isHorizontal = positions.every((p, i, arr) => 
                    i === 0 || p.row === arr[0].row
                );
                board[middlePos.row][middlePos.col] = 
                    STRIPED_COLORS[colorIndex * 2 + (isHorizontal ? 0 : 1)];
            }
        }
    }
    
    function fillBoard() {
        let needsRefill = true;
        let safetyCounter = 0;
        const MAX_ITERATIONS = 100;
        
        while (needsRefill && safetyCounter < MAX_ITERATIONS) {
            needsRefill = false;
            safetyCounter++;
            
            for (let col = 0; col < BOARD_SIZE; col++) {
                for (let row = BOARD_SIZE - 1; row > 0; row--) {
                    if (board[row][col] === null) {

                        for (let above = row - 1; above >= 0; above--) {
                            if (board[above][col] !== null) {

                                board[row][col] = board[above][col];
                                board[above][col] = null;
                                needsRefill = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[0][col] === null) {
                    board[0][col] = getRandomColor();
                    needsRefill = true;
                }
            }
        }
        
        renderBoard();
    }
    
    function handleSpecialCandy(row, col, color) {
        if (color === CHOCOLATE) {

            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    const candy = board[r][c];
                    if (candy === randomColor || 
                        (candy && candy.includes(randomColor) && candy.startsWith('striped-'))) {
                        board[r][c] = null;
                    }
                }
            }
            score += 50;
        } else if (color.startsWith('striped-')) {

            const isHorizontal = color.includes('horizontal');
            
            if (isHorizontal) {

                for (let c = 0; c < BOARD_SIZE; c++) {
                    board[row][c] = null;
                }
            } else {

                for (let r = 0; r < BOARD_SIZE; r++) {
                    board[r][col] = null;
                }
            }
            score += 30;
        }
        scoreDisplay.textContent = score;
    }
    
    function endGame() {
        gameOverDisplay.style.display = 'block';
        finalScoreDisplay.textContent = score;
    
        const gameOverText = gameOverDisplay.querySelector('h2');
        gameOverText.textContent = 'Game Over – No more moves left!';
    }
    
    restartBtn.addEventListener('click', initGame);
    
    initGame();
});