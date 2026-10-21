const http = require('http');
const legacyService = require('./legacy_order_service');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/health') {
    return res.end(JSON.stringify({ status: 'UP', legacy: true }));
  }

  if (req.method === 'GET' && req.url === '/inventory') {
    return res.end(JSON.stringify(legacyService.inventory));
  }

  if (req.method === 'POST' && req.url === '/orders') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = legacyService.process_order(payload);
        if (result.ok) {
          res.statusCode = 201;
          res.end(JSON.stringify(result));
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify(result));
        }
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: 'MALFORMED_JSON_OR_INTERNAL_CRASH' }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'ROUTE_NOT_FOUND' }));
});

server.listen(PORT, () => {
  console.log(`[LEGACY SERVICE RUNNING] http://localhost:${PORT}`);
  console.log(`- GET  /health`);
  console.log(`- GET  /inventory`);
  console.log(`- POST /orders`);
});
