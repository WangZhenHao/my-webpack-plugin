const fs = require("fs")
class MyPlugin {
    constructor(options) {
        this.userOptions = options;
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {

            var filelist = 'In this build:\n\n';

            for (var filename in compilation.assets) {
                filelist += '- ' + filename + '\n';
            }

            console.log(filelist)

            this.createdHtmlFile(compilation)
            
            callback();
        })
        // compiler.plugin('after-compile', (compilation, callback) => {
        // // 把 HTML 文件添加到文件依赖列表，好让 Webpack 去监听 HTML 模块文件，在 HTML 模版文件发生变化时重新启动一次编译
        //     compilation.fileDependencies.push(this.userOptions.template);
        //     callback();
        // });
    }

    createdHtmlFile(compilation) {
        let text = fs.readFileSync(this.userOptions.template, 'utf8');

        text = text.replace(/\{\{\s?(\S+)\s?\}\}/g, (str, key) => {
            // for(let i in this.userOptions.alias) {
            //     if(i === key) {
                    return this.userOptions.alias[key];
            //     }
            // }
        })

        compilation.assets[this.userOptions.filename] = {
            source: function() {
                return text;
              },
              size: function() {
                return text.length;
              }
        }
    }

    resolveIncludePath() {

    }
}

module.exports = MyPlugin;