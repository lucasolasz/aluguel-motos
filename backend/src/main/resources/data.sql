-- CATEGORIAS
-- CATEGORIAS
INSERT INTO public.categorias (
    id,
    descricao,
    nome,
    slug,
    image_url
) VALUES
(
    '8eccc115-8455-4f02-af9d-88f1c325f0e5'::uuid,
    'Perfeitas para o dia a dia na cidade. Econômicas e fáceis de pilotar.',
    'Scooter',
    'scooter',
    '/images/categories/scooter.jpg'
),
(
    '2905c8df-e6c5-4877-a6ed-b2aa814bf587'::uuid,
    'Scooters de alto desempenho com mais conforto e potência.',
    'Scooter Premium',
    'scooter-premium',
    '/images/categories/premium-scooter.jpg'
),
(
    'fe460ec8-e080-452b-9d5f-b69238eba014'::uuid,
    'Ideais para viagens curtas e médias com muito conforto.',
    'Scooter Touring',
    'scooter-touring',
    '/images/categories/touring-scooter.jpg'
),
(
    'e71c9032-1fbc-49cf-89ca-a18ab051c259'::uuid,
    'Motos esportivas de alta performance para pilotos exigentes.',
    'Street Premium',
    'street-premium',
    '/images/categories/street-premium.jpg'
),
(
    'b0618acd-7127-4d43-a11b-e81832f0dcbe'::uuid,
    'Prontas para qualquer terreno e longas aventuras.',
    'Adventure Touring',
    'adventure-touring',
    '/images/categories/adventure-touring.jpg'
),
(
    'de494b1e-31b8-454a-9c94-f6cf72d72088'::uuid,
    'O melhor em tecnologia, conforto e desempenho.',
    'Ultra Premium',
    'ultra-premium',
    '/images/categories/ultra-premium.jpg'
),
(
    '91d05089-105f-49a6-8bdc-ef38dbe8880a'::uuid,
    'Estilo clássico americano para quem busca conforto e presença.',
    'Custom Cruiser',
    'custom-cruiser',
    '/images/categories/custom-cruiser.jpg'
);


-- HONDA PCX 160
INSERT INTO motos (
    id,
    nome,
    slug,
    marca,
    modelo,
    ano,
    preco_por_dia,
    caucao,
    motor,
    potencia,
    transmissao,
    capacidade_tanque,
    altura_assento,
    peso,
    itens,
    disponivel,
    categoria_id
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Honda PCX 160',
    'honda-pcx-160',
    'Honda',
    'PCX 160',
    2024,
    89,
    500,
    '157cc',
    '15.8 cv',
    'CVT Automático',
    '8.1 L',
    '764 mm',
    '132 kg',
    'Freios CBS, Painel Digital, Porta USB, Porta-malas 30L',
    true,
    '2905c8df-e6c5-4877-a6ed-b2aa814bf587'
);

-- YAMAHA NMAX 160
INSERT INTO motos (
    id,
    nome,
    slug,
    marca,
    modelo,
    ano,
    preco_por_dia,
    caucao,
    motor,
    potencia,
    transmissao,
    capacidade_tanque,
    altura_assento,
    peso,
    itens,
    disponivel,
    categoria_id
) VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Yamaha NMAX 160',
    'yamaha-nmax-160',
    'Yamaha',
    'NMAX 160',
    2024,
    95,
    500,
    '155cc',
    '14.7 cv',
    'CVT Automático',
    '7.1 L',
    '765 mm',
    '127 kg',
    'ABS, Painel Digital TFT, Conectividade Bluetooth, LED',
    true,
    '2905c8df-e6c5-4877-a6ed-b2aa814bf587'
);

-- YAMAHA XMAX 250
INSERT INTO motos (
    id,
    nome,
    slug,
    marca,
    modelo,
    ano,
    preco_por_dia,
    caucao,
    motor,
    potencia,
    transmissao,
    capacidade_tanque,
    altura_assento,
    peso,
    itens,
    disponivel,
    categoria_id
) VALUES (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Yamaha XMAX 250',
    'yamaha-xmax-250',
    'Yamaha',
    'XMAX 250',
    2024,
    159,
    1000,
    '250cc',
    '22.8 cv',
    'CVT Automático',
    '13 L',
    '795 mm',
    '179 kg',
    'ABS, Controle de Tração, Painel TFT 7, Smart Key, Porta-malas 45L',
    true,
    'fe460ec8-e080-452b-9d5f-b69238eba014'
);

-- YAMAHA MT-07
INSERT INTO motos (
    id,
    nome,
    slug,
    marca,
    modelo,
    ano,
    preco_por_dia,
    caucao,
    motor,
    potencia,
    transmissao,
    capacidade_tanque,
    altura_assento,
    peso,
    itens,
    disponivel,
    categoria_id
) VALUES (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Yamaha MT-07',
    'yamaha-mt-07',
    'Yamaha',
    'MT-07',
    2024,
    229,
    2000,
    '689cc',
    '74.8 cv',
    '6 marchas',
    '14 L',
    '805 mm',
    '184 kg',
    'ABS, Painel Digital, Farol LED, Modos de Pilotagem',
    true,
    'e71c9032-1fbc-49cf-89ca-a18ab051c259'
);

-- KAWASAKI Z900
INSERT INTO motos (
    id,
    nome,
    slug,
    marca,
    modelo,
    ano,
    preco_por_dia,
    caucao,
    motor,
    potencia,
    transmissao,
    capacidade_tanque,
    altura_assento,
    peso,
    itens,
    disponivel,
    categoria_id
) VALUES (
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Kawasaki Z900',
    'kawasaki-z900',
    'Kawasaki',
    'Z900',
    2024,
    289,
    2500,
    '948cc',
    '125 cv',
    '6 marchas',
    '17 L',
    '820 mm',
    '212 kg',
    'ABS, Controle de Tração, Painel TFT, 4 Modos de Pilotagem',
    true,
    'e71c9032-1fbc-49cf-89ca-a18ab051c259'
);

-- ACESSORIOS
INSERT INTO acessorios (id, nome, descricao, preco_por_dia, quantidade_maxima) VALUES
('20000000-0000-0000-0000-000000000001'::uuid, 'Capacete Extra', 'Capacete certificado para passageiro.', 15, 2),
('20000000-0000-0000-0000-000000000002'::uuid, 'Luvas', 'Luvas de proteção para piloto.', 10, 2),
('20000000-0000-0000-0000-000000000003'::uuid, 'GPS', 'Navegador GPS com mapas atualizados.', 25, 1),
('20000000-0000-0000-0000-000000000004'::uuid, 'Baú (Top Case)', 'Baú traseiro com capacidade de 45 litros.', 20, 1),
('20000000-0000-0000-0000-000000000005'::uuid, 'Capa de Chuva', 'Conjunto de capa de chuva impermeável.', 8, 2),
('20000000-0000-0000-0000-000000000006'::uuid, 'Suporte para Celular', 'Suporte universal com carregador USB.', 12, 1);


-- SEGUROS
INSERT INTO seguros (id, nome, slug, descricao, preco_por_dia, basico) VALUES
('10000000-0000-0000-0000-000000000001'::uuid, 'Seguro Básico', 'seguro-basico', 'Cobertura básica incluída no valor da diária.', 0, true),
('10000000-0000-0000-0000-000000000002'::uuid, 'Seguro Completo - Scooters', 'seguro-completo-scooters', 'Proteção total para scooters com franquia reduzida.', 38.9, false),
('10000000-0000-0000-0000-000000000003'::uuid, 'Seguro Completo - Motos', 'seguro-completo-motos', 'Proteção máxima para motos de maior cilindrada.', 59.9, false);

-- SEGURO COBERTURAS
-- Seguro Básico
INSERT INTO seguro_coberturas (id, seguro_id, descricao, ordem) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001'::uuid, 'Responsabilidade civil obrigatória', 0),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001'::uuid, 'Assistência 24h', 1),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001'::uuid, 'Guincho até 50km', 2);

-- Seguro Completo - Scooters
INSERT INTO seguro_coberturas (id, seguro_id, descricao, ordem) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'::uuid, 'Cobertura contra roubo e furto', 0),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'::uuid, 'Danos a terceiros', 1),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'::uuid, 'Franquia reduzida (R$ 500)', 2),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'::uuid, 'Assistência 24h premium', 3),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'::uuid, 'Guincho ilimitado', 4),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002'::uuid, 'Carro reserva por 3 dias', 5);

-- Seguro Completo - Motos
INSERT INTO seguro_coberturas (id, seguro_id, descricao, ordem) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Cobertura contra roubo e furto', 0),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Danos a terceiros até R$ 100.000', 1),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Franquia reduzida (R$ 1.000)', 2),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Assistência 24h VIP', 3),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Guincho ilimitado', 4),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Moto reserva por 5 dias', 5),
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003'::uuid, 'Cobertura de equipamentos', 6);


-- MOTO FOTOS
-- Honda PCX 160
INSERT INTO moto_fotos (id, moto_id, url, ordem, principal) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, '/images/motos/pcx-160.jpg', 0, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, '/images/motos/pcx-160-side.jpg', 1, false);

-- Yamaha NMAX 160
INSERT INTO moto_fotos (id, moto_id, url, ordem, principal) VALUES
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, '/images/motos/nmax-160.png', 0, true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, '/images/motos/nmax-160-side.png', 1, false);

-- Yamaha XMAX 250
INSERT INTO moto_fotos (id, moto_id, url, ordem, principal) VALUES
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333'::uuid, '/images/motos/xmax-250.png', 0, true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333'::uuid, '/images/motos/xmax-250-side.png', 1, false);

-- Yamaha MT-07
INSERT INTO moto_fotos (id, moto_id, url, ordem, principal) VALUES
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444'::uuid, '/images/motos/mt-07.png', 0, true),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444'::uuid, '/images/motos/mt-07-side.png', 1, false);

-- Kawasaki Z900
INSERT INTO moto_fotos (id, moto_id, url, ordem, principal) VALUES
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555'::uuid, '/images/motos/z900.png', 0, true),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555'::uuid, '/images/motos/z900-side.png', 1, false);


-- PERMISSOES
INSERT INTO permissao (nome) VALUES ('ADMIN_FULL');
INSERT INTO permissao (nome) VALUES ('RESERVAS_LEITURA');
INSERT INTO permissao (nome) VALUES ('RESERVAS_ESCRITA');
INSERT INTO permissao (nome) VALUES ('USUARIOS_LEITURA');

-- GRUPOS
INSERT INTO grupo (nome) VALUES ('DESENVOLVEDORES');
INSERT INTO grupo (nome) VALUES ('ADMINS');
INSERT INTO grupo (nome) VALUES ('GERAL');

-- GRUPO_PERMISSOES: desenvolvedores tem todas as permissoes
INSERT INTO grupo_permissoes (grupo_id, permissoes_id)
SELECT g.id, p.id FROM grupo g, permissao p WHERE g.nome = 'DESENVOLVEDORES';

-- GRUPO_PERMISSOES: admins tem ADMIN_FULL + RESERVAS + USUARIOS
INSERT INTO grupo_permissoes (grupo_id, permissoes_id)
SELECT g.id, p.id FROM grupo g JOIN permissao p ON p.nome IN ('ADMIN_FULL', 'RESERVAS_LEITURA', 'RESERVAS_ESCRITA', 'USUARIOS_LEITURA')
WHERE g.nome = 'ADMINS';

-- GRUPO_PERMISSOES: geral tem apenas RESERVAS_LEITURA
INSERT INTO grupo_permissoes (grupo_id, permissoes_id)
SELECT g.id, p.id FROM grupo g JOIN permissao p ON p.nome = 'RESERVAS_LEITURA'
WHERE g.nome = 'GERAL';

-- USUARIO: lucasolasz / lucas123 no grupo DESENVOLVEDORES
INSERT INTO usuario (id, username, password, enabled, grupo_id)
SELECT gen_random_uuid()::text, 'lucasolasz', '$2y$10$L7XVUu3GsRzMdQRwgfNKrOcXS37gi.gVmSGU4276FILy5gtqKwVHm', true, g.id
FROM grupo g WHERE g.nome = 'DESENVOLVEDORES';