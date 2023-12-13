const Compiler = require('./Compiler')

function webpack(options) {
    // 1. 初始化参数：从配置文件和Shell语句中读取合并参数，得出最终的配置对象
    // console.log(process.argv)
    // PS E:\work\coding\mini-webpack> node debugger.js --mode=development
    // [
    //     'C:\\Program Files\\nodejs\\node.exe',        
    //     'E:\\work\\coding\\mini-webpack\\debugger.js',
    //     '--mode=development'
    //   ]
    const argv = process.argv.slice(2)

    const shellOptions = argv.reduce((shellOptions, option) => {
        const [key, value] = option.split('=')
        shellOptions[key.slice(2)] = value
        return shellOptions
    }, {})

    const finalOptions = { ...options, ...shellOptions }

    // 2. 用上一步得到的参数初始化compiler对象

    const compiler = new Compiler(finalOptions)

    // 3. 加载所有配置的插件

    finalOptions.plugins.forEach(plugin => plugin.apply(compiler))
    
    
    return compiler


}


module.exports = webpack