const webpack = require('./webpack')
const fs = require('fs')
const options = require('./webpack.config')
const compiler = webpack(options)
// 4. 执行Compiler对象的run方法，开始编译
compiler.run((err, stats) => {
    console.log(stats.toJson())
})
