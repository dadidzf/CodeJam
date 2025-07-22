const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');
const Fontmin = require('fontmin');

console.log("此次字体输出操作目录路径为", argv[2]);
if (!fs.statSync(argv[2]).isDirectory()) {
    console.error(`当前输入路径 ${argv[2]} 不是一个目录！`);
}

// 工作目录
let dir = argv[2];

// 封装读取翻译数据的函数，递归读取目录下所有文件
function readTranslations(baseDir) {
    const translations = {};

    // 递归读取目录的辅助函数
    function readDirectory(dir) {
        if (fs.existsSync(dir)) {
            try {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);

                    if (stats.isDirectory()) {
                        // 如果是目录，递归调用 readDirectory
                        readDirectory(filePath);
                    } else if (file.endsWith('.json')) {
                        try {
                            const fileContent = fs.readFileSync(filePath, 'utf8');
                            const jsonData = JSON.parse(fileContent);
                            // 生成唯一的 key，使用相对路径 + 文件名
                            const relativePath = path.relative(baseDir, filePath);
                            let lang = relativePath.replace(/[\\/]/g, '-').replace('.json', '');
                            let originalLang = lang;
                            let counter = 1;

                            while (translations[lang]) {
                                lang = `${originalLang}-${counter}`;
                                counter++;
                            }

                            translations[lang] = jsonData;
                        } catch (parseError) {
                            console.error(`解析 JSON 文件 ${filePath} 出错:`, parseError);
                        }
                    }
                });
            } catch (readError) {
                console.error(`读取目录 ${dir} 出错:`, readError);
            }
        } else {
            console.warn(`目录 ${dir} 不存在`);
        }
    }

    // 从基础目录开始读取
    readDirectory(baseDir);
    return translations;
}

let generateBmfonts = function (dir, langDir, langName) {
    const ttfDir = path.join(dir, 'configs/bmfont');
    const outputDir = path.join(langDir, 'fonts');

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (fs.existsSync(ttfDir)) {
        try {
            const files = fs.readdirSync(ttfDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const jsonFilePath = path.join(ttfDir, file);
                    const projectFileName = file.replace('.json', '.GlyphProject');
                    const projectFilePath = path.join(dir, projectFileName);
                    const outputFontRelativePath = path.relative(dir, path.join(outputDir, projectFileName.replace('.GlyphProject', '')));

                    // 检查对应的 .GlyphProject 文件是否存在
                    if (fs.existsSync(projectFilePath)) {
                        try {
                            // 读取 JSON 文件内容
                            const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
                            const keysArray = JSON.parse(jsonContent);

                            // 从 translations 中提取文本内容
                            let translations = readTranslations(langDir);
                            let textContent = '';
                            keysArray.forEach(key => {
                                Object.values(translations).forEach(langData => {
                                    if (langData[key]) {
                                        textContent += langData[key];
                                    }
                                })
                            })


                            // 创建临时文件
                            const tempDir = path.join(dir, 'temp', langName);
                            if (!fs.existsSync(tempDir)) {
                                fs.mkdirSync(tempDir, { recursive: true });
                            }
                            const tempFilePath = path.join(tempDir, `${projectFileName.replace('.GlyphProject', '')}_temp.txt`);
                            fs.writeFileSync(tempFilePath, textContent, 'utf8');
                            const tempFileRelativePath = path.relative(dir, tempFilePath);

                            // 执行 Glyph Designer 命令，使用 -inf 参数
                            const command = `"${path.join('/Applications/Glyph Designer.app/Contents/MacOS/Glyph Designer')}" \
"${projectFileName}" \
"${outputFontRelativePath}" \
-inf ${tempFileRelativePath}`;
                            const options = {
                                cwd: dir
                            };

                            console.log(`开始执行Glyph Designer命令：${command}`);
                            execSync(command, options);
                            console.log(`成功为 ${projectFileName} 生成字体文件`);

                            // 删除临时文件
                            //fs.unlinkSync(tempFilePath);
                        } catch (error) {
                            console.error(`处理 ${projectFileName} 时出错:`, error);
                        }
                    } else {
                        console.log(`${projectFileName}对应的 .GlyphProject 文件  不存在`);
                    }
                }
            });

            //processFntFiles(outputDir);
        } catch (error) {
            console.error(`读取 ${ttfDir} 目录时出错:`, error);
        }
    } else {
        console.warn(`目录 ${ttfDir} 不存在`);
    }
};

let generateBmFontsForAllLang = function (dir) {
    const files = fs.readdirSync(path.join(dir, 'configs/jsons/Lang'));
    files.forEach(file => {
        const filePath = path.join(dir, 'configs/jsons/Lang', file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory() && file !== "HI") {
            generateBmfonts(dir, path.join(dir, 'configs/jsons/Lang', file), file);
        } else {
        }
    });
}

generateBmFontsForAllLang(dir);

let generateTTFs = function (dir) {
    const ttfDir = path.join(dir, 'configs/ttf');
    const outputDir = path.join(dir, 'output');

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (fs.existsSync(ttfDir)) {
        try {
            const files = fs.readdirSync(ttfDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const jsonFilePath = path.join(ttfDir, file);
                    const ttfFileName = file.replace('.json', '.ttf');
                    const ttfFilePath = path.join(dir, ttfFileName);

                    // 检查对应的 .ttf 文件是否存在
                    if (fs.existsSync(ttfFilePath)) {
                        try {
                            // 读取 JSON 文件内容
                            const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
                            let keysArray = JSON.parse(jsonContent);

                            let allKeys = new Set();
                            let translations = readTranslations(path.join(dir, 'configs/jsons'));
                            Object.values(translations).forEach(langData => {
                                Object.keys(langData).forEach(key => allKeys.add(key));
                            });
                            allKeys = Array.from(allKeys);

                            if (keysArray.length === 0) {
                                // 将所有的 key 写入原 JSON 文件
                                //fs.writeFileSync(jsonFilePath, JSON.stringify(allKeys, null, 2), 'utf8');
                                keysArray = allKeys;
                            }

                            let textContent = '';
                            keysArray.forEach(key => {
                                Object.values(translations).forEach(langData => {
                                    if (langData[key]) {
                                        textContent += langData[key];
                                    }
                                });
                            });

                            fs.writeFileSync(path.join(outputDir, ttfFileName + ".txt"), textContent, 'utf8');

                            // 使用 Fontmin 生成字体文件
                            // const fontmin = new Fontmin()
                            //     .src(ttfFilePath)
                            //     .use(Fontmin.glyph({ text: textContent }))
                            //     .dest(outputDir);

                            // fontmin.run(function (err, files) {
                            //     if (err) {
                            //         console.error(`处理 ${ttfFileName} 时出错:`, err);
                            //     } else {
                            //         console.log(`成功为 ${ttfFileName} 生成字体文件`);
                            //     }
                            //});


                            //  使用pyftsubset 命令来生成字体
                            const command = `pyftsubset "${ttfFilePath}" --text-file="${path.join(outputDir, ttfFileName + ".txt")}" --output-file="${path.join(outputDir, ttfFileName)}"`;
                            const options = {
                                cwd: dir
                            };

                            console.log(`开始执行命令：${command}`);
                            execSync(command, options);
                            console.log(`成功为 ${ttfFileName} 生成字体文件`);
                        } catch (error) {
                            console.error(`处理 ${ttfFileName} 时出错:`, error);
                        }
                    } else {
                        console.log(`对应的${ttfFileName}.ttf 文件  不存在`);
                    }
                }
            });
        } catch (error) {
            console.error(`读取 ${ttfDir} 目录时出错:`, error);
        }
    } else {
        console.warn(`目录 ${ttfDir} 不存在`);
    }
};

// 调用函数生成字体文件
generateTTFs(dir);

// 新函数，处理 .fnt 文件
function processFntFiles(outputFontRelativePath) {
    // 检查目录是否存在
    if (!fs.existsSync(outputFontRelativePath)) {
        console.warn(`目录 ${outputFontRelativePath} 不存在`);
        return;
    }

    // 读取目录下所有文件
    const files = fs.readdirSync(outputFontRelativePath);
    files.forEach(file => {
        if (file.endsWith('.fnt')) {
            const filePath = path.join(outputFontRelativePath, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const lines = fileContent.split('\n');

            const deletedLines = [];
            let charIdCount = 0;
            const newLines = [];

            // 第一遍遍历，删除 letter 长度大于 1 的行并统计 char id= 开头的行数
            lines.forEach(line => {
                if (line.startsWith('char id=')) {
                    const letterMatch = line.match(/letter="(.*?)"/);
                    if (letterMatch && letterMatch[1].length > 1 && letterMatch[1] !== 'space') {
                        deletedLines.push(line);
                    } else {
                        newLines.push(line);
                        charIdCount++;
                    }
                } else {
                    newLines.push(line);
                }
            });

            // 第二遍遍历，修改 chars count= 行
            const finalLines = newLines.map(line => {
                if (line.startsWith('chars count=')) {
                    return `chars count=${charIdCount}`;
                }
                return line;
            });

            // 打印删除的行
            if (deletedLines.length > 0) {
                console.log(`文件 ${file} 中删除的行：`);
                deletedLines.forEach(deletedLine => {
                    console.log(deletedLine);
                });
            }

            // 覆盖原文件
            const newFileContent = finalLines.join('\n');
            fs.writeFileSync(filePath, newFileContent, 'utf8');
        }
    });
}