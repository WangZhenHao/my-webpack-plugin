const fs = require("fs")

const RE = /\<\%\s?.*?\%\>/g;
const includeRe = /(\<\%\s?)(include)\s(\@[^\/]+)(\S+)(\s?\%\>)/;
const imageRe = /(\<\%\s?)(\S+)(\s?\%\>)/;
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

            // console.log(filelist)
            
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
        const alias = this.userOptions.alias
        let text = fs.readFileSync(this.userOptions.template, 'utf8');

        text = this.comiplerHtml(text, alias)


        compilation.assets[this.userOptions.filename] = {
            source: function() {
                return text;
              },
              size: function() {
                return text.length;
              }
        }
    }

    comiplerHtml(str, alias) {
        var arr = str.match(RE) || []
        var syntax = []

        for(var i = 0; i < arr.length; i++) {
            var express = ''

            if(includeRe.test(arr[i])) {
                express = this.compiperInclude([RegExp.$3, RegExp.$4], arr[i], alias)
            } else if(imageRe.test(arr[i])) {
                express = this.compiperImage([RegExp.$2], arr[i], alias)
            }

            syntax.push({
                text: arr[i],
                express: express
            })
        }

        for(var i = 0; i < syntax.length; i++) {
            str = str.replace(syntax[i].text, syntax[i].express)
        }
        // console.log(str)
        return str;
    }

    compiperImage(matchArr, str, aliasMap) {
        let text = ''
        const alia = aliasMap[matchArr[0]]

        if(alia) {
            text = alia
        }

        return text
    }

    compiperInclude(matchArr, str, aliasMap) {
        let text = '';
        const alia = aliasMap[matchArr[0]]

        if(alia) {
            const filePath = alia + matchArr[1];
            text = fs.readFileSync(filePath, 'utf8');
        }
        
        text = this.comiplerHtml(text, aliasMap)

        return text;
    }
    // resolveIncludePath(text, aliasMap) {
    //     var re = /\<\%\s?.*?\%\>/g
    //     var expressRe = /\s?(include)\s?(\@[^\/]+)([^(\s?\%\>)]+)/
    //     var arr = text.match(re)
    //     var includeSynx = []

    //     for(var i = 0; i < arr.length; i++) {
    //         if(arr[i].indexOf('include') > -1) {
    //             includeSynx.push({
    //                 express: arr[i],
    //                 text: arr[i]
    //             })
    //         }
    //     }

    //     for(var i = 0; i < includeSynx.length; i++) {
    //         var express = includeSynx[i].express
    //         var keywordList = express.match(expressRe) || [];
    //         var alias = keywordList[2];


    //         if(alias && aliasMap[alias]) {
    //             const filePath = aliasMap[alias] + keywordList[3];
    //             const text = fs.readFileSync(filePath, 'utf8');
    //             includeSynx[i].express = text;
    //         }
            
    //     }

    //     return includeSynx;
    // }
}

module.exports = MyPlugin;