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
    ltype = node.expression.arguments[0].left.type;
    lname = node.expression.arguments[0].left.name || node.expression.arguments[0].left.value;
    rtype = node.expression.arguments[0].right.type;
    rname = node.expression.arguments[0].right.name || node.expression.arguments[0].right.value;
    op = node.expression.arguments[0].operator;
    line = node.expression.callee.loc.start.line;

    assertionText = 'line ' + line + ': assert(<' + ltype + '> ' + lname + ' ' + op + ' <' + rtype + '> ' + rname + ')';
    // console.log(JSON.stringify(node, null, 2) + '\n\n----------\n');

    node.expression.callee.name = 'assertion';
    node.expression.arguments[1] = {"type":"Literal", "value":assertionText};
  }
  });

  // console.log(JSON.stringify(j, null, 2));

  console.log('\n-------- original -------\n\n' + data);
  console.log('\n-------- new -------\n\n' + escodegen.generate(j));

});