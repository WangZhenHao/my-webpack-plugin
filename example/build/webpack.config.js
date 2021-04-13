const testPlugin = require('../../build/plugin/test-plugin/index.js');
const path = require('path');

module.exports = {
  entry: {
      app: path.join(__dirname, '../src/index.js')
  },
  plugins: [new testPlugin()],
};
