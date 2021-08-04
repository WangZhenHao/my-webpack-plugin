const fs = require('fs');
const path = require('path')
const _ = require('lodash');
const RE = /\<\%\s?.*?\%\>/g;
const includeRe = /(\<\%\s?)(include)\s([^\/]+)(\S+)(\s?\%\>)/;
const imageRe = /(\<\%\s?)(\S+)(\s?\%\>)/;
class MyPlugin {
  constructor(options) {
    this.userOptions = options;
    this.childCompilationOutputName = options.filename
  }

  static tiwice = 1;
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      // var filelist = 'In this build:\n\n';

      // for (var filename in compilation.assets) {
      //     filelist += '- ' + filename + '\n';
      // }
      console.log(MyPlugin.tiwice++, '------------------------>');
      this.createdHtmlFile(compilation);

      callback();
    });

    compiler.plugin('after-compile', (compilation, callback) => {
      if (compilation.fileDependencies.add) {
        compilation.fileDependencies.add(this.userOptions.template);
      } else {
        compilation.fileDependencies.push(this.userOptions.template);
      }
      // 把 HTML 文件添加到文件依赖列表，好让 Webpack 去监听 HTML 模块文件，在 HTML 模版文件发生变化时重新启动一次编译

      callback();
    });
  }

  createdHtmlFile(compilation) {
    const alias = this.userOptions.alias;
    let text = fs.readFileSync(this.userOptions.template, 'utf8');
    if (this.conetext && this.conetext === text) {
      return;
    } else {
      const chunkOnlyConfig = {
        assets: false,
        cached: false,
        children: false,
        chunks: true,
        chunkModules: false,
        chunkOrigins: false,
        errorDetails: false,
        hash: false,
        modules: false,
        reasons: false,
        source: false,
        timings: false,
        version: false,
      };
      const allChunks = compilation.getStats().toJson(chunkOnlyConfig).chunks;
      let chunks = this.filterChunks(allChunks);
      const assets = this.htmlWebpackPluginAssets(compilation, chunks)

    this.conetext = text;
      text = this.comiplerHtml(text, alias);

      text = this.insertTag(text, assets);
      compilation.assets[this.userOptions.filename] = {
        source: function () {
          return text;
        },
        size: function () {
          return text.length;
        },
      };
    }
  }

  insertTag(text, assets) {
    const re = '</body>';
    const chunk = assets.chunks;
    const key = 'app'
    const script = `<script src="${chunk[key].entry}?hash=${chunk[key].hash}"></script>${re}`

    return text.replace(re, script)
  }

  comiplerHtml(str, alias) {
    var arr = str.match(RE) || [];
    var syntax = [];

    for (var i = 0; i < arr.length; i++) {
      var express = '';

      if (includeRe.test(arr[i])) {
        express = this.compiperInclude([RegExp.$3, RegExp.$4], arr[i], alias);
      } else if (imageRe.test(arr[i])) {
        express = this.compiperImage([RegExp.$2], arr[i], alias);
      }

      syntax.push({
        text: arr[i],
        express: express,
      });
    }

    for (var i = 0; i < syntax.length; i++) {
      str = str.replace(syntax[i].text, syntax[i].express);
    }
    // console.log(str)
    return str;
  }

  compiperImage(matchArr, str, aliasMap) {
    let text = '';
    const alia = aliasMap[matchArr[0]];

    if (alia) {
      text = alia;
    }

    return text;
  }

  compiperInclude(matchArr, str, aliasMap) {
    let text = '';
    const alia = aliasMap[matchArr[0]];

    if (alia) {
      const filePath = alia + matchArr[1];
      text = fs.readFileSync(filePath, 'utf8');
    }

    text = this.comiplerHtml(text, aliasMap);

    return text;
  }

  /**
   * Return all chunks from the compilation result which match the exclude and include filters
   */
  filterChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter((chunk) => {
      const chunkName = chunk.names[0];
      // This chunk doesn't have a name. This script can't handled it.
      if (chunkName === undefined) {
        return false;
      }
      // Skip if the chunk should be lazy loaded
      if (typeof chunk.isInitial === 'function') {
        if (!chunk.isInitial()) {
          return false;
        }
      } else if (!chunk.initial) {
        return false;
      }
      // Skip if the chunks should be filtered and the given chunk was not added explicity
      if (
        Array.isArray(includedChunks) &&
        includedChunks.indexOf(chunkName) === -1
      ) {
        return false;
      }
      // Skip if the chunks should be filtered and the given chunk was excluded explicity
      if (
        Array.isArray(excludedChunks) &&
        excludedChunks.indexOf(chunkName) !== -1
      ) {
        return false;
      }
      // Add otherwise
      return true;
    });
  }

  htmlWebpackPluginAssets(compilation, chunks) {
    const self = this;
    const compilationHash = compilation.hash;

    // Use the configured public path or build a relative path
    let publicPath =
      typeof compilation.options.output.publicPath !== 'undefined'
        ? // If a hard coded public path exists use it
          compilation.mainTemplate.getPublicPath({ hash: compilationHash })
        : // If no public path was set get a relative url path
          path
            .relative(
              path.resolve(
                compilation.options.output.path,
                path.dirname(self.childCompilationOutputName)
              ),
              compilation.options.output.path
            )
            .split(path.sep)
            .join('/');

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }

    const assets = {
      // The public path
      publicPath: publicPath,
      // Will contain all js & css files by chunk
      chunks: {},
      // Will contain all js files
      js: [],
      // Will contain all css files
      css: [],
      // Will contain the html5 appcache manifest files if it exists
      manifest: Object.keys(compilation.assets).filter(
        (assetFile) => path.extname(assetFile) === '.appcache'
      )[0],
    };

    // Append a hash for cache busting
    if (this.userOptions.hash) {
      assets.manifest = self.appendHash(assets.manifest, compilationHash);
      assets.favicon = self.appendHash(assets.favicon, compilationHash);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkName = chunk.names[0];

      assets.chunks[chunkName] = {};

      // Prepend the public path to all chunk files
      let chunkFiles = []
        .concat(chunk.files)
        .map((chunkFile) => publicPath + chunkFile);

      // Append a hash for cache busting
      if (this.userOptions.hash) {
        chunkFiles = chunkFiles.map((chunkFile) =>
          self.appendHash(chunkFile, compilationHash)
        );
      }

      // Webpack outputs an array for each chunk when using sourcemaps
      // or when one chunk hosts js and css simultaneously
      const js = chunkFiles.find((chunkFile) => /.js($|\?)/.test(chunkFile));
      if (js) {
        assets.chunks[chunkName].size = chunk.size;
        assets.chunks[chunkName].entry = js;
        assets.chunks[chunkName].hash = chunk.hash;
        assets.js.push(js);
      }

      // Gather all css files
      const css = chunkFiles.filter((chunkFile) =>
        /.css($|\?)/.test(chunkFile)
      );
      assets.chunks[chunkName].css = css;
      assets.css = assets.css.concat(css);
    }

    // Duplicate css assets can occur on occasion if more than one chunk
    // requires the same css.
    assets.css = _.uniq(assets.css);

    return assets;
  }
}

module.exports = MyPlugin;
