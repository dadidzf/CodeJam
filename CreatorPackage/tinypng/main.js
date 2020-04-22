'use strict'

var path = require('path')
var fs = require('fs')
var tinypng = require('./tinypng')

module.exports = {
    readShrinkDir() {
        var fileArr = fs.readdirSync(this.m_shrinkDirName)
        this.m_shrinkDirfileSet = new Set(fileArr)
        Editor.log("readShrinkDir", this.m_shrinkDirfileSet)
    },

    readReplaceDir() {
        var fileArr = fs.readdirSync(this.m_replaceDirName)
        this.m_replaceDirfileSet = new Set(fileArr)
        Editor.log("readReplaceDir", this.m_replaceDirName)
    },

    replace(dir) {
        let fileArr = fs.readdirSync(dir)
        fileArr.forEach((element, index) => {
            let ele = element
            let fileOrDir = dir + '/' + ele
            let info = fs.statSync(fileOrDir)
            if (info.isDirectory()) {
                this.replace(fileOrDir)
            }
            else {
                let ext = path.extname(fileOrDir)
                if (ext === ".png" || ext === ".jpg" || ext === ".mp3") {
                    if (this.m_replaceDirfileSet.has(ele)) {
                        Editor.log("replace file - " + ele)
                        let readStream = fs.createReadStream(this.m_replaceDirName + ele)
                        let writeStream = fs.createWriteStream(fileOrDir)
                        readStream.pipe(writeStream)
                    }
                }
            }
        })
    },

    shrinkAll(dir, callback) {
        let fileArr = fs.readdirSync(dir)
        fileArr.forEach((element, index) => {
            let ele = element
            let fileOrDir = dir + '/' + ele
            let info = fs.statSync(fileOrDir)
            if (info.isDirectory()) {
                this.shrinkAll(fileOrDir, callback)
            }
            else {
                let ext = path.extname(fileOrDir)
                if (ext === ".png" || ext === ".jpg") {
                    if (!this.m_shrinkDirfileSet.has(ele)) {
                        this.m_shrinkCnt++
                        this.m_tinypng.shrink(fileOrDir, (success, shrinkInfo) => {
                            if (success) {
                                this.m_totalInputSize += shrinkInfo.input.size
                                this.m_totalOutputSize += shrinkInfo.output.size

                                let readStream = fs.createReadStream(fileOrDir)
                                let writeStream = fs.createWriteStream(this.m_shrinkDirName + ele)
                                readStream.pipe(writeStream)
                            }

                            this.m_shrinkCnt--
                            Editor.log("ShrinkAll file shrinkFinished - " + ele + " result - " + success + " shrink cnt left - " + this.m_shrinkCnt)
                            if (this.m_shrinkCnt <= 0) {
                                callback()
                            }
                        })
                    }
                    else {
                        Editor.log("ShrinkAll file already shrinked - " + ele)
                        let readStream = fs.createReadStream(this.m_shrinkDirName + ele)
                        let writeStream = fs.createWriteStream(fileOrDir)
                        readStream.pipe(writeStream)
                    }
                }
            }
        })
    },

    requireAld(options) {
        var gameJsPath = path.join(options.dest, 'game.js')
        var script = fs.readFileSync(gameJsPath, 'utf8')
        script = "require('utils/ald-game.js');" + '\n' + script
        fs.writeFileSync(gameJsPath, script)
    },

    replaceAppIdForTT(options) {
        var appId = "tt1ef2684f81d89072"
        var cfgPath = path.join(options.dest, "project.config.json")
        if (fs.existsSync(cfgPath)) {
            Editor.log('replaceAppIdForTT', appId)
            var PRJJson = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
            PRJJson.appid = appId

            var newJsonStr = JSON.stringify(PRJJson, undefined, 2)
            fs.writeFileSync(cfgPath, newJsonStr)
        }
    },

    onBuildStart(options, callback) {
        Editor.log('onBuildStart', options)
        callback()
    },

    onBuildFinish(options, callback) {
        Editor.log('Building ' + options.platform + ' to ' + options.dest)

        var destDir = options.dest + "/res"
        if (options.platform === 'wechatgame' && this.m_ttMode) {
            this.replaceAppIdForTT(options)
        }

        if (this.m_shrinkMode === "shrinkAll") {
            this.readShrinkDir()
            this.m_totalInputSize = 0
            this.m_totalOutputSize = 0
            this.m_shrinkCnt = 0
            this.shrinkAll(destDir, () => {
                Editor.log("Total input size " + this.m_totalInputSize + "total output size" + this.m_totalOutputSize)
                callback()
            })

            if (this.m_shrinkCnt <= 0) {
                callback()
            }
            else {
                Editor.log("Total Shrink png/jpg count", this.m_shrinkCnt)
            }
        }
        else {
            this.readReplaceDir()
            this.replace(destDir)
            callback()
        }
    },

    load() {
        // 当 package 被正确加载的时候执行
        this.m_buidFinishFunc = this.onBuildFinish.bind(this)
        this.m_buidStartFunc = this.onBuildStart.bind(this)
        Editor.Builder.on('build-finished', this.m_buidFinishFunc)
        Editor.Builder.on('build-start', this.m_buidStartFunc)

        this.m_shrinkDirName = __dirname + "/shrinkdir/"
        this.m_replaceDirName = __dirname + "/replacedir/"
        this.m_shrinkMode = "shrinkAll"
        this.m_ttMode = false
        Editor.log('hook-after-build load', "shrinkDir --- ", this.m_shrinkDirName)

        this.m_tinypng = new tinypng('your_tinypng_key', Editor.log)
    },

    unload() {
        // 当 package 被正确卸载的时候执行
        Editor.Builder.removeListener('build-finished', this.m_buidFinishFunc)
        Editor.log('hook-after-build unload')
    },

    messages: {
        'shrinkAllMode'() {
            Editor.log('Shrink Mode changed to shrinkAll')
            this.m_shrinkMode = "shrinkAll"
        },

        'replaceMode'() {
            Editor.log('Shrink Mode changed to replace')
            this.m_shrinkMode = "replace"
        },

        'ttMode'() {
            this.m_ttMode = !this.m_ttMode
            Editor.log('TTMode status - ', this.m_ttMode ? "active" : "inactive")
        }
    }
}