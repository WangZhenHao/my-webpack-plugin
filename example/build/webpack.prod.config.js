const testPlugin = require('../../src/index.js');
const path = require('path');
const webpackConfig = {
  mode: 'none',
  entry: {
      app: path.join(__dirname, '../src/main.js')
  },
  output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'main.js'
  },
  plugins: [
    new testPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      filename: 'index.html',
      alias: {
        '@image': 'http://www.baidu.com',
        '@layout': path.resolve(__dirname, '../public/layout')
      }
    })
  ],
};

module.exports = webpackConfig
