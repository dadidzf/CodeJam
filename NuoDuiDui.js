let ROW = 10; // 行数
let COL = 8; // 列数
let FILE_NAME = "medium"
let INIT_MIN_PAIR = 5; // 初始数组最少多少个队子 
let INIT_MAX_PAIR = 12; // 初始数组最多允许多少个对子
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

let TEMPLATE_6x8_ARR = [
    [7, 5, 2, 1, 4, 9, 7, 4, 12, 11, 8, 9, 6, 10, 7, 2, 8, 5, 12, 11, 10, 3, 12, 1, 11, 1, 6, 2, 6, 2, 8, 8, 10, 5, 5, 3, 9, 3, 11, 1, 10, 6, 4, 7, 4, 9, 3, 12], // 1 0.828 
    [11, 9, 10, 1, 6, 4, 10, 5, 10, 8, 1, 7, 12, 12, 7, 4, 8, 11, 6, 7, 11, 9, 2, 6, 3, 12, 5, 7, 10, 9, 3, 1, 6, 4, 2, 9, 1, 8, 2, 12, 5, 3, 8, 2, 3, 5, 4, 11], // 1 0.99
    [11, 2, 2, 12, 4, 12, 6, 7, 11, 3, 10, 2, 8, 7, 4, 1, 11, 6, 8, 4, 1, 9, 3, 5, 7, 12, 3, 10, 7, 5, 5, 9, 10, 5, 8, 1, 12, 3, 6, 4, 9, 1, 11, 8, 10, 2, 9, 6], // 1 0.937
    [12, 8, 5, 11, 4, 9, 10, 8, 9, 6, 8, 2, 10, 1, 6, 7, 3, 10, 3, 5, 2, 3, 10, 4, 12, 4, 1, 12, 7, 1, 1, 11, 11, 6, 3, 4, 6, 9, 12, 2, 2, 8, 7, 7, 11, 5, 5, 9], // 1 0.998
    [12, 12, 9, 9, 5, 5, 7, 2, 8, 8, 4, 12, 3, 4, 1, 11, 10, 7, 2, 8, 7, 1, 6, 9, 9, 3, 11, 4, 3, 1, 6, 2, 5, 10, 2, 1, 11, 10, 10, 6, 8, 6, 4, 7, 12, 5, 11, 3], // 1 0.95
    [10, 6, 12, 5, 4, 9, 10, 11, 1, 12, 2, 8, 7, 2, 1, 6, 7, 7, 3, 3, 7, 8, 5, 2, 2, 1, 6, 4, 10, 12, 8, 3, 9, 9, 11, 4, 11, 8, 10, 1, 4, 5, 6, 12, 5, 11, 3, 9], // 1 0.972
    [5, 3, 3, 1, 12, 5, 12, 4, 12, 6, 10, 2, 10, 7, 4, 4, 9, 2, 1, 2, 9, 12, 5, 1, 2, 11, 6, 7, 6, 8, 6, 11, 3, 10, 11, 9, 10, 3, 1, 8, 8, 4, 9, 8, 11, 7, 7, 5], // 1 0.94
    [5, 9, 10, 10, 5, 8, 7, 1, 4, 3, 1, 10, 4, 4, 3, 8, 7, 6, 9, 11, 2, 12, 6, 9, 4, 10, 2, 11, 8, 5, 3, 12, 8, 5, 2, 11, 9, 12, 1, 6, 3, 11, 6, 2, 12, 1, 7, 7], // 1 0.913
    [7, 12, 8, 5, 6, 9, 9, 10, 4, 9, 12, 7, 3, 1, 10, 2, 2, 8, 8, 4, 5, 11, 7, 6, 4, 6, 10, 12, 10, 1, 1, 11, 3, 4, 8, 11, 1, 11, 3, 2, 2, 6, 5, 5, 9, 12, 3, 7], //2 0.931
    [7, 9, 8, 4, 11, 12, 7, 12, 6, 4, 10, 8, 11, 3, 3, 9, 2, 3, 6, 4, 10, 1, 5, 1, 4, 12, 11, 6, 8, 6, 5, 2, 12, 7, 10, 10, 2, 3, 5, 2, 9, 11, 1, 8, 5, 1, 7, 9], //2 0.859
    [8, 11, 6, 7, 5, 8, 12, 3, 4, 2, 1, 4, 7, 10, 3, 2, 3, 1, 9, 6, 11, 5, 5, 6, 4, 12, 9, 11, 12, 6, 7, 1, 7, 10, 11, 2, 12, 1, 2, 8, 10, 10, 9, 8, 3, 9, 4, 5],// 2 0.58
    [8, 10, 4, 6, 1, 10, 6, 2, 7, 11, 4, 8, 3, 9, 6, 10, 12, 2, 11, 9, 1, 2, 6, 5, 7, 12, 11, 11, 10, 5, 9, 1, 7, 3, 5, 3, 1, 5, 8, 2, 7, 4, 4, 12, 12, 3, 9, 8], // 2 0.95
    [4, 8, 5, 3, 6, 6, 5, 11, 12, 9, 9, 2, 4, 10, 11, 10, 8, 7, 12, 7, 12, 11, 8, 3, 3, 10, 9, 2, 5, 10, 9, 7, 6, 1, 4, 5, 2, 1, 4, 1, 7, 8, 2, 6, 3, 11, 1, 12], //2 0.892
    [6, 6, 10, 12, 4, 5, 1, 11, 7, 3, 12, 4, 2, 11, 8, 1, 12, 3, 8, 4, 2, 5, 9, 9, 1, 7, 3, 10, 3, 2, 5, 1, 5, 8, 7, 6, 9, 12, 10, 7, 11, 4, 6, 8, 10, 2, 9, 11], // 2 0.745
    [7, 12, 6, 12, 12, 5, 11, 12, 9, 8, 4, 4, 2, 3, 9, 5, 10, 6, 1, 7, 2, 11, 8, 3, 4, 11, 10, 1, 3, 11, 2, 8, 10, 5, 9, 8, 1, 5, 6, 4, 3, 7, 1, 10, 7, 2, 6, 9], //2 0.968
    [3, 11, 8, 10, 10, 3, 5, 5, 12, 4, 1, 6, 7, 8, 1, 3, 8, 11, 7, 10, 12, 7, 12, 10, 6, 4, 9, 11, 8, 2, 9, 5, 9, 4, 4, 12, 5, 1, 3, 2, 11, 1, 2, 2, 6, 9, 6, 7], // 3 0.766
    [11, 8, 1, 4, 12, 12, 9, 7, 3, 8, 5, 3, 4, 9, 2, 11, 1, 3, 10, 11, 1, 6, 7, 2, 12, 10, 2, 10, 12, 6, 2, 5, 7, 4, 8, 9, 8, 6, 6, 1, 9, 5, 5, 4, 11, 3, 10, 7], // 3 0.903
    [10, 9, 3, 11, 6, 2, 7, 8, 4, 9, 5, 6, 1, 10, 3, 12, 5, 11, 6, 3, 10, 9, 8, 4, 2, 7, 8, 5, 4, 9, 4, 10, 12, 12, 7, 1, 1, 6, 11, 11, 7, 5, 1, 2, 8, 3, 2, 12], // 3 0.896
    [6, 2, 3, 9, 12, 7, 10, 4, 6, 3, 6, 11, 7, 4, 1, 9, 5, 8, 7, 2, 9, 5, 4, 12, 11, 1, 10, 12, 10, 4, 11, 5, 8, 8, 10, 3, 12, 8, 2, 1, 2, 1, 11, 5, 3, 7, 9, 6], // 3 0.985
    [8, 4, 2, 5, 3, 2, 3, 12, 7, 1, 6, 11, 10, 5, 5, 9, 8, 11, 6, 11, 12, 10, 1, 4, 5, 10, 11, 7, 1, 3, 6, 4, 12, 8, 7, 9, 2, 12, 6, 10, 7, 9, 1, 3, 9, 2, 4, 8], // 3 0.82
    [1, 6, 12, 11, 3, 7, 11, 5, 1, 9, 10, 2, 4, 3, 7, 7, 1, 2, 1, 9, 3, 9, 8, 10, 5, 5, 2, 10, 12, 12, 7, 4, 6, 8, 9, 5, 4, 10, 6, 3, 4, 11, 8, 8, 11, 2, 6, 12],// 3 0.874
    [2, 4, 12, 2, 9, 3, 6, 2, 8, 11, 4, 6, 12, 7, 1, 10, 7, 11, 3, 5, 12, 7, 2, 10, 6, 5, 11, 6, 8, 4, 1, 8, 11, 3, 5, 8, 7, 9, 9, 1, 10, 5, 9, 10, 4, 1, 12, 3], // 3 0.969
    [4, 5, 6, 3, 1, 4, 11, 3, 4, 7, 8, 2, 12, 7, 2, 8, 5, 10, 6, 10, 12, 11, 2, 10, 1, 9, 1, 7, 7, 8, 11, 11, 3, 9, 6, 9, 10, 6, 12, 4, 1, 5, 2, 12, 5, 9, 3, 8], // 4 0.937
    [9, 12, 5, 11, 8, 11, 2, 9, 10, 6, 1, 3, 1, 10, 2, 6, 4, 12, 11, 3, 9, 11, 7, 4, 5, 7, 7, 9, 10, 4, 2, 1, 4, 8, 7, 5, 8, 6, 1, 3, 12, 5, 10, 8, 6, 12, 3, 2], // 4 0.784
    [2, 10, 4, 7, 3, 10, 6, 7, 1, 4, 11, 8, 6, 9, 5, 3, 3, 4, 12, 1, 7, 2, 10, 1, 5, 11, 9, 12, 6, 2, 7, 5, 3, 8, 6, 1, 12, 11, 12, 4, 9, 2, 8, 8, 10, 11, 9, 5], // 4 0.908
    [10, 8, 6, 5, 4, 9, 9, 8, 7, 10, 11, 11, 10, 2, 3, 6, 1, 4, 12, 7, 1, 3, 11, 1, 4, 8, 12, 11, 2, 7, 3, 8, 1, 12, 9, 9, 2, 5, 6, 5, 10, 6, 12, 4, 2, 5, 7, 3], // 4 0.88
    [4, 1, 4, 3, 12, 6, 7, 1, 10, 3, 9, 4, 2, 5, 11, 11, 6, 8, 5, 2, 2, 3, 9, 7, 6, 6, 7, 7, 4, 5, 8, 1, 12, 8, 12, 10, 5, 3, 9, 9, 11, 12, 2, 11, 10, 10, 1, 8], // 4 0.848
    [4, 7, 10, 11, 4, 2, 5, 8, 1, 6, 11, 9, 1, 4, 5, 10, 10, 8, 8, 10, 9, 3, 2, 7, 5, 12, 8, 3, 5, 9, 1, 9, 3, 12, 7, 7, 12, 11, 6, 1, 2, 6, 3, 11, 6, 2, 12, 4], //5 0.923
    [11, 2, 12, 2, 6, 5, 4, 9, 4, 3, 2, 12, 11, 3, 3, 4, 10, 8, 5, 5, 6, 9, 4, 2, 7, 8, 11, 12, 1, 9, 10, 9, 1, 11, 7, 10, 1, 12, 3, 6, 10, 8, 1, 8, 5, 6, 7, 7], // 5 0.966
    [10, 9, 7, 1, 11, 5, 12, 6, 6, 5, 7, 2, 5, 12, 10, 8, 4, 11, 6, 8, 2, 5, 1, 11, 7, 10, 4, 2, 1, 9, 3, 11, 1, 12, 8, 9, 2, 6, 4, 3, 9, 7, 8, 3, 3, 4, 10, 12], // 5 0.883
    [11, 9, 7, 1, 7, 1, 1, 6, 10, 1, 10, 6, 8, 12, 4, 11, 8, 2, 11, 6, 2, 9, 2, 3, 3, 10, 4, 7, 5, 8, 2, 3, 11, 6, 5, 9, 4, 8, 7, 10, 12, 4, 9, 12, 3, 12, 5, 5], // 5 0.888
    [7, 11, 6, 5, 8, 4, 7, 12, 8, 4, 1, 3, 3, 8, 10, 3, 5, 1, 9, 12, 1, 12, 6, 7, 2, 6, 2, 10, 4, 11, 9, 5, 1, 2, 11, 3, 5, 11, 12, 2, 10, 10, 4, 9, 7, 8, 9, 6], // 7 0.909
    [4, 4, 8, 5, 9, 5, 1, 5, 9, 11, 10, 6, 10, 6, 8, 2, 11, 7, 12, 8, 10, 6, 11, 3, 4, 3, 12, 12, 5, 2, 6, 9, 9, 1, 4, 8, 11, 10, 3, 7, 1, 2, 2, 12, 7, 3, 1, 7], // 8 0.211
    [9, 6, 10, 5, 10, 8, 1, 7, 1, 10, 3, 1, 2, 9, 3, 11, 6, 12, 4, 5, 12, 11, 6, 10, 1, 9, 8, 2, 8, 7, 3, 9, 12, 12, 7, 4, 7, 5, 6, 5, 4, 3, 2, 11, 11, 4, 8, 2], // 8 0.8
    [12, 6, 4, 7, 9, 10, 7, 7, 11, 9, 3, 1, 9, 10, 5, 1, 2, 3, 11, 2, 8, 12, 1, 5, 3, 1, 6, 5, 4, 4, 12, 10, 12, 2, 8, 9, 6, 10, 2, 3, 8, 4, 8, 7, 11, 6, 5, 11], // 8 0.372
    [4, 5, 1, 5, 11, 8, 3, 11, 2, 6, 6, 12, 6, 10, 4, 7, 3, 3, 11, 1, 8, 10, 7, 2, 7, 8, 10, 1, 12, 1, 4, 9, 3, 10, 5, 5, 7, 9, 2, 4, 6, 12, 11, 8, 9, 9, 2, 12], // 9 0.911
    [11, 4, 1, 4, 3, 1, 2, 5, 6, 8, 12, 9, 7, 8, 9, 6, 6, 5, 1, 11, 4, 2, 9, 7, 2, 8, 6, 7, 10, 12, 8, 3, 11, 4, 11, 7, 2, 3, 10, 5, 10, 10, 3, 1, 12, 9, 12, 5], // 10 0.911
    [6, 9, 12, 6, 3, 3, 1, 5, 5, 8, 1, 9, 3, 7, 4, 9, 2, 5, 10, 11, 12, 1, 8, 11, 10, 6, 12, 8, 4, 1, 7, 2, 3, 9, 12, 4, 5, 10, 2, 11, 6, 11, 4, 2, 7, 10, 8, 7], // 10 0.86
    [11, 10, 12, 4, 5, 9, 8, 1, 3, 6, 5, 6, 10, 10, 1, 2, 8, 12, 9, 4, 7, 8, 1, 2, 12, 9, 1, 5, 6, 7, 4, 3, 3, 11, 7, 11, 3, 7, 11, 12, 2, 9, 6, 8, 10, 4, 2, 5], // 10 0.503
]

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

RET_IF_FIND_ONE = 1; // 找到一个答案就返回
RET_IF_FIND_DIRECT_PAIR = 2; // 找到一个无需移动直接配对的答案就返回
RET_IF_FIND_SLIDE_PAIR = 3; // 找到一个移动的答案就返回
FIND_ALL_PAIR = 4; // 找到所有的答案

function squareSpiralFromCenter(matrix) {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [];

    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = [];

    // 计算中心点坐标（对于偶数尺寸选择偏左上方的中心）
    let centerRow = Math.floor((rows - 1) / 2);
    let centerCol = Math.floor((cols - 1) / 2);

    console.log("--------------", centerRow, centerCol);

    // 定义方向：右、下、左、上
    const directions = [
        [0, 1],  // 右
        [1, 0],  // 下
        [0, -1], // 左
        [-1, 0]  // 上
    ];

    let direction = 0; // 初始方向向右
    let stepSize = 1;  // 初始步长
    let stepsTaken = 0; // 当前方向已走步数
    let currentRow = centerRow;
    let currentCol = centerCol;

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
            direction = (direction + 1) % 4;

            // 每两次方向改变后增加步长
            if (direction % 2 === 0) {
                stepSize++;
            }
        }
    }

    return result;
}

let arr = generateMahjongArr();
arr = convertTo2D(arr, COL);
let spiralCoords = squareSpiralFromCenter(arr);

// 查找答案，去重
let findAnswers = function (boardArr, maxRow, maxCol, findType, keepRepeatAnswer) {
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
    let copyArr = spiralCoords.concat();
    Math.random() >= 0 && shuffleArray(copyArr);
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

        // if (startRow === 0 && startCol === 4){
        //     console.log("here", alreadyHandledRowColSet);
        // }

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
                    // 直接判断当前方向相邻的麻将是否匹配
                    destRow = startRow + rowDir;
                    destCol = startCol + colDir;
                    // 去重，只往正方向走
                    // if (!keepRepeatAnswer && (colDir < 0 || rowDir < 0)) {
                    //     continue;
                    // }

                    if (isValidRow(destRow, ROW) && isValidCol(destCol, COL) && (boardArr[destRow][destCol] === boardArr[startRow][startCol])) {
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
                    if (pushStep >= 1 && isValidRow(destRow, ROW) && isValidCol(destCol, COL) && (boardArr[destRow][destCol] === boardArr[startRow][startCol])) {
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
                            if (isValidRow(destRow, ROW) && isValidCol(destCol, COL)) {
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

let tempArrIndex = 0;
let playOneArr = function (arr) {
    let boardArr = arr || generateMahjongArr();
    //let boardArr = TEMPLATE_6x8_ARR[tempArrIndex++];
    arr = convertTo2D(boardArr, COL);
    let answerInfo = findAnswers(arr, ROW, COL, FIND_ALL_PAIR, false);
    let answers = answerInfo.answers;

    if (answers.length < INIT_MIN_PAIR || answers.length > INIT_MAX_PAIR) {
        console.log("数组初始配对超出范围");
        return;
    }
    else {
        let answerInfo = findAnswers(arr, ROW, COL, FIND_ALL_PAIR, true);
        let answers = answerInfo.answers;
        for (let answer of answers) {
            if (answer.dests.length > 1) {
                console.log("数组初始配对，存在多个相邻的情况！");
                return;
            }
        }
    }

    //console.log("数组符合要求！")

    let completeCnt = 0;
    for (var i = 0; i < MAX_PLAY_TIMES; i++) {
        arr = convertTo2D(boardArr, COL);
        let clickCnt = 0;
        while (1) {
            //printBoard(arr, ROW);
            let answerInfo;
            let answers = [];
            clickCnt++;
            if (clickCnt <= INIT_MIN_PAIR) {
                answerInfo = findAnswers(arr, ROW, COL, RET_IF_FIND_DIRECT_PAIR, false);
                answers = answerInfo.directAnswers;
            }
            if (answers.length <= 0) {
                answerInfo = findAnswers(arr, ROW, COL, RET_IF_FIND_ONE, false);
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
                applyAnswer(arr, answer.start, answer.dests[0].dest, answer.dests[0].dir, answer.dests[0].mahjongCnt);
            }
            else {
                //console.log("数组已经无解！", answerInfo.tryBlockCnt)
                break;
            }
        }
    }
    //let levelArr = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 7, 8, 8, 8, 9, 10, 10, 10];
    console.log(`尝试${MAX_PLAY_TIMES}次后, 完全消除比例`, /*levelArr[tryTimes - 1]*/ "", completeCnt / MAX_PLAY_TIMES);
    return {
        rate: completeCnt / MAX_PLAY_TIMES,
        arr: boardArr
    }
}

const fs = require('fs')

let generatePlayDatas = function () {
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
                if ((Object.keys(fullCntMap).length >= 10) || (tryTimes >= 500)) {
                    console.log("全部已经炼完!, tryTimes", tryTimes)
                    fs.writeFileSync(`MahjongConfig/${FILE_NAME}.json`, JSON.stringify(goodArr), 'utf8');
                    break;
                }
            }
        }
    }
}

let testOneArr = function () {
    let arr = [
        14, 3, 12, 1, 16, 4, 5, 8, 16, 14, 5, 4, 8, 12, 7, 10, 10, 15, 3, 9, 6, 20, 16, 19, 6, 17, 13, 1, 11, 7, 19, 18, 1, 4, 16, 5, 18, 8, 14, 15, 15, 12, 18, 18, 5, 9, 10, 2, 13, 12, 15, 20, 14, 6, 2, 13, 9, 11, 4, 11, 2, 17, 20, 3, 9, 13, 19, 10, 2, 11, 7, 6, 1, 3, 19, 8, 7, 17, 20, 17
    ]
    let arrInfo = playOneArr(arr);
    console.log("测试一个数组的结果", arrInfo);
}

testOneArr();

//generatePlayDatas();