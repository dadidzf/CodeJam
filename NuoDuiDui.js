let ROW = 8; // 行数
let COL = 6; // 列数
let INIT_MIN_PAIR = 3; // 初始数组最少多少个队子 
let INIT_MAX_PAIR = 7; // 初始数组最多允许多少个对子
let MAX_PLAY_TIMES = 1000; // 一个数组最多测试多少次

let FIND_ANSWER_LOG_MUTE = true;

// 查找答案算法，打印函数，方便屏蔽
let findAnswerLog = function (...args) {
    if (!FIND_ANSWER_LOG_MUTE) {
        console.log(...args);
    }
}


// 洗牌算法
let shuffleArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交换元素
    }
    return array;
}

let generateMahjongArr = function () {
    // 生成麻将数组
    let arr = []
    let num = 0;
    let totalGrids = ROW * COL;
    let maxNum = totalGrids / 4;
    for (var i = 0; i < totalGrids; i++) {
        arr.push(num++ % maxNum + 1)
    }

    // 随机洗牌
    shuffleArray(arr)
    return arr;
}


// 转化为二维数组
let convertTo2D = function (arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

let printBoard = function (arr, maxRow) {
    for (var i = 0; i < maxRow; i++) {
        console.log(arr[i])
    }
}

// 行号是否合法
let isValidRow = function (r, maxRow) {
    if (r >= 0 && r < maxRow) {
        return true;
    }
    else {
        return false;
    }
}

// 列号是否合法
let isValidCol = function (c, maxCol) {
    if (c >= 0 && c < maxCol) {
        return true;
    }
    else {
        return false;
    }
}

// 查找答案，去重
let findAnswers = function (boardArr, maxRow, maxCol, retIfFindOne) {
    let total = maxRow * maxCol;
    let answerInfo = {};
    let answers = [];
    answerInfo.answers = answers;
    answerInfo.tryBlockCnt = 0;
    // 查找随机答案
    let startIndex = Math.floor(Math.random() * total);
    for (var i = 0; i < total; i++) {
        let realIndex = (startIndex + i) % total;
        let startRow = Math.floor(realIndex / maxCol);
        let startCol = realIndex % maxCol;
        if (boardArr[startRow][startCol] === -1) {
            continue;
        }
        answerInfo.tryBlockCnt++;
        let answer = {};
        answer.start = [startRow, startCol];
        answer.dests = [];
        findAnswerLog("startRow ---- startCol ---- ", startRow, startCol);

        // 尝试在4个方向上找答案
        let randomNum = Math.floor(Math.random() * 4);
        for (var dir = 0; dir < 4; dir++) {
            let realDir = (dir + randomNum) % 4;
            // 随机4个方向探索 (0, -1), (0, 1), (-1, 0), (1, 0)
            let rowDir = realDir % 2 === 0 ? (realDir - 1) : 0;
            let colDir = realDir % 2 === 1 ? (realDir - 2) : 0;

            // 获取可推动步数
            let pushStep = 0;
            let mahjongCnt = 0;
            while (1) {
                let curRow = startRow + (pushStep + 1 + mahjongCnt) * rowDir;
                let curCol = startCol + (pushStep + 1 + mahjongCnt) * colDir;
                if (isValidRow(curRow, ROW) && isValidCol(curCol, COL)) {
                    if (boardArr[curRow][curCol] === -1) { // 空格子
                        pushStep++;
                    }
                    else {
                        // 碰到了一个麻将，之前已经有空格子，那么不再能推动
                        if (pushStep > 0) {
                            break;
                        }
                        else {
                            // 带着遇到的麻将一起推
                            mahjongCnt++;
                            continue;
                        }
                    }
                }
                else {
                    // 行列超出，不再可推
                    if (pushStep <= 0) {
                        mahjongCnt = 0; // 麻将间隔无效
                    }
                    break;
                }
            }

            // 随机选一个可推动步数循环所有
            let rand = Math.floor(Math.random() * (pushStep + 1));
            for (var step = 0; step <= pushStep; step++) {
                let randStep = (step + rand) % (pushStep + 1)
                let destRow;
                let destCol;
                if (randStep === 0) { // 0代表不推动麻将的匹配
                    // 去重，只往正方向走
                    if (rowDir < 0 || colDir < 0) {
                        continue;
                    }
                    // 直接判断当前方向相邻的麻将是否匹配
                    destRow = startRow + rowDir;
                    destCol = startCol + colDir;
                    if (isValidRow(destRow, ROW) && isValidCol(destCol, COL) && (boardArr[destRow][destCol] === boardArr[startRow][startCol])) {
                        findAnswerLog("findAnswer 111 destRow---- destCol---- ", destRow, destCol);
                        mahjongCnt = 0;
                        answer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                        if (retIfFindOne) {
                            answers.push(answer);
                            return answerInfo;
                        }
                        continue;
                    }

                    // 判断隔开pushStep个格子相对的那个麻将是否匹配, 无需推动麻将
                    destRow = startRow + (pushStep + 1) * rowDir;
                    destCol = startCol + (pushStep + 1) * colDir;
                    if (pushStep >= 1 && isValidRow(destRow, ROW) && isValidCol(destCol, COL) && (boardArr[destRow][destCol] === boardArr[startRow][startCol])) {
                        findAnswerLog("findAnswer 222 destRow---- destCol---- ", destRow, destCol);
                        mahjongCnt = 0;
                        answer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                        if (retIfFindOne) {
                            answers.push(answer);
                            return answerInfo;
                        }
                    }
                }
                else {
                    // 先将麻将推到目标位置，再去匹配
                    let beginRow = startRow + rowDir * randStep;
                    let beginCol = startCol + colDir * randStep;
                    let rowMul = 0;
                    let colMul = 0;
                    // 判定是匹配行还是匹配列
                    if (rowDir === 0) {
                        rowMul = 1;
                    }
                    else {
                        colMul = 1;
                    }
                    // 往两个方向查找匹配的麻将
                    for (var j = 0; j < 2; j++) {
                        let dir = [-1, 1][j];
                        cnt = 0;
                        while (1) {
                            cnt++;
                            destRow = beginRow + dir * cnt * rowMul;
                            destCol = beginCol + dir * cnt * colMul;
                            if (isValidRow(destRow, ROW) && isValidCol(destCol, COL)) {
                                if (boardArr[destRow][destCol] === -1) {
                                    continue;
                                }
                                else if (boardArr[destRow][destCol] === boardArr[startRow][startCol]) {
                                    findAnswerLog("findAnswer 333 destRow---- destCol---- ", destRow, destCol);
                                    answer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                                    if (retIfFindOne) {
                                        answers.push(answer);
                                        return answerInfo;
                                    }
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (answer.dests.length > 0) {
            answers.push(answer);
        }
    }

    return answerInfo;
}

// start, dest, dir均为[a, b] 数组, 第一个为row, 第二个为col
let applyAnswer = function (boardArr, start, dest, dir, mahjongCnt) {
    boardArr[start[0]][start[1]] = -1;
    boardArr[dest[0]][dest[1]] = -1;

    // 直连型配对，不需要移动
    if (start[0] === dest[0] || start[1] === dest[1]) {
        return;
    }

    if (dir[0] === 0) { // 横向移动
        let r = start[0];
        let diff = dest[1] - start[1];
        for (c = start[1] + mahjongCnt * dir[1] + diff; c != dest[1]; c -= dir[1]) {
            if (isValidCol(c, COL) && boardArr[r][c] === -1) {
                boardArr[r][c] = boardArr[r][c - diff];
                boardArr[r][c - diff] = -1;
            }
            else {
                console.log("不可能, 绝对不可能!11")
            }
        }
    }
    else {
        let c = start[1];
        let diff = dest[0] - start[0];
        for (r = start[0] + mahjongCnt * dir[0] + diff; r != dest[0]; r -= dir[0]) {
            if (isValidRow(r, ROW) && boardArr[r][c] === -1) {
                boardArr[r][c] = boardArr[r - diff][c];
                boardArr[r - diff][c] = -1;
            }
            else {
                console.log("不可能, 绝对不可能!22")
            }
        }
    }
}

let playOneArr = function () {
    let boardArr = generateMahjongArr();
    arr = convertTo2D(boardArr, COL);
    let answerInfo = findAnswers(arr, ROW, COL);
    let answers = answerInfo.answers;

    if (answers.length < INIT_MIN_PAIR || answers.length > INIT_MAX_PAIR) {
        //console.log("数组初始配对超出范围");
        return;
    }
    else {
        for (let answer of answers) {
            if (answer.dests.length > 1) {
                //console.log("数组初始配对，存在多个相邻的情况！");
                return;
            }
        }
    }

    //console.log("数组符合要求！")
    //printBoard(arr, ROW);

    let completeCnt = 0;
    for (var i = 0; i < MAX_PLAY_TIMES; i++) {
        arr = convertTo2D(boardArr, COL);
        while (1) {
            answerInfo = findAnswers(arr, ROW, COL, true);
            answers = answerInfo.answers;
            if (answerInfo.tryBlockCnt === 0) {
                //console.log("数组所有对子已经消除！")
                completeCnt++;
                break;
            }
            else if (answers.length > 0) {
                let answer = answers[0]
                //console.log("answer ------------", JSON.stringify(answer));
                applyAnswer(arr, answer.start, answer.dests[0].dest, answer.dests[0].dir, answer.dests[0].mahjongCnt);
            }
            else {
                //console.log("数组已经无解！", answerInfo.tryBlockCnt)
                break;
            }
        }
    }

    console.log(`尝试${MAX_PLAY_TIMES}次后, 完全消除比例`, completeCnt / MAX_PLAY_TIMES)
    return {
        rate: completeCnt / MAX_PLAY_TIMES,
        arr: boardArr
    }
}

const fs = require('fs')

let goodArr = {};
let fullCntMap = {};
let tryTimes = 0;
while (1) {
    tryTimes++;
    let arrInfo = playOneArr();
    if (arrInfo) {
        let num = Math.floor(arrInfo.rate * 10) + 1;
        if (!goodArr[num]) {
            goodArr[num] = [];
        }
        if (goodArr[num].length < 10) {
            goodArr[num].push(arrInfo);
        }
        else {
            fullCntMap[num] = true;
            if (Object.keys(fullCntMap).length >= 10 || tryTimes >= 10000) {
                console.log("全部已经炼完!, tryTimes", 10000)
                fs.writeFileSync("MahjongConfig/esay.txt", JSON.stringify(goodArr), 'utf8');
                break;
            }
        }
    }
}