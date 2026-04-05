function seed(db) {
  const insertFornecedor = db.prepare(
    'INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, inscricao_estadual, segmento, porte, email, telefone, cep, cidade, estado, certificacoes, politica_ambiental) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertMetrica = db.prepare(
    'INSERT INTO metricas_energia (fornecedor_id, mes_ano, consumo_kwh, custo_total, fonte_energia, reducao_percentual) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAlerta = db.prepare(
    'INSERT INTO alertas_consumo (metrica_id, tipo_alerta, descricao, severidade, resolvido) VALUES (?, ?, ?, ?, ?)'
  );
  const insertAuditoria = db.prepare(
    'INSERT INTO auditorias_conformidade (fornecedor_id, tipo_auditoria, resultado, observacoes, data_auditoria, proxima_auditoria, auditor_responsavel) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertTreinamento = db.prepare(
    'INSERT INTO treinamentos_esg (fornecedor_id, titulo, descricao, carga_horaria, data_conclusao, status) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const fornecedores = [
    ['SolarTech Energia Ltda', 'SolarTech', '12.345.678/0001-90', '123.456.789.012', 'energia', 'grande', 'contato@solartech.com.br', '(11) 98765-4321', '01310-100', 'Sao Paulo', 'SP', '["iso14001","leed","ghg"]', 'https://solartech.com.br/politica.pdf'],
    ['Verde Residuos S.A.', 'VerdeResiduos', '23.456.789/0001-81', '234.567.890.123', 'residuos', 'medio', 'admin@verderesiduos.com.br', '(21) 97654-3210', '20040-020', 'Rio de Janeiro', 'RJ', '["iso14001","iso9001"]', 'https://verderesiduos.com.br/politica.pdf'],
    ['AquaPura Tratamento de Agua', 'AquaPura', '34.567.890/0001-72', null, 'agua', 'epe', 'contato@aquapura.com.br', '(31) 96543-2109', '30130-000', 'Belo Horizonte', 'MG', '["iso14001","sa8000"]', 'https://aquapura.com.br/politica.pdf'],
    ['BioAgro Sustentavel Ltda', 'BioAgro', '45.678.901/0001-63', null, 'agricultura', 'me', 'contato@bioagro.com.br', '(41) 95432-1098', '80020-100', 'Curitiba', 'PR', '["iso14001","leed"]', 'https://bioagro.com.br/politica.pdf'],
    ['EcoTrans Transporte Limpo', 'EcoTrans', '56.789.012/0001-54', null, 'transporte', 'grande', 'contato@ecotrans.com.br', '(51) 94321-0987', '90050-170', 'Porto Alegre', 'RS', '["ghg","iso14001","iso9001"]', 'https://ecotrans.com.br/politica.pdf'],
    ['ConstruVerde Engenharia', 'ConstruVerde', '67.890.123/0001-45', null, 'construcao', 'medio', 'contato@construverde.com.br', '(61) 93210-9876', '70070-010', 'Brasilia', 'DF', '["leed","iso14001","b3"]', 'https://construverde.com.br/politica.pdf'],
    ['WindPower Energia Eolica', 'WindPower', '78.901.234/0001-36', null, 'energia', 'grande', 'contato@windpower.com.br', '(85) 92109-8765', '60160-300', 'Fortaleza', 'CE', '["iso14001","ghg","b3"]', 'https://windpower.com.br/politica.pdf'],
    ['EcoLixo Reciclagem Digital', 'EcoLixo', '89.012.345/0001-27', null, 'residuos', 'epe', 'contato@ecolixo.com.br', '(71) 91098-7654', '40070-110', 'Salvador', 'BA', '["iso14001","sa8000"]', null],
    ['SolarNorte Energia Fotovoltaica', 'SolarNorte', '90.123.456/0001-18', null, 'energia', 'medio', 'contato@solarnorte.com.br', '(92) 90987-6543', '69025-040', 'Manaus', 'AM', '["iso14001","leed","ghg","b3"]', 'https://solarnorte.com.br/politica.pdf'],
    ['AgroTech Hidroponia Sustentavel', 'AgroTech', '01.234.567/0001-09', null, 'agricultura', 'mei', 'contato@agrotech.com.br', '(48) 89876-5432', '88010-400', 'Florianopolis', 'SC', '["iso14001"]', 'https://agrotech.com.br/politica.pdf'],
  ];

  const insertManyFornecedores = db.transaction(() => {
    for (const f of fornecedores) { insertFornecedor.run(...f); }
  });
  insertManyFornecedores();

  const metricas = [
    [1, '2026-01', 15000.5, 8250.0, 'solar', 12.5],
    [1, '2026-02', 14200.0, 7810.0, 'solar', 13.0],
    [2, '2026-01', 22000.0, 12100.0, 'rede', 5.0],
    [3, '2026-01', 8500.0, 4675.0, 'hidro', 18.0],
    [4, '2026-01', 3200.0, 1760.0, 'solar', 20.0],
    [5, '2026-01', 45000.0, 24750.0, 'eletrica', 8.0],
    [5, '2026-02', 41400.0, 22770.0, 'eletrica', 10.0],
    [6, '2026-01', 18000.0, 9900.0, 'mista', 7.0],
    [7, '2026-01', 35000.0, 19250.0, 'eolica', 15.0],
    [7, '2026-02', 32000.0, 17600.0, 'eolica', 16.0],
    [8, '2026-01', 6000.0, 3300.0, 'rede', 3.0],
    [9, '2026-01', 28000.0, 15400.0, 'solar', 14.0],
    [10, '2026-01', 1500.0, 825.0, 'solar', 25.0],
  ];

  const insertManyMetricas = db.transaction(() => {
    for (const m of metricas) { insertMetrica.run(...m); }
  });
  insertManyMetricas();

  const alertas = [
    [1, 'ultrapassagem', 'Consumo 15% acima da meta mensal', 'alta', 1],
    [3, 'tendencia', 'Tendencia de aumento no consumo de energia', 'media', 0],
    [5, 'sucesso', 'Meta de reducao atingida com sucesso', 'baixa', 1],
    [6, 'ultrapassagem', 'Consumo 20% acima do limite establecido', 'alta', 0],
    [8, 'manutencao', 'Equipamentos necessitam manutencao preventiva', 'media', 0],
    [9, 'ultrapassagem', 'Pico de consumo identificado no horario comercial', 'alta', 1],
    [10, 'sucesso', 'Eficiencia energetica acima de 95%', 'baixa', 1],
    [11, 'tendencia', 'Reducao gradual observada ao longo do mes', 'baixa', 1],
    [12, 'manutencao', 'Sensor IoT desconectado por mais de 24h', 'alta', 0],
    [13, 'sucesso', 'Meta de 50% energia solar atingida', 'baixa', 1],
  ];

  const insertManyAlertas = db.transaction(() => {
    for (const a of alertas) { insertAlerta.run(...a); }
  });
  insertManyAlertas();

  const auditorias = [
    [1, 'ambiental', 'aprovado', 'Conforme com ISO 14001 e protocolos GHG', '2026-02-15', '2026-05-15', 'Carlos Silva'],
    [2, 'social', 'aprovado_com_observacao', 'Necessita melhorar diversidade em cargos de lideranca', '2026-01-20', '2026-04-20', 'Maria Santos'],
    [3, 'governanca', 'aprovado', 'Conformidade total com praticas de governanca corporativa', '2026-03-01', '2026-06-01', 'Joao Oliveira'],
    [4, 'ambiental', 'reprovado', 'Nao conformidade com tratamento de efluentes', '2026-02-10', '2026-03-10', 'Carlos Silva'],
    [5, 'ambiental', 'aprovado', 'Reducao de 12% na emissao de CO2', '2026-01-15', '2026-04-15', 'Ana Costa'],
    [6, 'social', 'aprovado', 'Programa de diversidade reconhecido como melhor pratica', '2026-02-28', '2026-05-28', 'Maria Santos'],
    [7, 'governanca', 'aprovado_com_observacao', 'Documentacao pendente de atualizacao', '2026-03-05', '2026-06-05', 'Joao Oliveira'],
    [8, 'ambiental', 'aprovado', 'Processos de reciclagem em conformidade', '2026-01-25', '2026-04-25', 'Carlos Silva'],
    [9, 'governanca', 'aprovado', 'Licencas ambientais em dia e documentacao completa', '2026-02-20', '2026-05-20', 'Joao Oliveira'],
    [10, 'social', 'aprovado', 'Treinamentos ESG realizados com sucesso', '2026-03-10', '2026-06-10', 'Ana Costa'],
  ];

  const insertManyAuditorias = db.transaction(() => {
    for (const a of auditorias) { insertAuditoria.run(...a); }
  });
  insertManyAuditorias();

  const treinamentos = [
    [1, 'Gestao de Pegada de Carbono', 'Como calcular e reduzir emissao de CO2 da empresa', 40, '2026-03-01', 'concluido'],
    [1, 'Seguranca no Trabalho com Energia Solar', 'Normas de seguranca para instalacao de paineis solares', 20, '2026-04-15', 'em_andamento'],
    [2, 'Gestao de Residuos Solidos', 'Melhores praticas para manejo e reciclagem de residuos', 16, '2026-02-10', 'concluido'],
    [2, 'Diversidade e Inclusao no Ambiente de Trabalho', 'Conscientizacao sobre equidade e respeito', 8, null, 'pendente'],
    [3, 'Tratamento de Agua e Efluentes', 'Normas ambientais para tratamento de aguas residuais', 24, '2026-01-20', 'concluido'],
    [4, 'Agricultura Regenerativa', 'Tecnicas de cultivo que recuperam o solo', 32, null, 'em_andamento'],
    [5, 'Conducao Eficiente de Frotas', 'Reducao de consumo de combustivel e emissao', 12, '2026-03-05', 'concluido'],
    [6, 'Construcao Sustentavel e LEED', 'Certificacao LEED na pratica para projetos de construcao', 28, '2026-02-28', 'concluido'],
    [7, 'Energia Eolica: Operacao e Manutencao', 'Boas praticas para turbinas eolicas', 20, null, 'pendente'],
    [8, 'Economia Circular para Residuos', 'Transformar residuos em recursos reutilizaveis', 16, '2026-03-15', 'concluido'],
    [9, 'Compliance Ambiental', 'Conformidade com legislacoes ambientais vigentes', 12, '2026-04-01', 'em_andamento'],
    [10, 'Hidroponia Sustentavel', 'Producao agricola com minimo consumo de agua', 20, null, 'pendente'],
  ];

  const insertManyTreinamentos = db.transaction(() => {
    for (const t of treinamentos) { insertTreinamento.run(...t); }
  });
  insertManyTreinamentos();

  console.log(`[seed] 10 fornecedores, ${metricas.length} metricas, ${alertas.length} alertas, ${auditorias.length} auditorias, ${treinamentos.length} treinamentos inseridos.`);
}

module.exports = seed;
