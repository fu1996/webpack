const webpack = require('../../lib')
const config = require('./webpack.config')

console.log('webpack.version', webpack.version)

webpack.webpack(config, (err) => {
	console.log('webpack callback')
})
