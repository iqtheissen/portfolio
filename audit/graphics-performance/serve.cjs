const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const webpackModule = require('next/dist/compiled/webpack/webpack');
webpackModule.init();
const directory = __dirname;
webpackModule.webpack({
  mode: 'production', target: 'web', context: process.cwd(), entry: path.join(directory, 'benchmark.js'),
  module: { rules: [{ test: /benchmark\.js$/, type: 'javascript/esm' }] },
  output: { path: directory, filename: 'bundle.js' }, optimization: { minimize: false },
}, (error, stats) => {
  if (error || stats.hasErrors()) { process.stderr.write(String(error || stats.toString({ all: false, errors: true }))); process.exitCode = 1; return; }
  fs.writeFileSync(path.join(directory, 'results.ndjson'), '');
  for (const file of ['complete', 'error.txt']) if (fs.existsSync(path.join(directory, file))) fs.unlinkSync(path.join(directory, file));
  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
      let body = ''; for await (const part of req) body += part;
      if (req.url === '/result') { fs.appendFileSync(path.join(directory, 'results.ndjson'), body + '\n'); process.stdout.write(JSON.parse(body).name + '\n'); }
      if (req.url === '/visual') fs.writeFileSync(path.join(directory, 'fog-visual-verification.json'), body);
      if (req.url === '/complete') { fs.writeFileSync(path.join(directory, 'complete'), 'complete'); process.stdout.write('BENCHMARK COMPLETE\n'); }
      if (req.url === '/error') { fs.writeFileSync(path.join(directory, 'error.txt'), body); process.stdout.write('BENCHMARK ERROR ' + body + '\n'); }
      res.writeHead(200).end('ok'); return;
    }
    if (req.url === '/bundle.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); fs.createReadStream(path.join(directory, 'bundle.js')).pipe(res); return; }
    res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><html><head><title>Portfolio graphics performance audit</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#111;color:white;font:16px system-ui"><div id="stage" style="position:fixed;inset:0;pointer-events:none"></div><main style="position:fixed;z-index:2;top:16px;right:16px;padding:20px;max-width:650px;background:#111e"><h1>Portfolio graphics audit</h1><p>Before/after GPU measurements with unchanged bloom and framing. Includes a pixel check of the cropped fog.</p><button id="run" style="padding:12px 24px;font-size:18px">Run graphics comparison</button><pre id="output" style="white-space:pre-wrap;max-height:75vh;overflow:auto">Ready. 8 scenarios, two rounds; about one minute.</pre></main><script src="/bundle.js"></script></body></html>');
  });
  server.listen(3000, 'localhost', () => process.stdout.write('Audit ready at http://localhost:3000\n'));
});
