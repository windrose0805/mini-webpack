const { SyncHook } = require('tapable')
const Compilation = require('./Complation')
const fs = require('fs')
const path = require('path')

// 代表整个编译对象，负责整个编译过程，保存所有编译信息
// Compiler类的实例全局唯一
class Compiler {
    constructor(options) {
        this.options = options
        // 存的是当前的Compiler上面的所有的钩子
        this.hooks = {
            run: new SyncHook(), // 开始编译的时候触发
            done: new SyncHook(), // 编译结束的时候触发
            compilation: new SyncHook(['chunk', 'filename'])
        }
    }
    run(callback) {
        this.hooks.run.call()

        const _this = this

        function onCompiled(err, stats, fileDependencies) {
            // 10.在确定好输出内容后，根据配置确定输出的路径和文件名，把文件写入到文件系统
            for (const filename in stats.assets) {
                const filePath = path.join(_this.options.output.path, filename);
                fs.writeFileSync(filePath, stats.assets[filename], 'utf8');
            }
            fileDependencies.forEach(fileDependency => {
                fs.watch(fileDependency, () => _this.compile(onCompiled))
            })

            callback(null, {
                toJson: () => stats
            })
        }

        this.compile(onCompiled)
        this.hooks.done.call()
    }
    compile(onCompiled) {
        const compilation = new Compilation(this.options)
        compilation.build(onCompiled)
    }
}


module.exports = Compiler