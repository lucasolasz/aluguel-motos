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
    marca,
    modelo,
    ano,
    imagem_url,
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
    gen_random_uuid(),
    'Honda PCX 160',
    'Honda',
    'PCX 160',
    2024,
    '/images/motos/pcx-160.jpg',
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
    marca,
    modelo,
    ano,
    imagem_url,
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
    gen_random_uuid(),
    'Yamaha NMAX 160',
    'Yamaha',
    'NMAX 160',
    2024,
    '/images/motos/nmax-160.jpg',
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
    marca,
    modelo,
    ano,
    imagem_url,
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
    gen_random_uuid(),
    'Yamaha XMAX 250',
    'Yamaha',
    'XMAX 250',
    2024,
    '/images/motos/xmax-250.jpg',
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
    marca,
    modelo,
    ano,
    imagem_url,
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
    gen_random_uuid(),
    'Yamaha MT-07',
    'Yamaha',
    'MT-07',
    2024,
    '/images/motos/mt-07.jpg',
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
    marca,
    modelo,
    ano,
    imagem_url,
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
    gen_random_uuid(),
    'Kawasaki Z900',
    'Kawasaki',
    'Z900',
    2024,
    '/images/motos/z900.jpg',
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