import { BusinessContext, ClusteringResult, ClusterProfile, DifferentiatingFeature, StrategicMatrixRow } from '../types';

const CLUSTER_COLORS = [
  '#2563eb', // Royal Blue
  '#0d9488', // Teal
  '#e11d48', // Rose / Red
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f97316', // Orange
];

export function buildClusterProfiles(
  rawData: Record<string, any>[],
  result: ClusteringResult,
  _context?: BusinessContext
): ClusterProfile[] {
  const n = rawData.length;
  const features = result.features;
  const profiles: ClusterProfile[] = [];

  // Compute global means and stdDevs
  const globalMeans: Record<string, number> = {};
  const globalStds: Record<string, number> = {};

  for (const f of features) {
    const vals = rawData.map((r) => Number(r[f]) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    const m = sum / n;
    globalMeans[f] = m;
    const v = vals.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (n - 1 || 1);
    globalStds[f] = Math.sqrt(v) || 1;
  }

  // Iterate over each cluster
  for (let c = 0; c < result.k; c++) {
    const clusterRows = rawData.filter((_, idx) => result.clusterAssignments[idx] === c);
    const size = clusterRows.length;
    const percentage = result.clusterPercentages[c] || 0;

    const means: Record<string, number> = {};
    const medians: Record<string, number> = {};
    const diffFeatures: DifferentiatingFeature[] = [];

    for (const f of features) {
      const vals = clusterRows.map((r) => Number(r[f]) || 0).sort((a, b) => a - b);
      if (vals.length > 0) {
        const sum = vals.reduce((a, b) => a + b, 0);
        const mean = sum / vals.length;
        const mid = Math.floor(vals.length / 2);
        const median = vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];

        means[f] = +mean.toFixed(2);
        medians[f] = +median.toFixed(2);

        const gMean = globalMeans[f];
        const gStd = globalStds[f];
        const zScore = +((mean - gMean) / gStd).toFixed(2);
        const diffPercent = gMean !== 0 ? +(((mean - gMean) / Math.abs(gMean)) * 100).toFixed(1) : 0;

        diffFeatures.push({
          feature: f,
          clusterMean: +mean.toFixed(2),
          globalMean: +gMean.toFixed(2),
          zScore,
          relativeDifferencePercent: diffPercent,
          direction: zScore >= 0 ? 'higher' : 'lower',
        });
      } else {
        means[f] = 0;
        medians[f] = 0;
      }
    }

    // Sort differentiating features by magnitude of z-score
    diffFeatures.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

    // Dynamic commercial name derived from actual data differentiators
    const topHigh = diffFeatures.filter((d) => d.zScore > 0.4);
    const topLow = diffFeatures.filter((d) => d.zScore < -0.4);

    let commercialName = `Segmento ${c + 1}`;
    let behaviorDesc = '';
    const opportunities: string[] = [];
    const risks: string[] = [];

    // Analyze high/low key drivers
    const hasHighSpend = topHigh.some((d) => /monto|gasto|mrr|saldo|ingreso|revenue/i.test(d.feature));
    const hasLowSpend = topLow.some((d) => /monto|gasto|mrr|saldo|ingreso|revenue/i.test(d.feature));
    const hasHighFreq = topHigh.some((d) => /frecuencia|transaccion|licencia|uso|actividad/i.test(d.feature));
    const hasHighRecency = topHigh.some((d) => /recencia|dias_sin|inactividad/i.test(d.feature));
    const hasHighChurnRisk = topHigh.some((d) => /riesgo|churn|mora|reclamo|ticket_soporte/i.test(d.feature));
    const hasHighSatisfaction = topHigh.some((d) => /csat|nps|satisfaccion/i.test(d.feature));

    if (hasHighSpend && (hasHighFreq || hasHighSatisfaction)) {
      commercialName = 'Champions VIP de Alto Impacto';
      behaviorDesc = 'Clientes con desembolso económico significativamente superior a la media, frecuencia constante y excelente satisfacción.';
      opportunities.push('Programas de fidelización de acceso exclusivo (concierge, early access).');
      opportunities.push('Co-creación y ventas cruzadas de productos premium con alto margen.');
      risks.push('Sensibilidad al deterioro del servicio o cambios abruptos de condiciones comerciales.');
    } else if (hasHighRecency || hasHighChurnRisk) {
      commercialName = 'En Riesgo de Deserción / Reactivación Urgente';
      behaviorDesc = 'Registran un lapso prolongado sin actividad o elevadas fricciones en soporte/reclamos a pesar de un historial previo.';
      opportunities.push('Campañas de retención directa con incentivos específicos.');
      opportunities.push('Auditoría proactiva de satisfacción de clientes con ejecutivos de cuenta dedicados.');
      risks.push('Pérdida inminente de clientes con erosión irreversible del valor histórico acumulado.');
    } else if (hasLowSpend && hasHighFreq) {
      commercialName = 'Operativos Frecuentes de Ticket Eficiente';
      behaviorDesc = 'Alta interacción recurrente pero con canasta o ticket promedio concentrado en líneas económicas.';
      opportunities.push('Estrategias de bundling, cross-selling y promociones de volumen por escala.');
      opportunities.push('Campañas de incentivo para elevar el ticket promedio.');
      risks.push('Bajo margen operativo si los costos de transacción unitarios son elevados.');
    } else if (hasHighSpend && !hasHighFreq) {
      commercialName = 'Compradores Selectos de Alto Ticket';
      behaviorDesc = 'Transacciones esporádicas de gran volumen económico.';
      opportunities.push('Ciclos de remarketing estacional y promociones programadas.');
      risks.push('Irregularidad en el flujo de caja debido a compras no recurrentes.');
    } else if (hasLowSpend) {
      commercialName = 'Clientes Ocasionales de Transaccionalidad Básica';
      behaviorDesc = 'Volumen y frecuencia por debajo del promedio poblacional.';
      opportunities.push('Automatización 100% digital autoservicio para minimizar costos de atención.');
      opportunities.push('Drip marketing educativo para descubrir nuevos módulos o productos.');
      risks.push('Alta tasa de abandono pasivo sin aviso.');
    } else {
      commercialName = `Grupo Estratégico ${c + 1}: ${topHigh[0]?.feature || 'Balanceado'}`;
      behaviorDesc = `Clientes con perfil balanceado con predominancia en ${topHigh[0]?.feature || 'indicadores intermedios'}.`;
      opportunities.push('Evolución hacia segmentos superiores mediante nutrición de cartera.');
      risks.push('Estancamiento si no se definen ofertas focalizadas.');
    }

    profiles.push({
      clusterId: c,
      name: commercialName,
      color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
      size,
      percentage,
      means,
      medians,
      differentiatingFeatures: diffFeatures,
      behaviorDescription: behaviorDesc,
      opportunities,
      risks,
      priorityRank: c + 1,
    });
  }

  // Sort profiles by economic priority or size
  return profiles;
}

export function generateStrategicMatrix(profiles: ClusterProfile[]): StrategicMatrixRow[] {
  return profiles.map((p) => {
    const topFeatures = p.differentiatingFeatures.slice(0, 3).map(
      (d) => `${d.feature} (${d.direction === 'higher' ? '+' : ''}${d.relativeDifferencePercent}%)`
    ).join(', ');

    return {
      clusterId: p.clusterId,
      clusterName: p.name,
      color: p.color,
      size: p.size,
      percentage: p.percentage,
      profile: `${p.behaviorDescription} Diferenciadores clave: ${topFeatures}.`,
      economicValue: p.name.includes('Champions') || p.name.includes('Alto')
        ? 'Máximo valor presente y margen contributivo clave de la organización.'
        : p.name.includes('Riesgo')
        ? 'Alto valor histórico en peligro de erosión y pérdida de cuota.'
        : 'Valor moderado con potencial de escalamiento de ticket y margen unitario.',
      churnRisk: p.name.includes('Riesgo')
        ? 'Crítico (Muy Alto): Requiere intervención dentro de los próximos 7 a 14 días.'
        : p.name.includes('Champions')
        ? 'Bajo a Medio: Vulnerable únicamente ante fallas graves en calidad o atención.'
        : 'Moderado: Abandono pasivo hacia competidores con mejores promociones.',
      opportunity: p.opportunities.join(' ') || 'Desarrollar mayor profundidad en el catálogo de productos.',
      marketingAction: p.name.includes('Champions')
        ? 'Comunicaciones exclusivas, personalizadas, sin saturación comercial; invitaciones a eventos VIP.'
        : p.name.includes('Riesgo')
        ? 'Campañas de win-back hiperdirigidas, encuestas de diagnóstico con incentivo de reactivación.'
        : 'Campañas omnicanal con llamados a la acción claros y bundles con beneficios de precio.',
      retentionAction: p.name.includes('Champions')
        ? 'Gestor de cuenta VIP asignado, SLA prioritario de soporte y programa de lealtad por puntos premium.'
        : p.name.includes('Riesgo')
        ? 'Llamada de retención personalizada o resolución de fricciones técnicas de inmediato.'
        : 'Nurturing automatizado por email / app con recordatorios de reposición o nuevo contenido.',
      growthStrategy: p.name.includes('Champions')
        ? 'Up-selling a contratos anuales de largo plazo y planes de licenciamiento corporativo.'
        : 'Cross-selling modular paso a paso para consolidar hábitos de uso continuos.',
      recommendedKpis: [
        'Customer Lifetime Value (CLV)',
        'Tasa de Retención a 90 días',
        'Net Promoter Score (NPS)',
        'Ticket Promedio / ARPU',
      ],
    };
  });
}
