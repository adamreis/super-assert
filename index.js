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


function traverse(node, func) {
  func(node)
  for (var key in node) {
    if (node.hasOwnProperty(key)) {
      var child = node[key];
      if (typeof child === 'object' && child !== null) {

        if (Array.isArray(child)) {
          child.forEach(function(node) {
            traverse(node, func);
          });
        } else {
          traverse(child, func);
        }
      }
    }
  }
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
  traverse(ast, function(node){
    if (node.type == 'ExpressionStatement' &&
        node.expression.callee &&
        node.expression.callee.name == 'assert'){
      line = node.expression.callee.loc.start.line;
      assertionText = 'line ' + line + ': ' + escodegen.generate(node);
      node.expression.arguments[1] = {"type":"Literal", "value":assertionText};
    }
  });
  var out_data = escodegen.generate(ast, {comment: true});
  fs.writeFile(process.argv[3], out_data, function (err) {
    if (err) {
      console.log(err);
    }
  });
});
