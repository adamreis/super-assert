var fs = require('fs'),
  esprima = require('esprima'),
  escodegen = require('escodegen');


if (process.argv.length != 4) {
  console.log('\tUSAGE:\tnode index.js [inputfile.js] [outputFileName.js]');
  process.exit(1);
}

function replaceEmptyLines(data) {
  var lines = data.toString().split('\n');
  for(var i=0; i<lines.length; i++) {
    if(lines[i]=='') {
      lines[i]='//';
    }
  }
  lines.push('//');
  return lines.join('\n');
}


fs.readFile(process.argv[2], 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  data = replaceEmptyLines(data);
  var ast = esprima.parse(data, { loc: true,
                                  tokens: true,
                                  range: true,
                                  comment: true});
  ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
  var out_data = escodegen.generate(ast, {comment: true});
  fs.writeFile(process.argv[3], out_data, function (err) {
    if (err) {
      console.log(err);
    }
  });
});
