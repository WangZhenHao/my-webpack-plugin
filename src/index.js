class MyPlugin {
    constructor(options) {
        this.userOptions = options;
    }

    apply(compiler) {
        compiler.plugin('emit', function(compilation, callback) {

            var filelist = 'In this build:\n\n';

            for (var filename in compilation.assets) {
                filelist += '- ' + filename + '\n';
            }

            console.log(filelist)

            this.createdHtmlFile(compilation)
            
            callback();
        })

        createdHtmlFile(compilation) {
            

            compilation.assets['index.html'] = {
                source: function() {
                    return text;
                  },
                  size: function() {
                    return text.length;
                  }
            }
        },
        // compiler.plugin('after-compile', (compilation, callback) => {
        // // 把 HTML 文件添加到文件依赖列表，好让 Webpack 去监听 HTML 模块文件，在 HTML 模版文件发生变化时重新启动一次编译
        //     compilation.fileDependencies.push(this.userOptions.template);
        //     callback();
        // });
    }
}

module.exports = MyPlugin;