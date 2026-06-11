-- Precificação Dinâmica
-- Executar em produção (ddl-auto=validate)

CREATE TABLE IF NOT EXISTS configuracao_precificacao (
  id UUID PRIMARY KEY,
  janeiro DECIMAL(5,4) DEFAULT 1.0,
  fevereiro DECIMAL(5,4) DEFAULT 1.0,
  marco DECIMAL(5,4) DEFAULT 1.0,
  abril DECIMAL(5,4) DEFAULT 1.0,
  maio DECIMAL(5,4) DEFAULT 1.0,
  junho DECIMAL(5,4) DEFAULT 1.0,
  julho DECIMAL(5,4) DEFAULT 1.0,
  agosto DECIMAL(5,4) DEFAULT 1.0,
  setembro DECIMAL(5,4) DEFAULT 1.0,
  outubro DECIMAL(5,4) DEFAULT 1.0,
  novembro DECIMAL(5,4) DEFAULT 1.0,
  dezembro DECIMAL(5,4) DEFAULT 1.0,
  carnaval_inicio_mes INT DEFAULT 2,
  carnaval_inicio_dia INT DEFAULT 10,
  carnaval_fim_mes INT DEFAULT 2,
  carnaval_fim_dia INT DEFAULT 17,
  carnaval_fator DECIMAL(5,4) DEFAULT 1.40
);

CREATE TABLE IF NOT EXISTS desconto_tiers (
  id UUID PRIMARY KEY,
  configuracao_id UUID REFERENCES configuracao_precificacao(id),
  min INT NOT NULL,
  max INT NOT NULL,
  desconto INT NOT NULL,
  ordem INT NOT NULL
);

ALTER TABLE reservas ADD COLUMN IF NOT EXISTS tipo_quilometragem VARCHAR(20) DEFAULT 'ECONOMICA';
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fator_desconto DECIMAL(5,4) DEFAULT 1.0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fator_sazonal DECIMAL(5,4) DEFAULT 1.0;

-- Seed default (executar apenas na primeira vez)
INSERT INTO configuracao_precificacao (id, janeiro, fevereiro, marco, abril, maio, junho,
  julho, agosto, setembro, outubro, novembro, dezembro,
  carnaval_inicio_mes, carnaval_inicio_dia, carnaval_fim_mes, carnaval_fim_dia, carnaval_fator)
SELECT '40000000-0000-0000-0000-000000000001'::uuid,
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.75, 1.0, 1.0, 1.0, 1.0, 1.25,
  2, 10, 2, 17, 1.40
WHERE NOT EXISTS (SELECT 1 FROM configuracao_precificacao);

INSERT INTO desconto_tiers (id, configuracao_id, min, max, desconto, ordem)
SELECT gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 1, 2, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM desconto_tiers);

INSERT INTO desconto_tiers (id, configuracao_id, min, max, desconto, ordem)
SELECT gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 3, 4, 10, 1
WHERE NOT EXISTS (SELECT 1 FROM desconto_tiers WHERE ordem = 1);

INSERT INTO desconto_tiers (id, configuracao_id, min, max, desconto, ordem)
SELECT gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 5, 7, 20, 2
WHERE NOT EXISTS (SELECT 1 FROM desconto_tiers WHERE ordem = 2);

INSERT INTO desconto_tiers (id, configuracao_id, min, max, desconto, ordem)
SELECT gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 8, 999, 30, 3
WHERE NOT EXISTS (SELECT 1 FROM desconto_tiers WHERE ordem = 3);
