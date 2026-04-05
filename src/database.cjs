const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'esg.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Disable strict FK to allow cascade deletes for the demo
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

function initDatabase() {
  db.exec(`
    DROP TABLE IF EXISTS audit_log;
    DROP TABLE IF EXISTS fornecedores;
    DROP TABLE IF EXISTS metricas_energia;
    DROP TABLE IF EXISTS alertas_consumo;
    DROP TABLE IF EXISTS auditorias_conformidade;
    DROP TABLE IF EXISTS treinamentos_esg;

    CREATE TABLE fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razao_social TEXT NOT NULL,
      nome_fantasia TEXT,
      cnpj TEXT NOT NULL UNIQUE,
      inscricao_estadual TEXT,
      segmento TEXT NOT NULL,
      porte TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT NOT NULL,
      cep TEXT,
      cidade TEXT,
      estado TEXT,
      certificacoes TEXT,
      politica_ambiental TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE metricas_energia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id INTEGER,
      mes_ano TEXT NOT NULL,
      consumo_kwh REAL NOT NULL,
      custo_total REAL,
      fonte_energia TEXT,
      reducao_percentual REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE alertas_consumo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metrica_id INTEGER,
      tipo_alerta TEXT NOT NULL,
      descricao TEXT,
      severidade TEXT DEFAULT 'media',
      resolvido BOOLEAN DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE auditorias_conformidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id INTEGER,
      tipo_auditoria TEXT NOT NULL,
      resultado TEXT NOT NULL,
      observacoes TEXT,
      data_auditoria TEXT NOT NULL,
      proxima_auditoria TEXT,
      auditor_responsavel TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE treinamentos_esg (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id INTEGER,
      titulo TEXT NOT NULL,
      descricao TEXT,
      carga_horaria INTEGER,
      data_conclusao TEXT,
      status TEXT DEFAULT 'pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER fornecedor_update AFTER UPDATE ON fornecedores
    BEGIN
      UPDATE fornecedores SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
}

initDatabase();

// Seed data if tables are empty
function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as count FROM fornecedores').get();
  if (count.count === 0) {
    const seed = require('./seed.cjs');
    seed(db);
  }
}

seedIfEmpty();

module.exports = db;
