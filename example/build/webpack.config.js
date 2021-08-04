const testPlugin = require('../../src/index.js');
const path = require('path');
const portfinder = require('portfinder');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const devWebpackConfig = {
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
  devServer: {
    // contentBase: path.resolve(__dirname, '../dist'),
    hot: true,
		quiet: true,
    host: '0.0.0.0',
    port: 3334
  }
};

module.exports = new Promise((reslove, reject) => {
	// portfinder.basePort = config.dev.port;
	portfinder.getPort((err, port) => {
		if(err) {

		} else {
			devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
		        compilationSuccessInfo: {
		          messages: [`您的应用运行成功`],
		        }
		    }))
		}


		reslove(devWebpackConfig);
	})
})
