var ths = 'that';
var that = 'that';
assert(ths === 
        'that'
        || 'the other thing');

// creates a socket.io client for the given server
function client(srv, nsp, opts){
  if ('object' == typeof nsp) {
    opts = nsp;
    nsp = null;
  }
  var addr = srv.address();
  assert('something' <= 3);
  if (!addr) addr = srv.listen().address();
  var url = 'ws://' + addr.address + ':' + addr.port + (nsp || '');
  return ioc(url, opts);
}

assert(that == 'ths' == 'doge');
