const http = require('http');
const assert = require('assert');

const BASE = 'http://127.0.0.1:3000';

function fetch(path, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      hostname: '127.0.0.1',
      port: 3000,
      path,
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { data = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`\x1b[32mPASS\x1b[0m ${name}`);
    passed++;
  } catch (e) {
    console.log(`\x1b[31mFAIL\x1b[0m ${name}: ${e.message}`);
    failed++;
  }
}

(async () => {
  console.log('\n--- ESG API Tests ---\n');

  await test('Health endpoint returns ok', async () => {
    const { status, body } = await fetch('/api/health');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.status, 'ok');
  });

  await test('List fornecedores returns array', async () => {
    const { status, body } = await fetch('/api/fornecedores');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body), 'fornecedores should be an array');
    assert.ok(body.length >= 1, 'should have at least 1 fornecedor');
  });

  await test('Create fornecedor', async () => {
    const { status, body } = await fetch('/api/fornecedores', {
      method: 'POST',
      body: { razaoSocial: 'Teste Corp', cnpj: '00.000.000/0001-00', segmento: 'energia', porte: 'me', email: 'teste@corp.com', telefone: '(11) 90000-0000' }
    });
    assert.strictEqual(status, 201);
    assert.ok(body.id, 'should return an id');
  });

  await test('List metricas', async () => {
    const { status, body } = await fetch('/api/metricas');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
  });

  await test('List alertas', async () => {
    const { status, body } = await fetch('/api/alertas');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
  });

  await test('List auditorias', async () => {
    const { status, body } = await fetch('/api/auditorias');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length >= 1, 'should have at least 1 auditoria');
  });

  await test('List treinamentos', async () => {
    const { status, body } = await fetch('/api/treinamentos');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length >= 1, 'should have at least 1 treinamento');
  });

  await test('Dashboard returns stats', async () => {
    const { status, body } = await fetch('/api/dashboard');
    assert.strictEqual(status, 200);
    assert.ok(body.fornecedores !== undefined);
    assert.ok(body.alertasAbertos !== undefined);
  });

  await test('Delete non-existent returns 404', async () => {
    const { status } = await fetch('/api/fornecedores/99999', { method: 'DELETE' });
    assert.strictEqual(status, 404);
  });

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
