const path = require('path').posix
const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const types = require('@babel/types')
const { dirname } = require('path')
// 转换/
const baseDir = toUnixPath(process.cwd())
function toUnixPath(filepath) {
    return filepath.replace(/\\/g, '/')
}
class Compilation {
    constructor(options) {
        this.options = options
        this.fileDependencies = []
        this.modules = []
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
        const _this = this
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

        // 7. 再找出该模块之间的依赖关系，再递归本步骤直到所有入口以来的文件都经过了本步骤的处理

        const moduleId = './' + (path.relative(baseDir, modulePath))

        const module = { id: moduleId, dependencies: [], names: [name] }

        const ast = parser.parse(sourceCode, { sourceType: 'module' })

        traverse(ast, {
            CallExpression: ({ node }) => {
                if (node.callee.name === 'require') {
                    const depModuleName = node.arguments[0].value
                    const dirname = path.dirname(modulePath)
                    let depModulePath = path.join(dirname, depModuleName)
                    const extensions = _this.options.resolve.extensions
                    // 找到依赖模块的绝对路径
                    depModulePath = tryExtensions(depModulePath, extensions)
                    // 添加进数组，前面监听了，所以能够执行
                    this.fileDependencies.push(depModulePath)
                    const depModuleId = './' + path.relative(baseDir, depModulePath)
                    node.arguments = [types.stringLiteral(depModuleId)]

                    module.dependencies.push({ depModuleId, depModulePath })

                }
            }
        })

        let { code } = generator(ast)
        module._source = code
        module.dependencies.forEach(({ depModuleId, depModulePath }) => {
            const buildModule = this.modules.find(module => module.id === depModuleId)
            if (buildModule) {
                buildModule.names.push(name)
            }
            else {
                const depModule = this.buildMoudle(name, depModulePath)
                this.modules.push(depModule)
            }
        })
        return module
    }
}

function tryExtensions(path, extensions) {
    for (const extension of extensions) {
        const wholePath = path + extension
        if (fs.existsSync(path + extension)) {
            return wholePath
        }
    }
    throw new Error(`找不到`)
}

module.exports = Compilation