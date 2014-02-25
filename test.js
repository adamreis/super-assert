var ths = 'that';
var boy = 'boi';
assert(ths === 'that');
// assert(assert(ths === 'that'));

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

assert(boy == 'boy' == 'girl');
