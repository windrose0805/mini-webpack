const path = require('path').posix
const fs = require('fs')
// 转换/
const baseDir = toUnixPath(process.cwd())
function toUnixPath(filepath) {
    return filepath.replace(/\\/g, '/')
}
class Compilation {
    constructor(options) {
        this.options = options
        this.fileDependencies = []
    }
    build(onCompiled) {
        // 5. 根据配置中的 entry 找到所有入口文件
        let entry = {}
        if (typeof this.options.entry === 'string') {
            entry.main = this.options.entry
        }
        else {
            entry = this.options.entry
        }

        for (const pathName in entry) {
            // 取到了所有入口的绝对路径
            const entryPath = path.join(baseDir, entry[pathName])
            this.fileDependencies.push(entryPath)

            // 6.从入口文件触发，调用所有配置的Loader对模块进行编译
            const entryModule = this.buildMoudle(pathName, entryPath)

        }


        onCompiled(null, {}, this.fileDependencies)
    }
    buildMoudle(name, modulePath) {
        // 读取源文件
        const rawSourceCode = fs.readFileSync(modulePath, 'utf8')
        const rules = this.options.module.rules

        // 拿到所有可以解析该文件的loader
        const loaders = []
        rules.forEach(rule => {
            if (modulePath.match(rule.test)) {
                loaders.push(...rule.use)
            }
        })

        const sourceCode = loaders.reduceRight((rawSourceCode, loader) => {
            return require(loader)(rawSourceCode)
        }, rawSourceCode)

        console.log(sourceCode)
    }
}

module.exports = Compilation