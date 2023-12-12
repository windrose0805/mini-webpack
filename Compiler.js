const { SyncHook } = require('tapable')
const Compilation = require('./Complation')
const fs = require('fs')

// 代表整个编译对象，负责整个编译过程，保存所有编译信息
// Compiler类的实例全局唯一
class Compiler {
    constructor(options) {
        this.options = options
        // 存的是当前的Compiler上面的所有的钩子
        this.hooks = {
            run: new SyncHook(), // 开始编译的时候触发
            done: new SyncHook() // 编译结束的时候触发
        }
    }
    run(callback) {
        const _this = this
        function onCompiled(err, states, fileDependencies) {
            fileDependencies.forEach(fileDependency => {
                fs.watch(fileDependency, () => _this.compile(onCompiled))
            })
            console.log('onCompiled')
        }
        this.hooks.run.call()

        this.compile(onCompiled)
        this.hooks.done.call()
    }
    compile(onCompiled) {
        let compilation = new Compilation(this.options)
        compilation.build(onCompiled)
    }
}


module.exports = Compiler