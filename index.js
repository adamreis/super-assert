var esprima = require('esprima'),
    fs = require('fs'),
    escodegen = require('escodegen');

var j;

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



fs.readFile('./test.js', 'utf8', function (err, data) {
  if (err) {
  return console.log(err);
  }
  
  j = esprima.parse(data, {loc : true});
  traverse(j, function(node){
  if (node.type == 'ExpressionStatement' && node.expression.callee && node.expression.callee.name == 'assert'){
    line = node.expression.callee.loc.start.line;
    assertionText = 'line ' + line + ': ' + escodegen.generate(node);
    // node.expression.callee.name = 'assertion';
    node.expression.arguments[1] = {"type":"Literal", "value":assertionText};
  }
  });

  // console.log('\n-------- original -------\n\n' + data);
  // console.log('\n-------- new -------\n\n' + escodegen.generate(j));

  fs.writeFile('./test-mod.js', escodegen.generate(j), function(err){
    if(err) {
      console.log(err);
    } else {
      console.log('Done!');
    }
  });

});