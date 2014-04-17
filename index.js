//TODO: make this importable and usable (rather than just command line)
var fs = require('fs'),
  esprima = require('esprima'),
  escodegen = require('escodegen');

if (process.argv.length != 4) {
  console.log('\tUSAGE:\tnode index.js [inputfile.js] [outputFileName.js]');
  process.exit(1);
}

String.prototype.splice = function(index, to_remove, s) {
  return (this.slice(0,index) + s + this.slice(index + Math.abs(to_remove)));
}

String.prototype.addSlashes = function() 
{ 
   return this.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
} 

fs.readFile(process.argv[2], 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var lines = data.toString().split('\n');
  var i = 0;
  while (i < lines.length) {
    var assertIndex = lines[i].indexOf('assert');
    if (assertIndex != -1) {
      var startLine = i+1;
      assertText = lines[i].trim();
      var stack = new Array();
      stack.push('(')
      var j = assertIndex + lines[i].slice(assertIndex).indexOf('(')+1;
        debugger;
      while (stack.length > 0) {
        if (j >= lines[i].length) {
          i++;
          j = 0;
          try {
            assertText += lines[i].trim(); 
          } catch (err) {
            debugger;
          }
        }
        if (lines[i][j] == '(') {
          stack.push('(');
        }else if (lines[i][j] == ')') {
          stack.pop();
        }
        j++;
      }
      debugger;
      lines[i] = lines[i].splice(j-1, 0, ', \'Line ' + startLine + ': ' + assertText.addSlashes() + '\'');
    }
    i++;
  }

  fs.writeFile(process.argv[3], lines.join('\n'), function (err) {
    if (err) {
      return console.log(err);
    }
  });
});
