const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.cjs');
const createRoutes = require('./routes.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.use(createRoutes(db));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  const count = db.prepare('SELECT COUNT(*) as c FROM fornecedores').get();
  console.log(`[server] Database loaded with ${count.c} fornecedores`);

  app.listen(PORT, () => {
    console.log(`[server] Energia Certa running on http://localhost:${PORT}`);
  });
}

module.exports = app;
