var child_process = require("child_process")

String.prototype.format = function (args) {
    if (arguments.length > 0) {
        var result = this
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                var reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, args[key])
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] == undefined) {
                    return ""
                }
                else {
                    var reg = new RegExp("({[" + i + "]})", "g")
                    result = result.replace(reg, arguments[i])
                }
            }
        }
        return result
    }
    else {
        return this
    }
}

class tinypng {
    constructor(apiKey, logFunc) {
        this.m_apiKey = apiKey
        this.m_logFunc = logFunc || console.log
    }

    shrink(filePath, callBack) {
        this.m_logFunc("tinypng shrink file ", filePath)
        var curl = 'curl --user api:{0} --data-binary @{1} -H "Accept: application/json" \
        "https://api.tinify.com/shrink"'.format(this.m_apiKey, filePath)
        var child = child_process.exec(curl, (err, stdout, stderr) => {
            if (err) {
                this.m_logFunc("tinypng shrink err", stderr, filePath)
                callBack(false)
            }
            else {
                var shrinkInfo = JSON.parse(stdout)
                this.downloadFile(shrinkInfo.output.url, filePath, (success) => {
                    callBack(success, shrinkInfo)
                })
            }

            child.kill("SIGTERM")
        })
    }

    downloadFile(url, destFilePath, callBack) {
        var curl = 'curl {0} -s -o {1}'.format(url, destFilePath)
        var child = child_process.exec(curl, (err, stdout, stderr) => {
            if (err) {
                this.m_logFunc("tinypng downloadFile err", stderr, url, destFilePath)
                callBack(false)
            }
            else {
                callBack(true)
            }

            child.kill("SIGTERM")
        })
    }

    shrinkDir(dirName) {

    }
}

if (process.argv.length === 4 && process.argv[2] === '--dir') {
    var instance = new tinypng('your_tinypng_key')
    instance.shrinkDir(process.argv[3])
}

module.exports = tinypng