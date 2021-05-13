const testPlugin = require('../../src/index.js');
const path = require('path');

module.exports = {
  entry: {
      app: path.join(__dirname, '../src/index.js')
  },
  output: {
      path: path.resolve(__dirname, '../dist')
  },
  plugins: [
    new testPlugin({
      template: '../public/index.html',
      alias: {
        '@image': 'http://www.baidu.com'
      }
    })
  ],
};
