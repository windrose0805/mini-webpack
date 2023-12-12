const webpack = require('./webpack')
const options = require('./webpack.config')
const compiler = webpack(options)
// 4. 执行Compiler对象的run方法，开始编译
compiler.run((err, states) => {


})
