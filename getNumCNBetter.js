var _numMapSpell = {
    "0": "零",
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "七",
    "8": "八",
    "9": "九",
}

var _posMapUnit = ["", "十", "百", "千"]

var _splitUnit = ["", "万", "亿"]

var getNumCNSpell = function (num) {
    if (typeof (num) === "number" && num % 1 === 0 && num > 0 && num <= 10000000000) {
        var numStr = num + ""
        var len = numStr.length
        var retStr = ""
        var lastLingCnt = 0

        for (var i = 0; i < len; i++) {
            var rIndex = len - i - 1 // 反序索引
            var pos = rIndex % 4 // 千百十个 -> 3210
            var val = numStr[i]

            if (val === "0") {
                lastLingCnt++
            }
            else {
                if (lastLingCnt > 0) {
                    retStr += "零"
                    lastLingCnt = 0
                }
            }

            if (pos === 0 && val === "2" && i === 0 && len > 4) { // 两万 两亿的情况
                retStr += "两"
            }
            else if (pos === 1 && val === "1" &&  // 十一，十二 不读一的情况
                (i - 1 < 0 || numStr[i - 1] === "0") &&
                (i - 2 < 0 || numStr[i - 2] === "0")) {
                retStr += ""
            }
            else if (pos >= 2 && val === "2") { // 千位，百位读两
                retStr += "两"
            }
            else {
                if (val !== "0") {
                    retStr += _numMapSpell[numStr[i]]
                }
            }

            if (val !== "0") {
                retStr += _posMapUnit[pos]
            }

            if (rIndex % 4 === 0 && lastLingCnt < 4) {
                retStr += _splitUnit[Math.floor(rIndex / 4)]
            }
        }

        return retStr
    }
    else {
        console.error("getNumCNSpell invalid num !, must be interget and bigger than 0 and less than 1000000001 ")
    }
}

console.log(getNumCNSpell(17))
console.log(getNumCNSpell(10))
console.log(getNumCNSpell(117))
console.log(getNumCNSpell(100017))
console.log(getNumCNSpell(123456789))
console.log(getNumCNSpell(200100202))
console.log(getNumCNSpell(200000222))
console.log(getNumCNSpell(2))
console.log(getNumCNSpell(20))
console.log(getNumCNSpell(200))
console.log(getNumCNSpell(2000))
console.log(getNumCNSpell(20000))
console.log(getNumCNSpell(200000000))
console.log(getNumCNSpell(222222222))
