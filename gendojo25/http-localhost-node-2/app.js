const http = require('node:http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, World!\n' + new Date().toLocaleString());
});
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});