let MAX_PLAY_TIMES = 1000; // 一个数组最多测试多少次

let LEVEL_MAP_CONFIGS = [
    // 行     列      文件名         开局最少对子数      开局最多对子数      起始过关率            每个难度过关率步进  每个难度关卡数    难度级别总数
    { row: 8, col: 6, file: "easy", init_min_pairs: 2, init_max_pairs: 8, win_rate_start: 100, win_rate_step: 5, step_levels: 500, diff_cnt: 10 },
    { row: 10, col: 8, file: "medium", init_min_pairs: 2, init_max_pairs: 12, win_rate_start: 90, win_rate_step: 5, step_levels: 250, diff_cnt: 10 },
    { row: 12, col: 10, file: "hard", init_min_pairs: 3, init_max_pairs: 16, win_rate_start: 80, win_rate_step: 5, step_levels: 250, diff_cnt: 10 },
]


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

/*
let TEMPLATE_6x8_ARR = [
]
*/

// 生成指定行列的麻将数组
let generateMahjongArr = function (row, col) {
    let arr = []
    let num = 0;
    let totalGrids = row * col;
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

RET_IF_FIND_ONE = 1; // 找到一个答案就返回
RET_IF_FIND_DIRECT_PAIR = 2; // 找到一个无需移动直接配对的答案就返回
RET_IF_FIND_SLIDE_PAIR = 3; // 找到一个移动的答案就返回
FIND_ALL_PAIR = 4; // 找到所有的答案

// 从中心点开始，顺时针方向查找
function squareSpiralFromRowCol(matrix, row, col) {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [];

    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = [];

    // 计算中心点坐标（对于偶数尺寸选择偏左上方的中心）
    let centerRow = row == null ? Math.floor((rows - 1) / 2) : row;
    let centerCol = col == null ? Math.floor((cols - 1) / 2) : col;

    // 定义方向：右、下、左、上
    const directions = [
        [0, 1],  // 右
        [1, 0],  // 下
        [0, -1], // 左
        [-1, 0]  // 上
    ];

    let direction = Math.floor(Math.random() * 4); // 初始方向向右
    let stepSize = 1;  // 初始步长
    let stepsTaken = 0; // 当前方向已走步数
    let currentRow = centerRow;
    let currentCol = centerCol;
    let dirInc = Math.random() > 0.5 ? 1 : -1;
    let dirChangeCnt = 0;

    // 添加中心点
    result.push([currentRow, currentCol]);

    while (true) {
        // 如果已经遍历完所有元素
        if (result.length === rows * cols) break;

        // 沿当前方向移动一步
        currentRow += directions[direction][0];
        currentCol += directions[direction][1];

        // 检查是否越界
        if (currentRow < 0 || currentRow >= rows || currentCol < 0 || currentCol >= cols) {
            // 回退并改变方向
            // currentRow -= directions[direction][0];
            // currentCol -= directions[direction][1];
            // direction = (direction + 1) % 4;
            //continue;
        }
        else {
            // 记录当前位置
            result.push([currentRow, currentCol]);
        }
        stepsTaken++;

        // 检查是否需要改变方向
        if (stepsTaken === stepSize) {
            stepsTaken = 0;
            direction = (direction + dirInc + 4) % 4;
            dirChangeCnt++;

            // 每两次方向改变后增加步长
            if (dirChangeCnt % 2 === 0) {
                stepSize++;
            }
        }
    }

    return result;
}

let _rowColMapSquareArr = {}
// 获取一个顺时针螺旋访问的坐标数组
let getSquareArrByRowCol = function (row, col) {
    let key = `${row}-${col}`;
    if (_rowColMapSquareArr[key]) {
        return _rowColMapSquareArr[key].concat();
    }
    else {
        let arr = generateMahjongArr(row, col);
        arr = convertTo2D(arr, col);
        let spiralCoords = squareSpiralFromRowCol(arr);
        _rowColMapSquareArr[key] = spiralCoords;
        return spiralCoords.concat();
    }
}


// 查找答案，去重
let findAnswers = function (boardArr, findType, keepRepeatAnswer, lastDest) {
    let maxRow = boardArr.length;
    let maxCol = boardArr[0].length;
    let total = maxRow * maxCol;
    let answerInfo = {};
    let answers = [];
    let directAnswers = [];
    let slideAnswers = [];
    answerInfo.answers = answers;
    answerInfo.directAnswers = directAnswers;
    answerInfo.slideAnswers = slideAnswers;
    answerInfo.tryBlockCnt = 0;
    // 查找随机答案
    let startIndex = Math.floor(Math.random() * total);
    let useSpiralWay = true;
    let copyArr;
    if (false/*lastDest*/) {
        copyArr = squareSpiralFromRowCol(boardArr, lastDest[0], lastDest[1]);
        Math.random() >= 0.9 && shuffleArray(copyArr);
    }
    else {
        copyArr = getSquareArrByRowCol(maxRow, maxCol);
        Math.random() >= 0 && shuffleArray(copyArr);
    }
    let alreadyHandledRowColSet = {};
    for (var i = 0; i < total; i++) {
        let startRow, startCol;
        if (!useSpiralWay) {
            let realIndex = (startIndex + i) % total;
            startRow = Math.floor(realIndex / maxCol);
            startCol = realIndex % maxCol;
        }
        else {
            startRow = copyArr[i][0];
            startCol = copyArr[i][1];
        }
        alreadyHandledRowColSet[`${startRow}-${startCol}`] = true;

        if (boardArr[startRow][startCol] === -1) {
            continue;
        }
        answerInfo.tryBlockCnt++;
        let answer = {};
        answer.start = [startRow, startCol];
        answer.dests = [];
        let directAnswer = {};
        directAnswer.start = [startRow, startCol];
        directAnswer.dests = [];
        let slideAnswer = {};
        slideAnswer.start = [startRow, startCol];
        slideAnswer.dests = [];
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
                if (isValidRow(curRow, maxRow) && isValidCol(curCol, maxCol)) {
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
                    // 直接判断当前方向相邻的麻将是否匹配
                    destRow = startRow + rowDir;
                    destCol = startCol + colDir;
                    // 去重，只往正方向走
                    // if (!keepRepeatAnswer && (colDir < 0 || rowDir < 0)) {
                    //     continue;
                    // }

                    if (isValidRow(destRow, maxRow) && isValidCol(destCol, maxCol) && (boardArr[destRow][destCol] === boardArr[startRow][startCol])) {
                        if (!keepRepeatAnswer && (alreadyHandledRowColSet[`${destRow}-${destCol}`])) {
                            continue;
                        }
                        findAnswerLog("findAnswer 111 destRow---- destCol---- ", destRow, destCol);
                        mahjongCnt = 0;
                        answer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                        directAnswer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                        if (findType === RET_IF_FIND_ONE || findType === RET_IF_FIND_DIRECT_PAIR) {
                            answers.push(answer);
                            directAnswers.push(directAnswer);
                            return answerInfo;
                        }
                        continue;
                    }

                    // 判断隔开pushStep个格子相对的那个麻将是否匹配, 无需推动麻将
                    destRow = startRow + (pushStep + 1) * rowDir;
                    destCol = startCol + (pushStep + 1) * colDir;
                    if (pushStep >= 1 && isValidRow(destRow, maxRow) && isValidCol(destCol, maxCol) && (boardArr[destRow][destCol] === boardArr[startRow][startCol])) {
                        if (!keepRepeatAnswer && (alreadyHandledRowColSet[`${destRow}-${destCol}`])) {
                            continue;
                        }
                        findAnswerLog("findAnswer 222 destRow---- destCol---- ", destRow, destCol);
                        mahjongCnt = 0;
                        answer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                        directAnswer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                        if (findType === RET_IF_FIND_ONE || findType === RET_IF_FIND_DIRECT_PAIR) {
                            answers.push(answer);
                            directAnswers.push(directAnswer);
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
                            if (isValidRow(destRow, maxRow) && isValidCol(destCol, maxCol)) {
                                if (boardArr[destRow][destCol] === -1) {
                                    continue;
                                }
                                else if (boardArr[destRow][destCol] === boardArr[startRow][startCol]) {
                                    findAnswerLog("findAnswer 333 destRow---- destCol---- ", destRow, destCol);
                                    answer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt });
                                    slideAnswer.dests.push({ dir: [rowDir, colDir], dest: [destRow, destCol], mahjongCnt: mahjongCnt })
                                    if (findType === RET_IF_FIND_ONE || findType === RET_IF_FIND_SLIDE_PAIR) {
                                        answers.push(answer);
                                        slideAnswers.push(slideAnswer)
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

        answer.dests.length > 0 && answers.push(answer);
        directAnswer.dests.length > 0 && directAnswers.push(directAnswer);
        slideAnswer.dests.length > 0 && slideAnswers.push(slideAnswer);
    }

    return answerInfo;
}

// start, dest, dir均为[a, b] 数组, 第一个为row, 第二个为col
let applyAnswer = function (boardArr, start, dest, dir, mahjongCnt) {
    boardArr[start[0]][start[1]] = -1;
    boardArr[dest[0]][dest[1]] = -1;
    maxRow = boardArr.length;
    maxCol = boardArr[0].length;

    // 直连型配对，不需要移动
    if (start[0] === dest[0] || start[1] === dest[1]) {
        return;
    }

    if (dir[0] === 0) { // 横向移动
        let r = start[0];
        let diff = dest[1] - start[1];
        for (c = start[1] + mahjongCnt * dir[1] + diff; c != dest[1]; c -= dir[1]) {
            if (isValidCol(c, maxCol) && boardArr[r][c] === -1) {
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
            if (isValidRow(r, maxRow) && boardArr[r][c] === -1) {
                boardArr[r][c] = boardArr[r - diff][c];
                boardArr[r - diff][c] = -1;
            }
            else {
                console.log("不可能, 绝对不可能!22")
            }
        }
    }
}

let playOneArr = function (arr, row, col, minPairs, maxPairs) {
    let boardArr = convertTo2D(arr, col);
    //printBoard(boardArr, row);
    let answerInfo = findAnswers(boardArr, FIND_ALL_PAIR, false);
    let answers = answerInfo.answers;

    if (answers.length < minPairs || answers.length > maxPairs) {
        console.log("数组初始配对超出范围", answers.length);
        return;
    }
    else {
        let answerInfo = findAnswers(boardArr, FIND_ALL_PAIR, true);
        let answers = answerInfo.answers;
        for (let answer of answers) {
            if (answer.dests.length > 1) {
                console.log("数组初始配对，存在多个相邻的情况！");
                return;
            }
        }
    }

    //console.log("数组符合要求！")

    // 成功消除次数
    let completeCnt = 0;
    // 无解的时候，走的步数
    let noAnswerStepCntArr = [];
    for (var i = 0; i < MAX_PLAY_TIMES; i++) {
        //拷贝一份数组
        boardArr = convertTo2D(arr, col);
        let clickCnt = 0;
        let steps = 0;
        let lastDest = null;
        while (1) {
            //printBoard(boardArr, row);
            let answerInfo;
            let answers = [];
            clickCnt++;
            // 前几对直接消除相邻的配对
            if (clickCnt <= minPairs) {
                answerInfo = findAnswers(boardArr, RET_IF_FIND_DIRECT_PAIR, false);
                answers = answerInfo.slideAnswers;
            }
            if (answers.length <= 0) {
                answerInfo = findAnswers(boardArr, RET_IF_FIND_ONE, false, lastDest);
                answers = answerInfo.answers;
            }

            if (answerInfo.tryBlockCnt === 0) {
                //console.log("数组所有对子已经消除！")
                completeCnt++;
                break;
            }
            else if (answers.length > 0) {
                let answer = answers[0]
                //console.log("answer ------------", JSON.stringify(answer));
                lastDest = answer.dests[0].dest
                applyAnswer(boardArr, answer.start, answer.dests[0].dest, answer.dests[0].dir, answer.dests[0].mahjongCnt);
                steps++;
            }
            else {
                //console.log("数组已经无解！", answerInfo.tryBlockCnt)
                noAnswerStepCntArr.push(steps);
                break;
            }
        }
    }

    console.log(`尝试${MAX_PLAY_TIMES}次后, 完全消除比例`, completeCnt / MAX_PLAY_TIMES);
    return {
        rate: completeCnt / MAX_PLAY_TIMES,
        noAnswerStepCntArr: noAnswerStepCntArr
    }
}

const fs = require('fs');
const path = require('path');

let generatePlayDatas = function (mapConfig) {
    let row = mapConfig.row;
    let col = mapConfig.col;
    let minPairs = mapConfig.init_min_pairs;
    let maxPairs = mapConfig.init_max_pairs;
    let rateStart = mapConfig.win_rate_start;
    let rateStep = mapConfig.win_rate_step;
    let diffLevels = mapConfig.step_levels;
    let file = mapConfig.file;
    let diffCnt = mapConfig.diff_cnt;

    let goodArr = {};
    let fullCntMap = {};
    let tryTimes = 0;

    while (1) {
        tryTimes++;
        let arr = generateMahjongArr(row, col);
        let arrInfo = playOneArr(arr, row, col, minPairs, maxPairs);
        if (arrInfo) {
            let num = Math.floor((rateStart - arrInfo.rate * 100) / rateStep);
            if (num < 0 || num >= diffCnt) { // 超出范围
                continue;
            }

            if (!goodArr[num]) {
                goodArr[num] = [];
            }

            if (goodArr[num].length < diffLevels) {
                goodArr[num].push({ arr: arr, rate: arrInfo.rate });
            }
            else {
                fullCntMap[num] = true;
            }


            let fullCntMapLen = Object.keys(fullCntMap).length;
            console.log("fullCntMapLen ----- ", fullCntMapLen);
            if (fullCntMapLen >= diffCnt) {
                let fileInfo = {}; // 文件信息
                fileInfo.total = diffCnt * diffLevels;  // 此文件总共有多少关
                fileInfo.diffLevels = diffLevels; // 每个难度级别对应多少关
                fileInfo.diffCnt = diffCnt; // 总共有多少个难度级别
                fileInfo.rateStart = rateStart; // 起始通关率
                fileInfo.rateStep = rateStep; // 通关率步进
                fileInfo.levelsMap = {}; // 关卡列表 id从1到total， 难度从容易到难 示例：{1:{arr:[], rate:0.5}, 2:{arr:[], rate:0.3}}
                let index = 1;
                for (let i = 0; i < diffCnt; i++) {
                    let oneGroupArr = goodArr[i];
                    for (let j = 0; j < oneGroupArr.length; j++) {
                        fileInfo.levelsMap[index++] = oneGroupArr[j];
                    }
                }
                console.log(file + "全部已经炼完!, tryTimes", tryTimes)
                let dirPath = path.join(__dirname, `MahjongConfig`);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath); // 使用 { recursive: true } 创建多级目录
                }
                fs.writeFileSync(path.join(__dirname, `MahjongConfig/${file}.json`), JSON.stringify(fileInfo), 'utf8');
                break;
            }
        }
    }
}


let TEST_ARRS = [
    {
        row: 12, col: 10, minPairs: 3, maxPairs: 16,
        arrs: [
            //[5, 7, 28, 11, 21, 19, 19, 4, 12, 27, 4, 17, 12, 23, 20, 22, 15, 30, 2, 2, 2, 16, 23, 9, 30, 28, 7, 12, 10, 8, 29, 19, 17, 26, 16, 23, 9, 6, 18, 15, 30, 1, 6, 26, 5, 19, 29, 26, 17, 10, 1, 25, 17, 18, 23, 3, 15, 5, 20, 16, 29, 30, 6, 3, 1, 26, 11, 3, 18, 10, 24, 7, 8, 3, 8, 25, 4, 13, 18, 20, 13, 9, 14, 29, 24, 24, 5, 15, 16, 6, 11, 24, 28, 27, 27, 21, 22, 13, 14, 4, 28, 22, 20, 12, 7, 13, 22, 2, 25, 1, 9, 14, 21, 27, 25, 8, 21, 14, 10, 11],// 4 0.492
            //[29, 1, 25, 29, 17, 28, 13, 11, 13, 20, 1, 8, 26, 23, 21, 6, 15, 8, 16, 20, 28, 12, 27, 6, 10, 23, 9, 24, 10, 15, 14, 25, 23, 2, 11, 5, 3, 30, 9, 4, 1, 28, 6, 21, 12, 2, 25, 22, 29, 29, 16, 18, 30, 7, 7, 19, 20, 23, 14, 9, 21, 26, 8, 8, 20, 13, 5, 2, 3, 9, 24, 27, 13, 10, 19, 26, 7, 3, 14, 28, 27, 17, 16, 30, 4, 22, 7, 3, 10, 18, 6, 30, 16, 25, 27, 24, 14, 18, 11, 12, 17, 15, 24, 22, 22, 12, 4, 17, 19, 5, 18, 26, 19, 4, 5, 15, 2, 11, 21, 1], //2 0.657
            //[7, 10, 23, 1, 13, 6, 27, 27, 6, 19, 21, 1, 16, 5, 5, 20, 25, 18, 28, 11, 10, 16, 3, 24, 24, 19, 17, 22, 26, 20, 29, 27, 22, 15, 21, 3, 30, 17, 18, 2, 19, 2, 12, 9, 7, 12, 3, 30, 14, 30, 23, 16, 29, 12, 17, 10, 4, 8, 15, 3, 19, 5, 24, 10, 9, 15, 27, 14, 29, 28, 22, 13, 8, 20, 6, 23, 9, 21, 18, 26, 24, 4, 23, 13, 7, 1, 22, 29, 30, 6, 20, 5, 21, 9, 7, 11, 14, 11, 8, 8, 11, 2, 1, 4, 15, 25, 26, 16, 4, 18, 2, 25, 17, 26, 14, 28, 13, 28, 25, 12], // 3 0.489
            //[13, 24, 22, 5, 15, 7, 3, 6, 17, 6, 29, 4, 20, 22, 26, 9, 13, 25, 25, 12, 4, 13, 12, 30, 17, 28, 26, 3, 2, 2, 1, 30, 15, 23, 5, 17, 19, 14, 10, 14, 7, 3, 27, 29, 24, 18, 13, 26, 26, 17, 10, 9, 22, 27, 19, 11, 7, 30, 28, 4, 16, 8, 7, 21, 9, 28, 6, 16, 11, 19, 22, 1, 15, 18, 21, 8, 23, 8, 16, 6, 20, 11, 15, 20, 30, 25, 25, 29, 29, 10, 21, 5, 18, 19, 28, 5, 12, 4, 12, 14, 24, 23, 3, 11, 10, 27, 1, 14, 20, 1, 21, 24, 27, 16, 9, 2, 2, 18, 8, 23] // 1 0.79
            //[11, 8, 30, 30, 17, 14, 25, 6, 10, 5, 11, 22, 16, 14, 28, 4, 27, 18, 8, 14, 16, 2, 5, 21, 25, 4, 15, 9, 15, 20, 14, 23, 20, 19, 21, 8, 27, 26, 7, 15, 23, 6, 18, 6, 3, 10, 7, 11, 27, 17, 3, 29, 30, 16, 24, 16, 18, 13, 25, 26, 13, 3, 25, 7, 10, 15, 29, 24, 12, 9, 17, 13, 23, 29, 26, 4, 3, 20, 12, 7, 27, 1, 9, 9, 29, 28, 4, 20, 18, 22, 26, 2, 24, 28, 2, 19, 13, 21, 11, 10, 6, 30, 12, 21, 1, 5, 5, 1, 24, 8, 28, 22, 1, 2, 22, 23, 12, 17, 19, 19], // 1 0.821
            //[27, 27, 18, 3, 21, 17, 29, 25, 27, 5, 23, 1, 14, 11, 13, 27, 19, 6, 25, 28, 10, 20, 30, 24, 28, 21, 2, 7, 5, 9, 28, 8, 25, 29, 20, 14, 12, 7, 16, 6, 12, 29, 23, 15, 30, 8, 3, 1, 7, 20, 26, 16, 26, 2, 12, 29, 16, 13, 4, 11, 6, 22, 6, 23, 8, 18, 15, 12, 13, 17, 22, 28, 16, 11, 2, 26, 30, 10, 14, 7, 30, 4, 1, 20, 17, 22, 4, 11, 9, 10, 9, 18, 8, 13, 19, 3, 18, 14, 15, 24, 17, 22, 4, 5, 26, 3, 5, 23, 24, 21, 19, 1, 25, 19, 24, 15, 10, 21, 2, 9], //2 0.609 
            //[30, 19, 21, 8, 12, 5, 27, 25, 18, 8, 17, 20, 24, 12, 17, 28, 30, 4, 9, 3, 18, 4, 2, 27, 10, 24, 29, 5, 9, 16, 13, 16, 2, 17, 7, 11, 7, 8, 11, 14, 23, 7, 16, 29, 22, 27, 25, 21, 14, 26, 13, 15, 9, 28, 15, 20, 11, 24, 13, 11, 1, 27, 26, 14, 30, 15, 28, 19, 6, 24, 6, 18, 12, 15, 18, 29, 1, 13, 26, 1, 21, 2, 2, 12, 14, 6, 28, 20, 23, 22, 10, 23, 20, 3, 5, 23, 4, 29, 3, 19, 21, 19, 30, 17, 10, 9, 16, 25, 4, 22, 7, 6, 10, 22, 3, 26, 25, 1, 5, 8], // 3 0.548
            //[14, 28, 27, 29, 22, 4, 13, 8, 25, 28, 23, 17, 26, 9, 29, 5, 23, 20, 2, 7, 24, 3, 13, 7, 21, 22, 10, 10, 19, 23, 3, 1, 30, 25, 17, 27, 16, 15, 4, 4, 1, 14, 25, 20, 17, 12, 11, 16, 6, 24, 10, 16, 18, 18, 7, 5, 5, 2, 8, 6, 4, 11, 6, 21, 13, 28, 11, 26, 18, 28, 21, 30, 30, 20, 24, 30, 19, 11, 9, 29, 21, 12, 8, 2, 15, 26, 6, 18, 1, 20, 9, 10, 5, 1, 3, 14, 13, 12, 3, 19, 27, 24, 19, 26, 8, 17, 16, 2, 25, 22, 27, 9, 14, 23, 12, 29, 15, 15, 7, 22], // 4 0.671
            //[13, 24, 29, 23, 13, 27, 28, 30, 3, 10, 10, 7, 12, 26, 25, 14, 20, 13, 19, 11, 18, 18, 14, 29, 25, 2, 17, 1, 5, 5, 6, 26, 7, 20, 11, 1, 4, 12, 23, 14, 4, 4, 17, 7, 8, 14, 13, 7, 4, 5, 27, 25, 25, 16, 8, 18, 1, 2, 19, 24, 28, 19, 11, 16, 2, 26, 5, 6, 11, 30, 3, 29, 15, 28, 9, 10, 19, 15, 26, 3, 12, 17, 27, 20, 18, 2, 20, 22, 22, 23, 29, 15, 21, 9, 23, 10, 9, 8, 21, 6, 9, 12, 24, 3, 22, 17, 21, 28, 30, 21, 1, 16, 22, 8, 16, 6, 15, 24, 30, 27] // 1 0.7188
            //[28, 21, 3, 15, 27, 1, 5, 7, 9, 9, 16, 4, 1, 16, 4, 7, 3, 30, 24, 8, 14, 30, 17, 27, 16, 12, 5, 21, 20, 26, 6, 23, 18, 20, 15, 20, 22, 22, 25, 26, 6, 22, 1, 2, 25, 6, 23, 29, 27, 12, 12, 8, 19, 14, 9, 7, 1, 24, 24, 29, 26, 19, 6, 10, 8, 2, 18, 9, 17, 17, 10, 5, 28, 25, 18, 10, 19, 11, 2, 29, 13, 29, 11, 10, 28, 15, 19, 7, 26, 3, 22, 3, 20, 27, 14, 21, 30, 15, 28, 11, 18, 24, 23, 23, 13, 17, 25, 21, 4, 2, 5, 14, 11, 12, 30, 13, 13, 4, 8, 16], // 3 0.6194

            // [7, 17, 1, 15, 21, 23, 29, 24, 26, 29, 28, 9, 16, 14, 3, 5, 8, 19, 13, 24, 7, 25, 19, 18, 3, 24, 15, 28, 4, 14, 7, 26, 29, 8, 20, 6, 28, 12, 16, 16, 17, 6, 27, 22, 22, 2, 15, 29, 11, 13, 26, 8, 15, 27, 25, 4, 20, 18, 8, 3, 3, 21, 30, 11, 18, 13, 2, 10, 1, 16, 9, 5, 28, 13, 4, 6, 17, 20, 2, 10, 23, 2, 14, 19, 30, 1, 9, 20, 5, 12, 25, 4, 22, 11, 23, 27, 11, 30, 12, 7, 23, 14, 22, 1, 27, 30, 5, 24, 17, 26, 21, 21, 10, 6, 10, 9, 18, 19, 25, 12], // 1 0.727
            // [13, 8, 18, 3, 16, 10, 17, 22, 9, 4, 13, 10, 24, 21, 13, 18, 12, 22, 9, 16, 18, 29, 6, 24, 13, 20, 29, 5, 4, 14, 22, 3, 1, 26, 12, 30, 16, 19, 19, 15, 17, 9, 6, 8, 2, 11, 28, 26, 14, 21, 1, 22, 20, 29, 25, 26, 2, 28, 30, 20, 5, 2, 26, 17, 11, 27, 3, 1, 5, 30, 23, 25, 25, 12, 11, 24, 28, 30, 7, 21, 15, 15, 3, 1, 29, 24, 23, 6, 19, 16, 21, 14, 5, 27, 23, 6, 14, 7, 8, 25, 17, 7, 12, 27, 10, 10, 19, 20, 18, 2, 4, 9, 8, 7, 23, 11, 27, 28, 15, 4], // 1 0.8
            // [1, 26, 10, 19, 21, 24, 6, 18, 15, 28, 13, 30, 13, 3, 20, 16, 19, 1, 9, 17, 28, 22, 24, 6, 22, 21, 5, 2, 25, 7, 21, 7, 20, 16, 5, 17, 25, 8, 26, 7, 3, 8, 24, 7, 10, 12, 20, 27, 11, 10, 20, 30, 18, 6, 24, 30, 27, 9, 4, 27, 26, 16, 18, 11, 29, 26, 8, 15, 23, 22, 1, 28, 4, 11, 17, 29, 19, 15, 30, 13, 14, 1, 25, 27, 12, 14, 6, 13, 19, 5, 3, 12, 12, 21, 23, 22, 9, 4, 23, 5, 2, 14, 23, 25, 15, 10, 4, 3, 2, 2, 29, 17, 8, 29, 16, 28, 11, 18, 9, 14], // 10 0.707
            // [7, 28, 22, 3, 13, 2, 3, 19, 14, 12, 4, 1, 11, 26, 24, 6, 22, 7, 18, 24, 25, 1, 11, 22, 15, 23, 20, 27, 8, 18, 12, 21, 15, 9, 28, 6, 10, 7, 3, 20, 2, 29, 4, 2, 27, 11, 28, 30, 10, 14, 25, 12, 12, 9, 30, 30, 27, 19, 16, 20, 16, 24, 6, 17, 1, 17, 19, 4, 8, 23, 23, 17, 16, 17, 2, 28, 16, 8, 22, 3, 13, 13, 5, 4, 8, 21, 9, 9, 27, 21, 26, 20, 1, 7, 5, 24, 19, 13, 18, 14, 5, 5, 26, 25, 10, 29, 18, 10, 30, 15, 15, 21, 25, 23, 29, 11, 29, 6, 26, 14],  //10 0.354
            // [27, 20, 4, 7, 11, 19, 20, 9, 3, 4, 30, 26, 23, 3, 15, 5, 21, 18, 25, 30, 24, 28, 28, 4, 12, 13, 7, 6, 24, 3, 23, 7, 23, 20, 30, 13, 12, 17, 21, 24, 17, 12, 5, 6, 1, 11, 8, 3, 29, 29, 19, 22, 30, 14, 16, 2, 1, 27, 1, 9, 16, 18, 15, 1, 29, 26, 14, 25, 26, 5, 15, 11, 22, 28, 29, 2, 6, 10, 4, 28, 8, 21, 13, 24, 5, 25, 22, 2, 6, 10, 22, 12, 10, 19, 8, 11, 18, 15, 16, 7, 16, 27, 18, 19, 14, 14, 9, 17, 17, 8, 21, 13, 25, 2, 10, 26, 9, 23, 27, 20], // 10 0.442
            // [21, 28, 6, 10, 7, 9, 25, 28, 4, 9, 2, 23, 4, 11, 8, 25, 3, 29, 26, 27, 30, 7, 3, 19, 12, 11, 20, 12, 8, 23, 17, 5, 15, 18, 22, 1, 4, 8, 13, 16, 25, 22, 3, 22, 20, 13, 6, 5, 29, 21, 16, 16, 27, 26, 12, 23, 18, 2, 18, 17, 22, 17, 20, 1, 30, 7, 8, 2, 10, 14, 23, 27, 30, 19, 14, 1, 1, 11, 12, 7, 15, 15, 28, 16, 17, 13, 24, 13, 14, 14, 19, 26, 27, 5, 21, 9, 11, 24, 4, 2, 29, 20, 19, 5, 26, 21, 25, 15, 28, 18, 24, 24, 30, 29, 6, 10, 9, 6, 3, 10], // 10 0.264

            // [18, 4, 24, 3, 3, 23, 2, 18, 15, 28, 7, 24, 26, 5, 26, 21, 5, 1, 9, 9, 10, 28, 9, 8, 14, 6, 29, 27, 27, 13, 23, 22, 5, 2, 14, 4, 10, 14, 7, 25, 7, 13, 21, 8, 5, 14, 3, 20, 16, 30, 16, 15, 11, 19, 6, 29, 6, 17, 20, 24, 3, 2, 20, 11, 26, 22, 21, 15, 17, 25, 30, 17, 11, 25, 13, 26, 22, 29, 19, 29, 27, 20, 4, 2, 30, 19, 17, 30, 8, 1, 9, 16, 13, 10, 18, 23, 4, 8, 22, 27, 1, 12, 25, 18, 6, 28, 12, 19, 1, 10, 12, 16, 15, 23, 12, 24, 28, 21, 11, 7], // 2 0.515
            // [28, 11, 25, 13, 12, 17, 8, 27, 30, 2, 7, 14, 11, 18, 21, 15, 7, 10, 19, 2, 6, 7, 10, 22, 18, 21, 24, 23, 21, 3, 8, 22, 23, 29, 16, 17, 14, 6, 4, 24, 30, 25, 22, 27, 26, 2, 17, 12, 24, 9, 19, 1, 5, 14, 13, 18, 2, 5, 3, 14, 9, 16, 24, 30, 15, 23, 25, 18, 19, 9, 7, 20, 30, 11, 4, 26, 12, 8, 1, 13, 25, 27, 1, 11, 13, 19, 6, 6, 29, 29, 10, 29, 15, 3, 17, 15, 23, 8, 20, 26, 10, 9, 21, 16, 28, 28, 20, 4, 5, 20, 12, 16, 3, 5, 1, 22, 28, 26, 27, 4]// 4 0.496
        ]
    },
    {
        row: 10, col: 8, minPairs: 2, maxPairs: 12,
        arrs: [
            //[3, 8, 5, 2, 12, 19, 13, 13, 19, 20, 14, 7, 1, 2, 15, 17, 8, 9, 10, 7, 6, 16, 10, 14, 1, 20, 4, 16, 4, 6, 18, 9, 18, 18, 9, 14, 19, 8, 17, 3, 12, 7, 1, 15, 18, 13, 4, 9, 8, 7, 1, 16, 4, 16, 11, 11, 5, 14, 10, 12, 5, 13, 15, 3, 20, 12, 20, 6, 17, 5, 3, 2, 11, 2, 17, 6, 11, 19, 10, 15], // 1 0.921
            //[6, 3, 15, 9, 16, 17, 5, 19, 1, 4, 5, 7, 4, 15, 11, 6, 17, 20, 19, 11, 3, 8, 13, 6, 19, 12, 2, 11, 8, 14, 16, 11, 1, 17, 13, 10, 2, 12, 5, 14, 14, 14, 7, 20, 9, 18, 8, 17, 9, 7, 20, 10, 13, 15, 3, 3, 13, 16, 16, 8, 5, 4, 6, 19, 12, 1, 9, 20, 18, 4, 10, 7, 12, 2, 15, 10, 1, 2, 18, 18], // 3 0.793
            //[17, 4, 8, 19, 12, 2, 7, 11, 14, 5, 18, 15, 12, 4, 10, 2, 3, 6, 9, 4, 6, 3, 3, 5, 13, 10, 19, 3, 6, 20, 18, 13, 10, 15, 9, 11, 20, 14, 17, 15, 20, 12, 17, 18, 19, 8, 9, 14, 16, 12, 5, 1, 8, 13, 16, 16, 13, 11, 10, 15, 19, 1, 2, 14, 17, 1, 8, 2, 7, 18, 11, 7, 6, 16, 4, 7, 5, 20, 1, 9], // 5 0.702
            //[7, 13, 8, 5, 19, 6, 15, 6, 16, 6, 11, 17, 1, 4, 4, 14, 3, 15, 20, 1, 16, 13, 10, 14, 8, 14, 9, 2, 12, 19, 15, 20, 20, 13, 11, 18, 9, 1, 4, 16, 7, 5, 19, 19, 11, 14, 18, 20, 12, 18, 6, 1, 17, 9, 3, 7, 10, 5, 12, 12, 5, 15, 3, 2, 8, 2, 3, 7, 10, 17, 4, 17, 8, 9, 16, 13, 11, 18, 10, 2], // 10 0.528
            //[6, 10, 18, 8, 7, 13, 1, 20, 6, 15, 7, 11, 14, 16, 3, 18, 15, 14, 8, 4, 16, 9, 11, 2, 2, 14, 13, 6, 10, 13, 5, 18, 8, 18, 2, 10, 9, 15, 19, 17, 12, 12, 4, 1, 5, 9, 12, 3, 3, 1, 19, 20, 11, 16, 8, 20, 12, 17, 5, 4, 1, 19, 13, 17, 3, 6, 20, 16, 4, 5, 7, 14, 7, 9, 11, 2, 17, 15, 19, 10], // 10 0.354
            //[6, 7, 9, 15, 14, 3, 17, 2, 12, 8, 14, 3, 13, 17, 19, 1, 20, 11, 6, 6, 19, 2, 10, 1, 1, 15, 14, 20, 11, 15, 14, 10, 9, 10, 13, 9, 18, 12, 18, 13, 12, 10, 3, 16, 5, 1, 7, 8, 8, 4, 11, 17, 4, 20, 19, 16, 9, 18, 18, 12, 4, 20, 7, 16, 2, 8, 3, 2, 15, 5, 16, 6, 13, 17, 5, 5, 19, 7, 11, 4], // 10 0.352

            //[6, 13, 19, 9, 18, 18, 5, 14, 15, 5, 18, 12, 10, 13, 2, 7, 15, 6, 20, 16, 1, 8, 16, 11, 11, 2, 12, 14, 18, 16, 9, 20, 19, 11, 7, 20, 17, 7, 3, 8, 9, 17, 19, 12, 8, 4, 9, 10, 14, 4, 16, 5, 4, 13, 11, 2, 10, 6, 13, 1, 3, 14, 20, 10, 19, 5, 17, 1, 3, 17, 15, 15, 6, 12, 4, 2, 7, 1, 3, 8], // 3 0.739
            //[2, 5, 1, 5, 3, 9, 17, 19, 20, 11, 18, 5, 16, 20, 2, 19, 1, 15, 17, 17, 10, 12, 14, 6, 5, 14, 7, 18, 7, 3, 10, 13, 1, 18, 14, 19, 13, 4, 8, 8, 9, 4, 9, 15, 3, 10, 20, 7, 13, 4, 3, 12, 4, 8, 6, 15, 14, 15, 6, 16, 17, 19, 8, 11, 1, 6, 20, 18, 16, 11, 16, 10, 11, 13, 9, 7, 12, 12, 2, 2], // 6 0.809
            //[4, 5, 14, 17, 10, 13, 16, 16, 14, 3, 14, 7, 11, 10, 17, 3, 17, 9, 18, 11, 1, 7, 10, 15, 20, 19, 7, 14, 10, 9, 8, 13, 18, 4, 20, 4, 1, 2, 15, 20, 11, 12, 12, 8, 8, 5, 19, 2, 19, 4, 13, 2, 9, 3, 17, 16, 3, 7, 1, 16, 13, 6, 12, 12, 2, 5, 6, 5, 11, 20, 6, 9, 15, 8, 15, 1, 18, 6, 18, 19], // 2  0.789
            //[6, 3, 15, 9, 16, 17, 5, 19, 1, 4, 5, 7, 4, 15, 11, 6, 17, 20, 19, 11, 3, 8, 13, 6, 19, 12, 2, 11, 8, 14, 16, 11, 1, 17, 13, 10, 2, 12, 5, 14, 14, 14, 7, 20, 9, 18, 8, 17, 9, 7, 20, 10, 13, 15, 3, 3, 13, 16, 16, 8, 5, 4, 6, 19, 12, 1, 9, 20, 18, 4, 10, 7, 12, 2, 15, 10, 1, 2, 18, 18],// 3 0.803
            //[10, 1, 7, 9, 20, 3, 18, 10, 4, 3, 13, 6, 10, 15, 7, 19, 2, 2, 1, 15, 13, 8, 17, 17, 5, 20, 15, 3, 6, 9, 19, 1, 10, 11, 11, 12, 12, 16, 5, 5, 16, 3, 9, 14, 14, 2, 8, 7, 20, 6, 4, 8, 17, 18, 15, 18, 17, 16, 9, 13, 11, 13, 6, 5, 20, 12, 4, 19, 18, 11, 14, 4, 12, 16, 7, 19, 14, 8, 1, 2], //2 0.907
            //[17, 8, 18, 4, 2, 18, 15, 3, 4, 17, 16, 5, 14, 10, 7, 10, 11, 9, 1, 10, 5, 18, 14, 17, 14, 9, 11, 16, 1, 2, 12, 8, 19, 6, 16, 10, 1, 5, 7, 2, 11, 7, 13, 13, 8, 14, 19, 20, 2, 4, 20, 15, 18, 1, 17, 12, 6, 15, 15, 3, 11, 9, 20, 6, 8, 13, 3, 20, 12, 19, 5, 12, 19, 7, 13, 6, 4, 16, 3, 9], // 7 0.662
            //[5, 17, 15, 9, 15, 16, 10, 7, 4, 10, 8, 18, 3, 11, 20, 2, 6, 6, 1, 19, 20, 12, 18, 3, 17, 11, 11, 18, 5, 19, 17, 20, 7, 17, 16, 13, 2, 13, 1, 14, 5, 5, 10, 13, 12, 10, 3, 6, 16, 4, 9, 1, 12, 6, 3, 9, 14, 14, 1, 20, 4, 7, 2, 8, 8, 4, 12, 13, 14, 19, 7, 15, 15, 8, 16, 11, 19, 2, 18, 9] // 10 0.611
        ]
    },
    {
        row: 8, col: 6, minPairs: 2, maxPairs: 8,
        arrs: [
            // [8, 1, 1, 7, 3, 11, 12, 12, 9, 9, 7, 4, 3, 8, 12, 10, 6, 9, 4, 10, 4, 2, 11, 6, 7, 2, 3, 10, 4, 2, 11, 8, 7, 1, 8, 9, 1, 5, 3, 6, 5, 6, 12, 2, 11, 10, 5, 5], // 超过三个相连的错误数据
            // [8, 10, 8, 7, 6, 5, 9, 6, 4, 7, 3, 5, 8, 6, 2, 12, 4, 7, 10, 3, 10, 9, 11, 4, 10, 1, 9, 11, 12, 3, 11, 9, 12, 5, 1, 7, 3, 2, 11, 8, 1, 2, 1, 5, 6, 4, 2, 12], // 2 0.868
            // [5, 6, 12, 5, 4, 7, 7, 3, 11, 8, 4, 2, 10, 2, 8, 12, 3, 9, 12, 8, 2, 3, 6, 10, 5, 9, 11, 1, 5, 6, 4, 12, 10, 7, 8, 1, 10, 11, 3, 9, 9, 11, 6, 1, 2, 7, 1, 4], // 4  0.788
            // [1, 7, 8, 10, 6, 4, 2, 5, 11, 9, 4, 6, 12, 1, 6, 8, 5, 5, 9, 4, 2, 12, 1, 10, 10, 4, 1, 2, 7, 3, 3, 9, 11, 10, 12, 3, 11, 12, 6, 2, 8, 9, 7, 11, 5, 8, 7, 3], // 5 0.8

            // [1, 6, 5, 8, 3, 7, 11, 11, 3, 1, 9, 8, 4, 8, 12, 3, 6, 7, 10, 11, 1, 11, 9, 2, 10, 5, 7, 3, 12, 4, 9, 8, 6, 12, 5, 1, 4, 7, 6, 10, 4, 12, 2, 5, 9, 2, 2, 10], // 3 0.871
            // [4, 10, 1, 7, 6, 12, 2, 3, 9, 7, 6, 3, 1, 11, 8, 5, 5, 3, 2, 4, 5, 11, 11, 9, 7, 12, 8, 2, 4, 9, 12, 6, 3, 10, 10, 7, 8, 9, 10, 6, 8, 1, 1, 2, 4, 12, 5, 11], // 3 0.828
            // [2, 5, 2, 10, 12, 6, 4, 8, 3, 9, 9, 12, 7, 1, 2, 12, 8, 3, 3, 8, 6, 5, 10, 1, 11, 9, 6, 1, 7, 9, 10, 3, 12, 4, 8, 2, 4, 10, 7, 5, 4, 11, 1, 6, 7, 11, 11, 5], // 3 0.786
            // [1, 6, 12, 11, 3, 7, 11, 5, 1, 9, 10, 2, 4, 3, 7, 7, 1, 2, 1, 9, 3, 9, 8, 10, 5, 5, 2, 10, 12, 12, 7, 4, 6, 8, 9, 5, 4, 10, 6, 3, 4, 11, 8, 8, 11, 2, 6, 12],// 3 0.866
            // [3, 7, 12, 11, 8, 8, 6, 8, 11, 10, 12, 3, 11, 2, 5, 9, 7, 3, 6, 3, 9, 12, 1, 11, 1, 10, 12, 5, 2, 4, 2, 1, 8, 6, 9, 6, 2, 4, 10, 10, 1, 9, 4, 5, 7, 4, 7, 5], // 1 
            // [4, 7, 5, 1, 11, 7, 11, 6, 12, 3, 1, 8, 12, 1, 8, 7, 2, 5, 11, 3, 3, 10, 9, 2, 10, 4, 4, 9, 1, 2, 5, 2, 6, 3, 8, 6, 12, 4, 11, 10, 6, 9, 12, 8, 10, 5, 7, 9], // 2 0.798
            // [11, 1, 7, 10, 6, 12, 11, 10, 2, 7, 2, 5, 7, 9, 3, 6, 11, 3, 5, 12, 9, 9, 5, 12, 8, 1, 4, 12, 9, 1, 4, 8, 4, 6, 3, 11, 10, 2, 7, 5, 10, 4, 8, 8, 6, 1, 2, 3], // 9 0.556
            // [9, 5, 9, 5, 10, 6, 11, 12, 7, 6, 3, 9, 11, 6, 2, 3, 9, 1, 8, 8, 7, 12, 1, 2, 7, 1, 12, 10, 1, 5, 8, 6, 4, 2, 2, 7, 5, 4, 11, 3, 11, 12, 10, 8, 10, 3, 4, 4], // 6 0.857
            // [11, 7, 9, 11, 7, 10, 11, 6, 12, 4, 6, 6, 3, 11, 9, 7, 5, 5, 2, 5, 5, 2, 3, 9, 4, 10, 4, 12, 8, 8, 8, 9, 1, 12, 6, 1, 10, 1, 3, 7, 2, 4, 12, 3, 2, 10, 8, 1], // 5 0.759
            // [4, 11, 3, 7, 10, 2, 11, 8, 8, 5, 10, 3, 11, 10, 2, 4, 2, 1, 6, 4, 9, 7, 4, 10, 12, 3, 2, 9, 5, 1, 9, 7, 11, 8, 1, 12, 12, 9, 5, 8, 6, 1, 5, 7, 6, 3, 6, 12], // 10 0.795
            //[9, 6, 2, 4, 10, 4, 9, 5, 11, 7, 6, 5, 1, 3, 8, 11, 5, 6, 8, 12, 7, 10, 11, 1, 8, 7, 10, 2, 3, 9, 3, 3, 11, 4, 8, 2, 1, 9, 5, 12, 2, 12, 1, 4, 12, 10, 7, 6], // 9 0.808

            // [6, 1, 12, 11, 10, 4, 2, 5, 1, 10, 12, 7, 11, 8, 3, 6, 5, 8, 2, 9, 5, 11, 8, 10, 7, 9, 3, 12, 6, 11, 1, 3, 5, 4, 1, 12, 4, 8, 6, 2, 2, 7, 9, 9, 10, 7, 3, 4], // 3 0.822

            // [7, 5, 2, 1, 4, 9, 7, 4, 12, 11, 8, 9, 6, 10, 7, 2, 8, 5, 12, 11, 10, 3, 12, 1, 11, 1, 6, 2, 6, 2, 8, 8, 10, 5, 5, 3, 9, 3, 11, 1, 10, 6, 4, 7, 4, 9, 3, 12], // 1 0.828 
            // [11, 9, 10, 1, 6, 4, 10, 5, 10, 8, 1, 7, 12, 12, 7, 4, 8, 11, 6, 7, 11, 9, 2, 6, 3, 12, 5, 7, 10, 9, 3, 1, 6, 4, 2, 9, 1, 8, 2, 12, 5, 3, 8, 2, 3, 5, 4, 11], // 1 0.99
            // [11, 2, 2, 12, 4, 12, 6, 7, 11, 3, 10, 2, 8, 7, 4, 1, 11, 6, 8, 4, 1, 9, 3, 5, 7, 12, 3, 10, 7, 5, 5, 9, 10, 5, 8, 1, 12, 3, 6, 4, 9, 1, 11, 8, 10, 2, 9, 6], // 1 0.937
            // [12, 8, 5, 11, 4, 9, 10, 8, 9, 6, 8, 2, 10, 1, 6, 7, 3, 10, 3, 5, 2, 3, 10, 4, 12, 4, 1, 12, 7, 1, 1, 11, 11, 6, 3, 4, 6, 9, 12, 2, 2, 8, 7, 7, 11, 5, 5, 9], // 1 0.998
            // [12, 12, 9, 9, 5, 5, 7, 2, 8, 8, 4, 12, 3, 4, 1, 11, 10, 7, 2, 8, 7, 1, 6, 9, 9, 3, 11, 4, 3, 1, 6, 2, 5, 10, 2, 1, 11, 10, 10, 6, 8, 6, 4, 7, 12, 5, 11, 3], // 1 0.95
            // [10, 6, 12, 5, 4, 9, 10, 11, 1, 12, 2, 8, 7, 2, 1, 6, 7, 7, 3, 3, 7, 8, 5, 2, 2, 1, 6, 4, 10, 12, 8, 3, 9, 9, 11, 4, 11, 8, 10, 1, 4, 5, 6, 12, 5, 11, 3, 9], // 1 0.972
            // [5, 3, 3, 1, 12, 5, 12, 4, 12, 6, 10, 2, 10, 7, 4, 4, 9, 2, 1, 2, 9, 12, 5, 1, 2, 11, 6, 7, 6, 8, 6, 11, 3, 10, 11, 9, 10, 3, 1, 8, 8, 4, 9, 8, 11, 7, 7, 5], // 1 0.94
            // [5, 9, 10, 10, 5, 8, 7, 1, 4, 3, 1, 10, 4, 4, 3, 8, 7, 6, 9, 11, 2, 12, 6, 9, 4, 10, 2, 11, 8, 5, 3, 12, 8, 5, 2, 11, 9, 12, 1, 6, 3, 11, 6, 2, 12, 1, 7, 7], // 1 0.913
            // [7, 12, 8, 5, 6, 9, 9, 10, 4, 9, 12, 7, 3, 1, 10, 2, 2, 8, 8, 4, 5, 11, 7, 6, 4, 6, 10, 12, 10, 1, 1, 11, 3, 4, 8, 11, 1, 11, 3, 2, 2, 6, 5, 5, 9, 12, 3, 7], //2 0.931
            // [7, 9, 8, 4, 11, 12, 7, 12, 6, 4, 10, 8, 11, 3, 3, 9, 2, 3, 6, 4, 10, 1, 5, 1, 4, 12, 11, 6, 8, 6, 5, 2, 12, 7, 10, 10, 2, 3, 5, 2, 9, 11, 1, 8, 5, 1, 7, 9], //2 0.859
            // [8, 11, 6, 7, 5, 8, 12, 3, 4, 2, 1, 4, 7, 10, 3, 2, 3, 1, 9, 6, 11, 5, 5, 6, 4, 12, 9, 11, 12, 6, 7, 1, 7, 10, 11, 2, 12, 1, 2, 8, 10, 10, 9, 8, 3, 9, 4, 5],// 2 0.58
            // [8, 10, 4, 6, 1, 10, 6, 2, 7, 11, 4, 8, 3, 9, 6, 10, 12, 2, 11, 9, 1, 2, 6, 5, 7, 12, 11, 11, 10, 5, 9, 1, 7, 3, 5, 3, 1, 5, 8, 2, 7, 4, 4, 12, 12, 3, 9, 8], // 2 0.95
            // [4, 8, 5, 3, 6, 6, 5, 11, 12, 9, 9, 2, 4, 10, 11, 10, 8, 7, 12, 7, 12, 11, 8, 3, 3, 10, 9, 2, 5, 10, 9, 7, 6, 1, 4, 5, 2, 1, 4, 1, 7, 8, 2, 6, 3, 11, 1, 12], //2 0.892
            // [6, 6, 10, 12, 4, 5, 1, 11, 7, 3, 12, 4, 2, 11, 8, 1, 12, 3, 8, 4, 2, 5, 9, 9, 1, 7, 3, 10, 3, 2, 5, 1, 5, 8, 7, 6, 9, 12, 10, 7, 11, 4, 6, 8, 10, 2, 9, 11], // 2 0.745
            // [7, 12, 6, 12, 12, 5, 11, 12, 9, 8, 4, 4, 2, 3, 9, 5, 10, 6, 1, 7, 2, 11, 8, 3, 4, 11, 10, 1, 3, 11, 2, 8, 10, 5, 9, 8, 1, 5, 6, 4, 3, 7, 1, 10, 7, 2, 6, 9], //2 0.968
            // [3, 11, 8, 10, 10, 3, 5, 5, 12, 4, 1, 6, 7, 8, 1, 3, 8, 11, 7, 10, 12, 7, 12, 10, 6, 4, 9, 11, 8, 2, 9, 5, 9, 4, 4, 12, 5, 1, 3, 2, 11, 1, 2, 2, 6, 9, 6, 7], // 3 0.766
            // [11, 8, 1, 4, 12, 12, 9, 7, 3, 8, 5, 3, 4, 9, 2, 11, 1, 3, 10, 11, 1, 6, 7, 2, 12, 10, 2, 10, 12, 6, 2, 5, 7, 4, 8, 9, 8, 6, 6, 1, 9, 5, 5, 4, 11, 3, 10, 7], // 3 0.903
            // [10, 9, 3, 11, 6, 2, 7, 8, 4, 9, 5, 6, 1, 10, 3, 12, 5, 11, 6, 3, 10, 9, 8, 4, 2, 7, 8, 5, 4, 9, 4, 10, 12, 12, 7, 1, 1, 6, 11, 11, 7, 5, 1, 2, 8, 3, 2, 12], // 3 0.896
            // [6, 2, 3, 9, 12, 7, 10, 4, 6, 3, 6, 11, 7, 4, 1, 9, 5, 8, 7, 2, 9, 5, 4, 12, 11, 1, 10, 12, 10, 4, 11, 5, 8, 8, 10, 3, 12, 8, 2, 1, 2, 1, 11, 5, 3, 7, 9, 6], // 3 0.985
            // [8, 4, 2, 5, 3, 2, 3, 12, 7, 1, 6, 11, 10, 5, 5, 9, 8, 11, 6, 11, 12, 10, 1, 4, 5, 10, 11, 7, 1, 3, 6, 4, 12, 8, 7, 9, 2, 12, 6, 10, 7, 9, 1, 3, 9, 2, 4, 8], // 3 0.82
            // [1, 6, 12, 11, 3, 7, 11, 5, 1, 9, 10, 2, 4, 3, 7, 7, 1, 2, 1, 9, 3, 9, 8, 10, 5, 5, 2, 10, 12, 12, 7, 4, 6, 8, 9, 5, 4, 10, 6, 3, 4, 11, 8, 8, 11, 2, 6, 12],// 3 0.874
            // [2, 4, 12, 2, 9, 3, 6, 2, 8, 11, 4, 6, 12, 7, 1, 10, 7, 11, 3, 5, 12, 7, 2, 10, 6, 5, 11, 6, 8, 4, 1, 8, 11, 3, 5, 8, 7, 9, 9, 1, 10, 5, 9, 10, 4, 1, 12, 3], // 3 0.969
            // [4, 5, 6, 3, 1, 4, 11, 3, 4, 7, 8, 2, 12, 7, 2, 8, 5, 10, 6, 10, 12, 11, 2, 10, 1, 9, 1, 7, 7, 8, 11, 11, 3, 9, 6, 9, 10, 6, 12, 4, 1, 5, 2, 12, 5, 9, 3, 8], // 4 0.937
            // [9, 12, 5, 11, 8, 11, 2, 9, 10, 6, 1, 3, 1, 10, 2, 6, 4, 12, 11, 3, 9, 11, 7, 4, 5, 7, 7, 9, 10, 4, 2, 1, 4, 8, 7, 5, 8, 6, 1, 3, 12, 5, 10, 8, 6, 12, 3, 2], // 4 0.784
            // [2, 10, 4, 7, 3, 10, 6, 7, 1, 4, 11, 8, 6, 9, 5, 3, 3, 4, 12, 1, 7, 2, 10, 1, 5, 11, 9, 12, 6, 2, 7, 5, 3, 8, 6, 1, 12, 11, 12, 4, 9, 2, 8, 8, 10, 11, 9, 5], // 4 0.908
            // [10, 8, 6, 5, 4, 9, 9, 8, 7, 10, 11, 11, 10, 2, 3, 6, 1, 4, 12, 7, 1, 3, 11, 1, 4, 8, 12, 11, 2, 7, 3, 8, 1, 12, 9, 9, 2, 5, 6, 5, 10, 6, 12, 4, 2, 5, 7, 3], // 4 0.88
            // [4, 1, 4, 3, 12, 6, 7, 1, 10, 3, 9, 4, 2, 5, 11, 11, 6, 8, 5, 2, 2, 3, 9, 7, 6, 6, 7, 7, 4, 5, 8, 1, 12, 8, 12, 10, 5, 3, 9, 9, 11, 12, 2, 11, 10, 10, 1, 8], // 4 0.848
            // [4, 7, 10, 11, 4, 2, 5, 8, 1, 6, 11, 9, 1, 4, 5, 10, 10, 8, 8, 10, 9, 3, 2, 7, 5, 12, 8, 3, 5, 9, 1, 9, 3, 12, 7, 7, 12, 11, 6, 1, 2, 6, 3, 11, 6, 2, 12, 4], //5 0.923
            // [11, 2, 12, 2, 6, 5, 4, 9, 4, 3, 2, 12, 11, 3, 3, 4, 10, 8, 5, 5, 6, 9, 4, 2, 7, 8, 11, 12, 1, 9, 10, 9, 1, 11, 7, 10, 1, 12, 3, 6, 10, 8, 1, 8, 5, 6, 7, 7], // 5 0.966
            // [10, 9, 7, 1, 11, 5, 12, 6, 6, 5, 7, 2, 5, 12, 10, 8, 4, 11, 6, 8, 2, 5, 1, 11, 7, 10, 4, 2, 1, 9, 3, 11, 1, 12, 8, 9, 2, 6, 4, 3, 9, 7, 8, 3, 3, 4, 10, 12], // 5 0.883
            // [11, 9, 7, 1, 7, 1, 1, 6, 10, 1, 10, 6, 8, 12, 4, 11, 8, 2, 11, 6, 2, 9, 2, 3, 3, 10, 4, 7, 5, 8, 2, 3, 11, 6, 5, 9, 4, 8, 7, 10, 12, 4, 9, 12, 3, 12, 5, 5], // 5 0.888
            // [7, 11, 6, 5, 8, 4, 7, 12, 8, 4, 1, 3, 3, 8, 10, 3, 5, 1, 9, 12, 1, 12, 6, 7, 2, 6, 2, 10, 4, 11, 9, 5, 1, 2, 11, 3, 5, 11, 12, 2, 10, 10, 4, 9, 7, 8, 9, 6], // 7 0.909
            // [4, 4, 8, 5, 9, 5, 1, 5, 9, 11, 10, 6, 10, 6, 8, 2, 11, 7, 12, 8, 10, 6, 11, 3, 4, 3, 12, 12, 5, 2, 6, 9, 9, 1, 4, 8, 11, 10, 3, 7, 1, 2, 2, 12, 7, 3, 1, 7], // 8 0.211
            // [9, 6, 10, 5, 10, 8, 1, 7, 1, 10, 3, 1, 2, 9, 3, 11, 6, 12, 4, 5, 12, 11, 6, 10, 1, 9, 8, 2, 8, 7, 3, 9, 12, 12, 7, 4, 7, 5, 6, 5, 4, 3, 2, 11, 11, 4, 8, 2], // 8 0.8
            // [12, 6, 4, 7, 9, 10, 7, 7, 11, 9, 3, 1, 9, 10, 5, 1, 2, 3, 11, 2, 8, 12, 1, 5, 3, 1, 6, 5, 4, 4, 12, 10, 12, 2, 8, 9, 6, 10, 2, 3, 8, 4, 8, 7, 11, 6, 5, 11], // 8 0.372
            // [4, 5, 1, 5, 11, 8, 3, 11, 2, 6, 6, 12, 6, 10, 4, 7, 3, 3, 11, 1, 8, 10, 7, 2, 7, 8, 10, 1, 12, 1, 4, 9, 3, 10, 5, 5, 7, 9, 2, 4, 6, 12, 11, 8, 9, 9, 2, 12], // 9 0.911
            //[11, 4, 1, 4, 3, 1, 2, 5, 6, 8, 12, 9, 7, 8, 9, 6, 6, 5, 1, 11, 4, 2, 9, 7, 2, 8, 6, 7, 10, 12, 8, 3, 11, 4, 11, 7, 2, 3, 10, 5, 10, 10, 3, 1, 12, 9, 12, 5], // 10 0.911
            // [6, 9, 12, 6, 3, 3, 1, 5, 5, 8, 1, 9, 3, 7, 4, 9, 2, 5, 10, 11, 12, 1, 8, 11, 10, 6, 12, 8, 4, 1, 7, 2, 3, 9, 12, 4, 5, 10, 2, 11, 6, 11, 4, 2, 7, 10, 8, 7], // 10 0.86
            // [11, 10, 12, 4, 5, 9, 8, 1, 3, 6, 5, 6, 10, 10, 1, 2, 8, 12, 9, 4, 7, 8, 1, 2, 12, 9, 1, 5, 6, 7, 4, 3, 3, 11, 7, 11, 3, 7, 11, 12, 2, 9, 6, 8, 10, 4, 2, 5], // 10 0.503
        ]
    }
]

let testArrs = function () {
    for (var i = 0; i < TEST_ARRS.length; i++) {
        let mapArrs = TEST_ARRS[i];
        console.log(`测试行为${mapArrs.row}, 列为${mapArrs.col}的数组`);
        for (var j = 0; j < mapArrs.arrs.length; j++) {
            console.log(`开始测试第${j + 1}个数组`)
            let arrInfo = playOneArr(mapArrs.arrs[j], mapArrs.row, mapArrs.col, mapArrs.minPairs, mapArrs.maxPairs);
            //console.log("测试结果", arrInfo.rate);
        }
    }
}

//testArrs();

for (let mapConfig of LEVEL_MAP_CONFIGS) {
    generatePlayDatas(mapConfig);
}
