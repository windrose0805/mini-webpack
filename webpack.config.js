const path = require('path')
const RunPlugin = require('./plugins/run-plugin')
const DonePlugin = require('./plugins/done-plugin')
module.exports = {
    mode: 'development',
    devtool: false,
    entry: {
        entry1: './src/entry1.js',
        entry2: './src/entry2.js',
    },
    plugins: [
        new RunPlugin(),
        new DonePlugin()
    ]
}