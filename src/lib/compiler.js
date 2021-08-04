function comiplerHtml(str, alias) {
  var arr = str.match(RE) || [];
  var syntax = [];

  for (var i = 0; i < arr.length; i++) {
    var express = '';

    if (includeRe.test(arr[i])) {
      express = compiperInclude([RegExp.$3, RegExp.$4], arr[i], alias);
    } else if (imageRe.test(arr[i])) {
      express = compiperImage([RegExp.$2], arr[i], alias);
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

function compiperImage(matchArr, str, aliasMap) {
  let text = '';
  const alia = aliasMap[matchArr[0]];

  if (alia) {
    text = alia;
  }

  return text;
}

function compiperInclude(matchArr, str, aliasMap) {
  let text = '';
  const alia = aliasMap[matchArr[0]];

  if (alia) {
    const filePath = alia + matchArr[1];
    text = fs.readFileSync(filePath, 'utf8');
  }

  text = comiplerHtml(text, aliasMap);

  return text;
}
