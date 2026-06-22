import { Car } from "./types";

/**
 * Estoque REAL da HL Motors (Pinhais/PR) — 16 veículos.
 * Extraído da revenda 166 no Socarrão via API oficial (search/closed).
 * Fotos reais em /public/estoque/<id>.
 */

export const cars: Car[] = [
  {
    "id": "mustang-2018-1166995",
    "marca": "Ford",
    "modelo": "Mustang",
    "versao": "GT Premium 5.0 V8",
    "ano": 2018,
    "anoFab": 2018,
    "km": 89000,
    "preco": 349900,
    "cambio": "Automático",
    "combustivel": "Gasolina",
    "cor": "Cinza",
    "portas": 2,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#2b2e33",
      "#08090b"
    ],
    "fotos": [
      "/estoque/1166995/1.jpeg",
      "/estoque/1166995/2.jpeg",
      "/estoque/1166995/3.jpeg",
      "/estoque/1166995/4.jpeg",
      "/estoque/1166995/5.jpeg",
      "/estoque/1166995/6.jpeg"
    ],
    "opcionais": [
      "Motor 5.0 V8 466cv",
      "Bancos em couro",
      "Som premium",
      "Modos de condução",
      "Rodas esportivas"
    ],
    "descricao": "Ford Mustang GT Premium 5.0 V8 — 2018, 89.000 km, cor Cinza. O muscle car icônico do estoque da HL Motors."
  },
  {
    "id": "cooper-2011-1007661",
    "marca": "MINI",
    "modelo": "COOPER",
    "versao": "Countryman S ALL4 1.6 Aut.",
    "ano": 2011,
    "anoFab": 2011,
    "km": 77000,
    "preco": 92900,
    "cambio": "Automático",
    "combustivel": "Gasolina",
    "cor": "Branco",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#3a2226",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/1007661/1.jpeg",
      "/estoque/1007661/2.jpeg",
      "/estoque/1007661/3.jpeg",
      "/estoque/1007661/4.jpeg",
      "/estoque/1007661/5.jpeg",
      "/estoque/1007661/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Hatch",
      "Câmbio Automático",
      "Gasolina",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "MINI COOPER Countryman S ALL4 1.6 Aut. — 2011/2011, 77.000 km, cor Branco, Hatch. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "hr-v-2016-981691",
    "marca": "Honda",
    "modelo": "HR-V",
    "versao": "EXL 1.8 Flexone 16V 5p Aut.",
    "ano": 2016,
    "anoFab": 2016,
    "km": 112000,
    "preco": 86900,
    "cambio": "Automático",
    "combustivel": "Flex",
    "cor": "Vermelho",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#2b2e33",
      "#08090b"
    ],
    "fotos": [
      "/estoque/981691/1.jpeg",
      "/estoque/981691/2.jpeg",
      "/estoque/981691/3.jpeg",
      "/estoque/981691/4.jpeg",
      "/estoque/981691/5.jpeg",
      "/estoque/981691/6.jpeg"
    ],
    "opcionais": [
      "Carroceria SUV",
      "Câmbio Automático",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Honda HR-V EXL 1.8 Flexone 16V 5p Aut. — 2016/2016, 112.000 km, cor Vermelho, SUV. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "compass-2018-937799",
    "marca": "Jeep",
    "modelo": "Compass",
    "versao": "Longitude 2.0 4x2 Flex 16V Aut.",
    "ano": 2018,
    "anoFab": 2018,
    "km": 105000,
    "preco": 84900,
    "cambio": "Automático",
    "combustivel": "Flex",
    "cor": "Branco",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#33363c",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/937799/1.jpeg",
      "/estoque/937799/2.jpeg",
      "/estoque/937799/3.jpeg",
      "/estoque/937799/4.jpeg",
      "/estoque/937799/5.jpeg",
      "/estoque/937799/6.jpeg"
    ],
    "opcionais": [
      "Câmbio automático",
      "Central multimídia",
      "Câmera de ré",
      "Rodas de liga",
      "Controle de estabilidade"
    ],
    "descricao": "Jeep Compass Longitude 2.0 Flex — 2018, 105.000 km, cor Branco. SUV completo e espaçoso."
  },
  {
    "id": "golf-2015-1789433",
    "marca": "Volkswagen",
    "modelo": "Golf",
    "versao": "Highline 1.4 TSI 140cv Aut.",
    "ano": 2015,
    "anoFab": 2015,
    "km": 119000,
    "preco": 79900,
    "cambio": "Automático",
    "combustivel": "Gasolina",
    "cor": "Azul",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#1f3550",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/1789433/1.jpeg",
      "/estoque/1789433/2.jpeg",
      "/estoque/1789433/3.jpeg",
      "/estoque/1789433/4.jpeg",
      "/estoque/1789433/5.jpeg",
      "/estoque/1789433/6.jpeg"
    ],
    "opcionais": [
      "Motor 1.4 TSI turbo",
      "Câmbio DSG",
      "Bancos em couro",
      "Faróis LED",
      "Multimídia"
    ],
    "descricao": "VW Golf Highline 1.4 TSI — 2015, 119.000 km, cor Azul. Turbo, econômico e refinado."
  },
  {
    "id": "hb20-2024-981682",
    "marca": "Hyundai",
    "modelo": "HB20",
    "versao": "Limited 1.0 Flex 12V Mec.",
    "ano": 2024,
    "anoFab": 2024,
    "km": 38000,
    "preco": 77900,
    "cambio": "Manual",
    "combustivel": "Flex",
    "cor": "Cinza",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#2a2a2e",
      "#08090b"
    ],
    "fotos": [
      "/estoque/981682/1.jpeg",
      "/estoque/981682/2.jpeg",
      "/estoque/981682/3.jpeg",
      "/estoque/981682/4.jpeg",
      "/estoque/981682/5.jpeg",
      "/estoque/981682/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Hatch",
      "Câmbio Mecânico",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Hyundai HB20 Limited 1.0 Flex 12V Mec. — 2024/2024, 38.000 km, cor Cinza, Hatch. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "renegade-2018-1142123",
    "marca": "Jeep",
    "modelo": "Renegade",
    "versao": "Longitude 1.8 4x2 Flex 16V Aut.",
    "ano": 2018,
    "anoFab": 2018,
    "km": 98000,
    "preco": 71900,
    "cambio": "Automático",
    "combustivel": "Flex",
    "cor": "Branco",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#3a2230",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/1142123/1.jpeg",
      "/estoque/1142123/2.jpeg",
      "/estoque/1142123/3.jpeg",
      "/estoque/1142123/4.jpeg",
      "/estoque/1142123/5.jpeg",
      "/estoque/1142123/6.jpeg"
    ],
    "opcionais": [
      "Carroceria SUV",
      "Câmbio Automático",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Jeep Renegade Longitude 1.8 4x2 Flex 16V Aut. — 2018/2018, 98.000 km, cor Branco, SUV. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "c3-aircross-2018-5869",
    "marca": "Citroën",
    "modelo": "C3 Aircross",
    "versao": "Live 1.6 Flex 16V 5p Aut.",
    "ano": 2018,
    "anoFab": 2018,
    "km": 117000,
    "preco": 49900,
    "cambio": "Automático",
    "combustivel": "Flex",
    "cor": "Cinza",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#243042",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/5869/1.jpeg",
      "/estoque/5869/2.jpeg",
      "/estoque/5869/3.jpeg",
      "/estoque/5869/4.jpeg",
      "/estoque/5869/5.jpeg",
      "/estoque/5869/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Minivan",
      "Câmbio Automático",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Citroën C3 Aircross Live 1.6 Flex 16V 5p Aut. — 2018/2018, 117.000 km, cor Cinza, Minivan. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "208-2016-1007727",
    "marca": "Peugeot",
    "modelo": "208",
    "versao": "Allure 1.6 Flex 16V 5p Aut.",
    "ano": 2016,
    "anoFab": 2016,
    "km": 87000,
    "preco": 49900,
    "cambio": "Automático",
    "combustivel": "Flex",
    "cor": "Branco",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#2a2e36",
      "#08090b"
    ],
    "fotos": [
      "/estoque/1007727/1.jpeg",
      "/estoque/1007727/2.jpeg",
      "/estoque/1007727/3.jpeg",
      "/estoque/1007727/4.jpeg",
      "/estoque/1007727/5.jpeg",
      "/estoque/1007727/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Hatch",
      "Câmbio Automático",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Peugeot 208 Allure 1.6 Flex 16V 5p Aut. — 2016/2016, 87.000 km, cor Branco, Hatch. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "livina-2012-956048",
    "marca": "Nissan",
    "modelo": "LIVINA",
    "versao": "GRAND SL 1.8 16V Flex Fuel Aut.",
    "ano": 2012,
    "anoFab": 2012,
    "km": 149000,
    "preco": 41900,
    "cambio": "Automático",
    "combustivel": "Flex",
    "cor": "Preto",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#2f3a33",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/956048/1.jpeg",
      "/estoque/956048/2.jpeg",
      "/estoque/956048/3.jpeg",
      "/estoque/956048/4.jpeg",
      "/estoque/956048/5.jpeg",
      "/estoque/956048/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Minivan",
      "Câmbio Automático",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Nissan LIVINA GRAND SL 1.8 16V Flex Fuel Aut. — 2012/2012, 149.000 km, cor Preto, Minivan. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "hb20-2014-956689",
    "marca": "Hyundai",
    "modelo": "HB20",
    "versao": "Comf./C.Plus/C.Style 1.0 Flex 12V",
    "ano": 2014,
    "anoFab": 2014,
    "km": 1850,
    "preco": 41900,
    "cambio": "Manual",
    "combustivel": "Flex",
    "cor": "Branco",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#3a3326",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/956689/1.jpeg",
      "/estoque/956689/2.jpeg",
      "/estoque/956689/3.jpeg",
      "/estoque/956689/4.jpeg",
      "/estoque/956689/5.jpeg",
      "/estoque/956689/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Hatch",
      "Câmbio Mecânico",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Hyundai HB20 Comf./C.Plus/C.Style 1.0 Flex 12V — 2014/2014, 1.850 km, cor Branco, Hatch. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "ecosport-2008-994605",
    "marca": "Ford",
    "modelo": "EcoSport",
    "versao": "XLT 2.0/ 2.0 Flex 16V 5p Mec.",
    "ano": 2008,
    "anoFab": 2008,
    "km": 169000,
    "preco": 35900,
    "cambio": "Manual",
    "combustivel": "Flex",
    "cor": "Prata",
    "portas": 4,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#1f3550",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/994605/1.jpeg",
      "/estoque/994605/2.jpeg",
      "/estoque/994605/3.jpeg",
      "/estoque/994605/4.jpeg",
      "/estoque/994605/5.jpeg",
      "/estoque/994605/6.jpeg"
    ],
    "opcionais": [
      "Carroceria SUV",
      "Câmbio Mecânico",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Ford EcoSport XLT 2.0/ 2.0 Flex 16V 5p Mec. — 2008/2008, 169.000 km, cor Prata, SUV. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "courier-2009-981704",
    "marca": "Ford",
    "modelo": "Courier",
    "versao": "1.6 L/ 1.6 Flex",
    "ano": 2009,
    "anoFab": 2009,
    "km": 195000,
    "preco": 32900,
    "cambio": "Manual",
    "combustivel": "Flex",
    "cor": "Preto",
    "portas": 2,
    "status": "disponivel",
    "destaque": true,
    "gradient": [
      "#33363c",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/981704/1.jpeg",
      "/estoque/981704/2.jpeg",
      "/estoque/981704/3.jpeg",
      "/estoque/981704/4.jpeg",
      "/estoque/981704/5.jpeg",
      "/estoque/981704/6.jpeg"
    ],
    "opcionais": [
      "Carroceria Picape",
      "Câmbio Mecânico",
      "Flex",
      "Documentação em dia",
      "Aceita troca / financiamento"
    ],
    "descricao": "Ford Courier 1.6 L/ 1.6 Flex — 2009/2009, 195.000 km, cor Preto, Picape. Estoque HL Motors (Pinhais/PR)."
  },
  {
    "id": "ranger-1996-930570",
    "marca": "Ford",
    "modelo": "Ranger",
    "versao": "STX 4.0 CS/CE V6",
    "ano": 1996,
    "anoFab": 1996,
    "km": 252000,
    "preco": 64900,
    "cambio": "Manual",
    "combustivel": "Gasolina",
    "cor": "Prata",
    "portas": 2,
    "status": "disponivel",
    "destaque": false,
    "gradient": [
      "#3a2230",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/930570/1.jpeg",
      "/estoque/930570/2.jpeg",
      "/estoque/930570/3.jpeg",
      "/estoque/930570/4.jpeg",
      "/estoque/930570/5.jpeg",
      "/estoque/930570/6.jpeg"
    ],
    "opcionais": [
      "Motor 4.0 V6",
      "Tração traseira",
      "Direção hidráulica"
    ],
    "descricao": "Ford Ranger STX 4.0 V6 — 1996, cor Prata. Picape robusta para trabalho e coleção."
  },
  {
    "id": "308-2015-937623",
    "marca": "Peugeot",
    "modelo": "308",
    "versao": "Active 1.6 Flex 16V 5p",
    "ano": 2015,
    "anoFab": 2015,
    "km": 129000,
    "preco": 49900,
    "cambio": "Manual",
    "combustivel": "Flex",
    "cor": "Vermelho",
    "portas": 5,
    "status": "disponivel",
    "destaque": false,
    "gradient": [
      "#3a2226",
      "#0a0c12"
    ],
    "fotos": [
      "/estoque/937623/1.jpeg",
      "/estoque/937623/2.jpeg",
      "/estoque/937623/3.jpeg",
      "/estoque/937623/4.jpeg",
      "/estoque/937623/5.jpeg",
      "/estoque/937623/6.jpeg"
    ],
    "opcionais": [
      "Motor 1.6 16V",
      "Ar-condicionado",
      "Direção elétrica",
      "Vidros/travas elétricos",
      "Multimídia Bluetooth"
    ],
    "descricao": "Peugeot 308 Active 1.6 — 2015, 129.000 km, cor Vermelho. Conforto e ótimo custo-benefício."
  },
  {
    "id": "idea-2012-1018351",
    "marca": "Fiat",
    "modelo": "Idea",
    "versao": "Adventure / Adv.Locker 1.8 Flex 5p",
    "ano": 2012,
    "anoFab": 2012,
    "km": 1910,
    "preco": 36900,
    "cambio": "Manual",
    "combustivel": "Flex",
    "cor": "Vermelho",
    "portas": 5,
    "status": "disponivel",
    "destaque": false,
    "gradient": [
      "#2a2e36",
      "#08090b"
    ],
    "fotos": [
      "/estoque/1018351/1.jpeg",
      "/estoque/1018351/2.jpeg",
      "/estoque/1018351/3.jpeg",
      "/estoque/1018351/4.jpeg",
      "/estoque/1018351/5.jpeg",
      "/estoque/1018351/6.jpeg"
    ],
    "opcionais": [
      "Motor 1.8 E.torQ",
      "Ar-condicionado",
      "Direção hidráulica",
      "Vidros/travas elétricos",
      "Rodas de liga"
    ],
    "descricao": "Fiat Idea Adventure 1.8 — 2012, baixíssima km, cor Vermelho. Raridade pelo estado."
  }
];

export function getCar(id: string): Car | undefined {
  return cars.find((c) => c.id === id);
}

export const brands = Array.from(new Set(cars.map((c) => c.marca))).sort();
