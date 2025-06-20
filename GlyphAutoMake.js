const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');
const Fontmin = require('fontmin');

console.log("此次字体输出操作目录路径为", argv[2]);
if (!fs.statSync(argv[2]).isDirectory()) {
    console.error(`当前输入路径 ${argv[2]} 不是一个目录！`);
}

dir = argv[2];

//根据文件路径读取文件，返回文件列表
fs.readdir(dir, function (err, files) {
    if (err) {
        console.warn(err, "读取文件夹错误！")
    } else {
        let outDir = path.join(dir, "outfnts");
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir);
        };
        files.forEach(async function (file) {
            if (file.endsWith(".GlyphProject")) {
                console.log("当前正在处理字体工程", file);
                let filename = file.slice(0, -13);
                if (fs.existsSync(path.join(dir, filename + ".txt"))) {
                    try {
                        const options = {
                            cwd: dir
                        };

                        const output = execSync(`"/Applications/Glyph Designer.app/Contents/MacOS/Glyph Designer" ${filename}.GlyphProject ${path.join("outfnts", filename)} -inf ${filename}.txt`, options);
                        //console.log(`标准输出: ${output}`);
                    } catch (error) {
                        console.error(`执行出错: ${error}`);
                    }
                }
                else {
                    console.log(`字体文本文件${filename}.txt不存在！`)
                }

            }
        });
    }
})


// 裁剪ttf字体
let ttftxtDir = path.join(dir, "ttftxt");
if (fs.existsSync(ttftxtDir)) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(ttftxtDir, function (err, files) {
        if (err) {
            console.warn(err, "读取文件夹错误！")
        } else {
            let outDir = path.join(ttftxtDir, "outttfs");
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir);
            };
            files.forEach(async function (file) {
                if (file.endsWith(".txt")) {
                    let filename = file.slice(0, -4);
                    console.log("当前正在裁剪字体", filename);
                    if (fs.existsSync(path.join(dir, filename + ".ttf"))) {
                        try {
                            const options = {
                                cwd: dir
                            };

                            var txt = fs.readFileSync(path.join(ttftxtDir, file));
                            var fontmin = new Fontmin()
                                .src(path.join(dir, `${filename}.ttf`))
                                .use(Fontmin.glyph({ text: txt }))
                                .dest(path.join(dir, "ttftxt/outttfs"));

                            fontmin.run(function (err, files) {
                                if (err) {
                                    throw err;
                                }

                                console.log(files[0]);
                                // => { contents: <Buffer 00 01 00 ...> }
                            });
                        } catch (error) {
                            console.error(`执行出错: ${error}`);
                        }
                    }
                    else {
                        console.log(`字体文件${filename}.ttf不存在！`)
                    }

                }
            });
        }
    })
}