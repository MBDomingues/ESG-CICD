const express = require('express');
const router = express.Router();

function createRoutes(db) {
  // ===== FORNECEDORES =====
  router.get('/api/fornecedores', (req, res) => {
    const fornecedores = db.prepare('SELECT * FROM fornecedores ORDER BY created_at DESC').all();
    res.json(fornecedores);
  });

  router.get('/api/fornecedores/:id', (req, res) => {
    const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor nao encontrado' });
    res.json(fornecedor);
  });

  router.post('/api/fornecedores', (req, res) => {
    const { razaoSocial, nomeFantasia, cnpj, inscricaoEstadual, segmento, porte, email, telefone, cep, cidade, estado, certificacoes, politicaAmbiental } = req.body;
    if (!razaoSocial || !cnpj || !segmento || !porte || !email || !telefone) {
      return res.status(400).json({ error: 'Campos obrigatorios: razaoSocial, cnpj, segmento, porte, email, telefone' });
    }
    const result = db.prepare(`
      INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, inscricao_estadual, segmento, porte, email, telefone, cep, cidade, estado, certificacoes, politica_ambiental)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(razaoSocial, nomeFantasia || null, cnpj, inscricaoEstadual || null, segmento, porte, email, telefone, cep || null, cidade || null, estado || null, JSON.stringify(certificacoes || []), politicaAmbiental || null);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Fornecedor criado com sucesso' });
  });

  router.put('/api/fornecedores/:id', (req, res) => {
    const { razaoSocial, nomeFantasia, cnpj, segmento, porte, email, telefone } = req.body;
    const result = db.prepare(`
      UPDATE fornecedores SET razao_social = ?, nome_fantasia = ?, cnpj = ?, segmento = ?, porte = ?, email = ?, telefone = ?
      WHERE id = ?
    `).run(razaoSocial, nomeFantasia, cnpj, segmento, porte, email, telefone, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Fornecedor nao encontrado' });
    res.json({ message: 'Fornecedor atualizado com sucesso' });
  });

  router.delete('/api/fornecedores/:id', (req, res) => {
    const result = db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Fornecedor nao encontrado' });
    res.json({ message: 'Fornecedor removido com sucesso' });
  });

  // ===== METRICAS ENERGIA =====
  router.get('/api/metricas', (req, res) => {
    const metricas = db.prepare('SELECT m.*, f.razao_social FROM metricas_energia m LEFT JOIN fornecedores f ON m.fornecedor_id = f.id ORDER BY m.mes_ano DESC').all();
    res.json(metricas);
  });

  router.get('/api/metricas/:id', (req, res) => {
    const metrica = db.prepare('SELECT * FROM metricas_energia WHERE id = ?').get(req.params.id);
    if (!metrica) return res.status(404).json({ error: 'Metrica nao encontrada' });
    res.json(metrica);
  });

  router.post('/api/metricas', (req, res) => {
    const { fornecedor_id, mes_ano, consumo_kwh, custo_total, fonte_energia, reducao_percentual } = req.body;
    if (!fornecedor_id || !mes_ano || consumo_kwh == null) {
      return res.status(400).json({ error: 'Campos obrigatorios: fornecedor_id, mes_ano, consumo_kwh' });
    }
    const result = db.prepare(`
      INSERT INTO metricas_energia (fornecedor_id, mes_ano, consumo_kwh, custo_total, fonte_energia, reducao_percentual)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(fornecedor_id, mes_ano, consumo_kwh, custo_total || null, fonte_energia || null, reducao_percentual || 0);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Metrica criada com sucesso' });
  });

  router.put('/api/metricas/:id', (req, res) => {
    const { consumo_kwh, custo_total, fonte_energia } = req.body;
    const result = db.prepare('UPDATE metricas_energia SET consumo_kwh = ?, custo_total = ?, fonte_energia = ? WHERE id = ?').run(consumo_kwh, custo_total, fonte_energia, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Metrica nao encontrada' });
    res.json({ message: 'Metrica atualizada com sucesso' });
  });

  router.delete('/api/metricas/:id', (req, res) => {
    const result = db.prepare('DELETE FROM metricas_energia WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Metrica nao encontrada' });
    res.json({ message: 'Metrica removida com sucesso' });
  });

  // ===== ALERTAS CONSUMO =====
  router.get('/api/alertas', (req, res) => {
    const alertas = db.prepare('SELECT a.*, m.mes_ano, m.consumo_kwh FROM alertas_consumo a LEFT JOIN metricas_energia m ON a.metrica_id = m.id ORDER BY a.criado_em DESC').all();
    res.json(alertas);
  });

  router.post('/api/alertas', (req, res) => {
    const { metrica_id, tipo_alerta, descricao, severidade, resolvido } = req.body;
    if (!metrica_id || !tipo_alerta) {
      return res.status(400).json({ error: 'Campos obrigatorios: metrica_id, tipo_alerta' });
    }
    const result = db.prepare(`
      INSERT INTO alertas_consumo (metrica_id, tipo_alerta, descricao, severidade, resolvido)
      VALUES (?, ?, ?, ?, ?)
    `).run(metrica_id, tipo_alerta, descricao || null, severidade || 'media', resolvido || 0);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Alerta criado com sucesso' });
  });

  router.put('/api/alertas/:id', (req, res) => {
    const { resolvido, severidade } = req.body;
    const result = db.prepare('UPDATE alertas_consumo SET resolvido = ?, severidade = ? WHERE id = ?').run(resolvido ? 1 : 0, severidade, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Alerta nao encontrado' });
    res.json({ message: 'Alerta atualizado com sucesso' });
  });

  router.delete('/api/alertas/:id', (req, res) => {
    const result = db.prepare('DELETE FROM alertas_consumo WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Alerta nao encontrado' });
    res.json({ message: 'Alerta removido com sucesso' });
  });

  // ===== AUDITORIAS =====
  router.get('/api/auditorias', (req, res) => {
    const auditorias = db.prepare('SELECT a.*, f.razao_social FROM auditorias_conformidade a LEFT JOIN fornecedores f ON a.fornecedor_id = f.id ORDER BY a.data_auditoria DESC').all();
    res.json(auditorias);
  });

  router.post('/api/auditorias', (req, res) => {
    const { fornecedor_id, tipo_auditoria, resultado, observacoes, data_auditoria, proxima_auditoria, auditor_responsavel } = req.body;
    if (!fornecedor_id || !tipo_auditoria || !resultado || !data_auditoria) {
      return res.status(400).json({ error: 'Campos obrigatorios: fornecedor_id, tipo_auditoria, resultado, data_auditoria' });
    }
    const result = db.prepare(`
      INSERT INTO auditorias_conformidade (fornecedor_id, tipo_auditoria, resultado, observacoes, data_auditoria, proxima_auditoria, auditor_responsavel)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(fornecedor_id, tipo_auditoria, resultado, observacoes || null, data_auditoria, proxima_auditoria || null, auditor_responsavel || null);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Auditoria registrada com sucesso' });
  });

  router.put('/api/auditorias/:id', (req, res) => {
    const { resultado, observacoes, proxima_auditoria } = req.body;
    const result = db.prepare('UPDATE auditorias_conformidade SET resultado = ?, observacoes = ?, proxima_auditoria = ? WHERE id = ?').run(resultado, observacoes, proxima_auditoria, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Auditoria nao encontrada' });
    res.json({ message: 'Auditoria atualizada com sucesso' });
  });

  router.delete('/api/auditorias/:id', (req, res) => {
    const result = db.prepare('DELETE FROM auditorias_conformidade WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Auditoria nao encontrada' });
    res.json({ message: 'Auditoria removida com sucesso' });
  });

  // ===== TREINAMENTOS =====
  router.get('/api/treinamentos', (req, res) => {
    const treinamentos = db.prepare('SELECT t.*, f.razao_social FROM treinamentos_esg t LEFT JOIN fornecedores f ON t.fornecedor_id = f.id ORDER BY t.created_at DESC').all();
    res.json(treinamentos);
  });

  router.post('/api/treinamentos', (req, res) => {
    const { fornecedor_id, titulo, descricao, carga_horaria, data_conclusao, status } = req.body;
    if (!fornecedor_id || !titulo) {
      return res.status(400).json({ error: 'Campos obrigatorios: fornecedor_id, titulo' });
    }
    const result = db.prepare(`
      INSERT INTO treinamentos_esg (fornecedor_id, titulo, descricao, carga_horaria, data_conclusao, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(fornecedor_id, titulo, descricao || null, carga_horaria || null, data_conclusao || null, status || 'pendente');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Treinamento criado com sucesso' });
  });

  router.put('/api/treinamentos/:id', (req, res) => {
    const { status, data_conclusao, titulo } = req.body;
    const result = db.prepare('UPDATE treinamentos_esg SET status = ?, data_conclusao = ?, titulo = ? WHERE id = ?').run(status, data_conclusao, titulo, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Treinamento nao encontrado' });
    res.json({ message: 'Treinamento atualizado com sucesso' });
  });

  router.delete('/api/treinamentos/:id', (req, res) => {
    const result = db.prepare('DELETE FROM treinamentos_esg WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Treinamento nao encontrado' });
    res.json({ message: 'Treinamento removido com sucesso' });
  });

  // ===== DASHBOARD =====
  router.get('/api/dashboard', (req, res) => {
    const totalFornecedores = db.prepare('SELECT COUNT(*) as count FROM fornecedores').get();
    const consumoTotal = db.prepare('SELECT SUM(consumo_kwh) as total FROM metricas_energia').get();
    const alertasAbertos = db.prepare('SELECT COUNT(*) as count FROM alertas_consumo WHERE resolvido = 0').get();
    const auditoriasAprovadas = db.prepare("SELECT COUNT(*) as count FROM auditorias_conformidade WHERE resultado = 'aprovado'").get();
    const treinamentosConcluidos = db.prepare("SELECT COUNT(*) as count FROM treinamentos_esg WHERE status = 'concluido'").get();
    res.json({
      fornecedores: totalFornecedores.count,
      consumoTotalKwh: consumoTotal.total,
      alertasAbertos: alertasAbertos.count,
      auditoriasAprovadas: auditoriasAprovadas.count,
      treinamentosConcluidos: treinamentosConcluidos.count,
    });
  });

  return router;
}

module.exports = createRoutes;
