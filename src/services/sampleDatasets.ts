import { BusinessContext } from '../types';

export interface SampleDataset {
  id: string;
  title: string;
  sector: string;
  description: string;
  context: BusinessContext;
  data: Record<string, any>[];
}

// Generate realistic clustered dataset for Retail E-commerce
function generateRetailDataset(): Record<string, any>[] {
  const records: Record<string, any>[] = [];
  let id = 1001;

  // Segment 1: VIP Champions (high spend, high frequency, low recency) ~ 15%
  for (let i = 0; i < 75; i++) {
    records.push({
      ID_Cliente: `CLI-${id++}`,
      Recencia_Dias: Math.round(5 + Math.random() * 25),
      Frecuencia_Anual: Math.round(18 + Math.random() * 24),
      Monto_Total_Gastado: Math.round(3800 + Math.random() * 4200),
      Ticket_Promedio: Math.round(160 + Math.random() * 90),
      Tasa_Devoluciones_Pct: +(1.2 + Math.random() * 3.5).toFixed(1),
      Antiguedad_Meses: Math.round(24 + Math.random() * 36),
      Canal_Predominante: Math.random() > 0.4 ? 'Omnicanal' : 'App Móvil',
      Nivel_CSAT: Math.round(8.5 + Math.random() * 1.5),
    });
  }

  // Segment 2: Leales Frecuentes de Ticket Medio ~ 30%
  for (let i = 0; i < 150; i++) {
    records.push({
      ID_Cliente: `CLI-${id++}`,
      Recencia_Dias: Math.round(15 + Math.random() * 45),
      Frecuencia_Anual: Math.round(9 + Math.random() * 9),
      Monto_Total_Gastado: Math.round(1200 + Math.random() * 1400),
      Ticket_Promedio: Math.round(85 + Math.random() * 40),
      Tasa_Devoluciones_Pct: +(3.0 + Math.random() * 4.0).toFixed(1),
      Antiguedad_Meses: Math.round(14 + Math.random() * 26),
      Canal_Predominante: Math.random() > 0.5 ? 'Web' : 'App Móvil',
      Nivel_CSAT: Math.round(7.2 + Math.random() * 2.2),
    });
  }

  // Segment 3: Clientes Nuevos Prometedores ~ 20%
  for (let i = 0; i < 100; i++) {
    records.push({
      ID_Cliente: `CLI-${id++}`,
      Recencia_Dias: Math.round(3 + Math.random() * 28),
      Frecuencia_Anual: Math.round(2 + Math.random() * 4),
      Monto_Total_Gastado: Math.round(350 + Math.random() * 550),
      Ticket_Promedio: Math.round(110 + Math.random() * 60),
      Tasa_Devoluciones_Pct: +(2.5 + Math.random() * 3.5).toFixed(1),
      Antiguedad_Meses: Math.round(1 + Math.random() * 5),
      Canal_Predominante: Math.random() > 0.3 ? 'Web' : 'Tienda Física',
      Nivel_CSAT: Math.round(7.8 + Math.random() * 2.0),
    });
  }

  // Segment 4: En Riesgo / Inactivos con Alto Histórico ~ 20%
  for (let i = 0; i < 100; i++) {
    records.push({
      ID_Cliente: `CLI-${id++}`,
      Recencia_Dias: Math.round(120 + Math.random() * 180),
      Frecuencia_Anual: Math.round(4 + Math.random() * 5),
      Monto_Total_Gastado: Math.round(1600 + Math.random() * 1800),
      Ticket_Promedio: Math.round(140 + Math.random() * 80),
      Tasa_Devoluciones_Pct: +(6.5 + Math.random() * 8.5).toFixed(1),
      Antiguedad_Meses: Math.round(18 + Math.random() * 30),
      Canal_Predominante: Math.random() > 0.6 ? 'Web' : 'Tienda Física',
      Nivel_CSAT: Math.round(4.8 + Math.random() * 2.5),
    });
  }

  // Segment 5: Cazadores de Ofertas de Bajo Ticket ~ 15%
  for (let i = 0; i < 75; i++) {
    records.push({
      ID_Cliente: `CLI-${id++}`,
      Recencia_Dias: Math.round(60 + Math.random() * 100),
      Frecuencia_Anual: Math.round(1 + Math.random() * 3),
      Monto_Total_Gastado: Math.round(95 + Math.random() * 180),
      Ticket_Promedio: Math.round(35 + Math.random() * 25),
      Tasa_Devoluciones_Pct: +(4.0 + Math.random() * 6.0).toFixed(1),
      Antiguedad_Meses: Math.round(6 + Math.random() * 20),
      Canal_Predominante: 'Web',
      Nivel_CSAT: Math.round(6.0 + Math.random() * 2.5),
    });
  }

  // Shuffle
  return records.sort(() => Math.random() - 0.5);
}

// Generate B2B SaaS dataset
function generateB2BDataset(): Record<string, any>[] {
  const records: Record<string, any>[] = [];
  let id = 5001;

  // Enterprise Accounts (high ARR, high seats, low support friction)
  for (let i = 0; i < 60; i++) {
    records.push({
      Empresa_ID: `CORP-${id++}`,
      MRR_Mensual_USD: Math.round(4500 + Math.random() * 5500),
      Licencias_Activas: Math.round(85 + Math.random() * 140),
      Tasa_Adopcion_Pct: +(82 + Math.random() * 16).toFixed(1),
      Tickets_Soporte_Trimestre: Math.round(2 + Math.random() * 4),
      Indice_NPS: Math.round(8 + Math.random() * 2),
      Antiguedad_Meses: Math.round(20 + Math.random() * 40),
      Plan_Suscripcion: 'Enterprise Plus',
      Horas_Uso_Semanal: Math.round(320 + Math.random() * 280),
    });
  }

  // Scale-ups (fast growing, moderate spend, high engagement)
  for (let i = 0; i < 110; i++) {
    records.push({
      Empresa_ID: `CORP-${id++}`,
      MRR_Mensual_USD: Math.round(1400 + Math.random() * 1800),
      Licencias_Activas: Math.round(28 + Math.random() * 45),
      Tasa_Adopcion_Pct: +(74 + Math.random() * 20).toFixed(1),
      Tickets_Soporte_Trimestre: Math.round(4 + Math.random() * 6),
      Indice_NPS: Math.round(7 + Math.random() * 3),
      Antiguedad_Meses: Math.round(10 + Math.random() * 22),
      Plan_Suscripcion: 'Professional',
      Horas_Uso_Semanal: Math.round(140 + Math.random() * 120),
    });
  }

  // High-touch / At-risk (paying good MRR but low adoption, high complaints)
  for (let i = 0; i < 70; i++) {
    records.push({
      Empresa_ID: `CORP-${id++}`,
      MRR_Mensual_USD: Math.round(2200 + Math.random() * 2600),
      Licencias_Activas: Math.round(40 + Math.random() * 50),
      Tasa_Adopcion_Pct: +(34 + Math.random() * 22).toFixed(1),
      Tickets_Soporte_Trimestre: Math.round(12 + Math.random() * 14),
      Indice_NPS: Math.round(3 + Math.random() * 3),
      Antiguedad_Meses: Math.round(14 + Math.random() * 28),
      Plan_Suscripcion: 'Professional',
      Horas_Uso_Semanal: Math.round(55 + Math.random() * 60),
    });
  }

  // Starter SMBs (low spend, low usage)
  for (let i = 0; i < 90; i++) {
    records.push({
      Empresa_ID: `CORP-${id++}`,
      MRR_Mensual_USD: Math.round(190 + Math.random() * 450),
      Licencias_Activas: Math.round(4 + Math.random() * 8),
      Tasa_Adopcion_Pct: +(55 + Math.random() * 30).toFixed(1),
      Tickets_Soporte_Trimestre: Math.round(1 + Math.random() * 3),
      Indice_NPS: Math.round(6 + Math.random() * 3),
      Antiguedad_Meses: Math.round(4 + Math.random() * 16),
      Plan_Suscripcion: 'Starter Team',
      Horas_Uso_Semanal: Math.round(20 + Math.random() * 35),
    });
  }

  return records.sort(() => Math.random() - 0.5);
}

// Generate Banking / Financial Services dataset
function generateBankingDataset(): Record<string, any>[] {
  const records: Record<string, any>[] = [];
  let id = 8001;

  for (let i = 0; i < 350; i++) {
    // 3 profiles: Premier Affluent, Digital Transactors, Basic Credit
    const isAffluent = i < 90;
    const isDigital = i >= 90 && i < 240;

    if (isAffluent) {
      records.push({
        Cliente_ID: `BNC-${id++}`,
        Saldo_Promedio_USD: Math.round(32000 + Math.random() * 55000),
        Transacciones_Mensuales: Math.round(25 + Math.random() * 35),
        Productos_Financieros_Activos: Math.round(4 + Math.random() * 3),
        Score_Crediticio: Math.round(760 + Math.random() * 90),
        Canal_Digital_Uso_Pct: +(65 + Math.random() * 30).toFixed(1),
        Tasa_Mora_Historica_Pct: +(0.0 + Math.random() * 0.8).toFixed(1),
        Antiguedad_Anios: Math.round(5 + Math.random() * 12),
      });
    } else if (isDigital) {
      records.push({
        Cliente_ID: `BNC-${id++}`,
        Saldo_Promedio_USD: Math.round(4200 + Math.random() * 7500),
        Transacciones_Mensuales: Math.round(40 + Math.random() * 50),
        Productos_Financieros_Activos: Math.round(2 + Math.random() * 2),
        Score_Crediticio: Math.round(680 + Math.random() * 80),
        Canal_Digital_Uso_Pct: +(90 + Math.random() * 10).toFixed(1),
        Tasa_Mora_Historica_Pct: +(0.5 + Math.random() * 2.0).toFixed(1),
        Antiguedad_Anios: Math.round(2 + Math.random() * 6),
      });
    } else {
      records.push({
        Cliente_ID: `BNC-${id++}`,
        Saldo_Promedio_USD: Math.round(650 + Math.random() * 1800),
        Transacciones_Mensuales: Math.round(6 + Math.random() * 12),
        Productos_Financieros_Activos: Math.round(1 + Math.random() * 2),
        Score_Crediticio: Math.round(540 + Math.random() * 110),
        Canal_Digital_Uso_Pct: +(30 + Math.random() * 40).toFixed(1),
        Tasa_Mora_Historica_Pct: +(3.5 + Math.random() * 5.0).toFixed(1),
        Antiguedad_Anios: Math.round(1 + Math.random() * 8),
      });
    }
  }

  return records.sort(() => Math.random() - 0.5);
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'retail_ecommerce',
    title: 'Retail & E-commerce Omnicanal (500 Clientes)',
    sector: 'Comercio Minorista / E-Commerce',
    description: 'Comportamiento RFM, ticket medio, devoluciones y satisfacción de clientes de venta omnicanal.',
    context: {
      sector: 'Retail & E-Commerce Omnicanal',
      objective: 'Maximizar el valor de vida del cliente (CLV), fidelizar campeones y reactivar clientes en riesgo',
      analysisUnit: 'Cliente Individual (B2C)',
      clientIdColumn: 'ID_Cliente',
      period: 'Últimos 12 meses',
    },
    data: generateRetailDataset(),
  },
  {
    id: 'b2b_saas',
    title: 'B2B SaaS y Cuentas Corporativas (330 Cuentas)',
    sector: 'Software & Tecnología B2B',
    description: 'Métricas de suscripción recurrente (MRR), adopción de software, soporte y riesgo de deserción.',
    context: {
      sector: 'SaaS B2B Empresarial',
      objective: 'Prevenir la pérdida de cuentas (Churn prevention), identificar cuentas con potencial de expansión de licencias',
      analysisUnit: 'Cuenta Corporativa (B2B)',
      clientIdColumn: 'Empresa_ID',
      period: 'Año fiscal en curso',
    },
    data: generateB2BDataset(),
  },
  {
    id: 'banking_finance',
    title: 'Banca y Servicios Financieros (350 Clientes)',
    sector: 'Servicios Financieros & Banca',
    description: 'Saldos bancarios, transaccionalidad, productos cruzados, score de crédito y digitalización.',
    context: {
      sector: 'Banca y Gestión Patrimonial',
      objective: 'Personalización de cartera, incremento de tenencia de productos (cross-selling) y control de riesgo',
      analysisUnit: 'Titular de Cuenta Bancaria',
      clientIdColumn: 'Cliente_ID',
      period: 'Promedio semestral',
    },
    data: generateBankingDataset(),
  },
];
