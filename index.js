//TODO: figure out exactly how escodegen deals with newlines, because it definitely separates one line if statements)
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

function addSecondAssertArgument (ast) {
  traverse(ast, function(node) {
    if (node.type == 'ExpressionStatement' &&
        node.expression.callee &&
        node.expression.callee.name == 'assert'){
      line = node.expression.callee.loc.start.line;
      assertionText = 'line ' + line + ': ' + escodegen.generate(node);
      node.expression.arguments[1] = {"type":"Literal", "value":assertionText};
    }
  });
}

function fixMultiLineStatements (ast, data) {
  var missedLines = [];
  traverse(ast, function(node) {
    if (node.type == 'ExpressionStatement' ) {
      var start = node.loc.start.line;
      var end = node.loc.end.line;
      if (start != end) {
        // console.log('---------NODE-------\n'+JSON.stringify(node, null, 2));
        for (var i = start + 1; i <= end; i++) {
          missedLines.push(i);
        }
      }
    }
  });

  console.log('=======missed lines==========\n'+missedLines);
  var lines = data.toString().split('\n');
  for (var i = 0 ; i < missedLines.length; i++) {
    lines.splice(missedLines[i] + i - 1, 0, "//");
  }
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
  addSecondAssertArgument(ast);
  var regeneratedCode = escodegen.generate(ast, {comment: true});
  var out_data = fixMultiLineStatements(ast, regeneratedCode);
  fs.writeFile(process.argv[3], out_data, function (err) {
    if (err) {
      console.log(err);
    }
  });
});
