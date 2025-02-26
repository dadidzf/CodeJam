const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { assert } = require('console');
const { argv } = require('process');

// 函数：下载图片并转换为PNG
async function convertWebpToPng(inputUrl, outputPath) {
    try {
        // 检查输入是否为HTTP链接
        // 直接使用sharp处理本地文件
        await sharp(inputUrl).png().toFile(outputPath);
        console.log(`转换成功，输出文件为${outputPath}`);
    }
    catch (err) {
        console.error('转换失败 ---', err);
    }
}


assert(argv[2], "请传入目标文件夹")
var dir = argv[2]

let outdir = path.join(dir, "outdir");
if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir);
}

//根据文件路径读取文件，返回文件列表
fs.readdir(dir, function (err, files) {
    if (err) {
        console.warn(err, "读取文件夹错误！")
    } else {
        //遍历读取到的文件列表
        let index = 1;
        files.forEach(async function (filename) {
            if (filename.endsWith(".webp")) {
                let outName = path.join(outdir, filename.slice(0, -5) + ".png");
                if (argv[3] == "重命名") {
                    outName = path.join(outdir, `${index++}.png`);
                }
                await convertWebpToPng(path.join(dir, filename), outName);
            }
        });
    }
});