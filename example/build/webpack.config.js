const testPlugin = require('../../src/index.js');
const path = require('path');

module.exports = {
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
      template: path.resolve('../public/index.html'),
      alias: {
        '@image': 'http://www.baidu.com'
      }
    })
  ],
};
