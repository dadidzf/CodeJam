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

// 调用函数读取翻译数据
const translations = readTranslations(path.join(dir, 'configs/jsons'));
console.log('不同语言的翻译数据:', translations);

let generateBmfonts = function (dir) {
    const ttfDir = path.join(dir, 'configs/bmfont');
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
                            let textContent = '';
                            keysArray.forEach(key => {
                                Object.values(translations).forEach(langData => {
                                    if (langData[key]) {
                                        textContent += langData[key];
                                    }
                                });
                            });

                            // 创建临时文件
                            const tempDir = path.join(dir, 'temp');
                            if (!fs.existsSync(tempDir)) {
                                fs.mkdirSync(tempDir);
                            }
                            const tempFilePath = path.join(tempDir, `${projectFileName.replace('.GlyphProject', '')}_temp.txt`);
                            fs.writeFileSync(tempFilePath, textContent, 'utf8');
                            const tempFileRelativePath = path.relative(dir, tempFilePath);

                            // 执行 Glyph Designer 命令，使用 -inf 参数
                            const command = `"${path.join('/Applications/Glyph Designer.app/Contents/MacOS/Glyph Designer')}" \
"${projectFileName}" \
"${outputFontRelativePath}" \
-inf "${tempFileRelativePath}"`;
                            const options = {
                                cwd: dir
                            };

                            console.log(`开始执行Glyph Designer命令：${command}`);
                            execSync(command, options);
                            console.log(`成功为 ${projectFileName} 生成字体文件`);

                            // 删除临时文件
                            fs.unlinkSync(tempFilePath);
                        } catch (error) {
                            console.error(`处理 ${projectFileName} 时出错:`, error);
                        }
                    } else {
                        console.log(`${projectFileName}对应的 .GlyphProject 文件  不存在`);
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
generateBmfonts(dir);

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

                            // 使用 Fontmin 生成字体文件
                            const fontmin = new Fontmin()
                                .src(ttfFilePath)
                                .use(Fontmin.glyph({ text: textContent }))
                                .dest(outputDir);

                            fontmin.run(function (err, files) {
                                if (err) {
                                    console.error(`处理 ${ttfFileName} 时出错:`, err);
                                } else {
                                    console.log(`成功为 ${ttfFileName} 生成字体文件`);
                                }
                            });
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