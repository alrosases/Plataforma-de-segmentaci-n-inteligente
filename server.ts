import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Strategic Chat with SEGMENTA360 AI Consultant
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada en las variables de entorno. Consulta la configuración en Settings > Secrets.',
      });
    }

    const systemInstruction = `Eres "SEGMENTA360 AI – Consultor Estratégico de Clientes", un equipo multidisciplinario de científicos de datos, expertos en analítica de clientes y consultores de dirección estratégica (McKinsey / BCG / Bain style).
Tu misión es transformar los hallazgos estadísticos de segmentación en decisiones empresariales accionables y precisas.

REGLAS DE ORO OBLIGATORIAS:
1. Utiliza exclusivamente las cifras, centroides, distribuciones y variables provistas en el contexto. NUNCA inventes números ni alteres los resultados estadísticos reales.
2. Si un indicador no está presente en los datos (por ejemplo, margen exacto, LTV o probabilidad de churn), declara expresamente la limitación y formula una hipótesis comercial justificada.
3. Distingue claramente en tus explicaciones entre:
   - HECHOS Y RESULTADOS OBSERVADOS (evidencia estadística comprobada en la base).
   - INTERPRETACIÓN ESTADÍSTICA (significado de distancias, silueta, varianza explicada).
   - HIPÓTESIS COMERCIALES (lectura de negocio razonable).
   - RECOMENDACIONES ESTRATÉGICAS Y ACCIONES (iniciativas accionables, de marketing, retención y cross-selling).
   - KPIS DE SEGUIMIENTO (métricas para medir el éxito).
4. No confundas correlación con causalidad.
5. Emplea un tono profesional, ejecutivo, riguroso y conciso con formato Markdown estructurado (negritas, viñetas, tablas breves si aplica).
6. Responde siempre en español.`;

    const contextPrompt = context
      ? `CONTEXTO DE DATOS Y RESULTADOS DE SEGMENTACIÓN ACTUALES:
- Dataset: ${context.datasetName || 'Base de Clientes'}
- Total de clientes: ${context.totalRows}
- Variables analizadas: ${context.features?.join(', ') || 'N/A'}
- Modelo utilizado: ${context.modelName || 'No especificado'} (K = ${context.k || 'N/A'})
- Índice de Silueta Global: ${context.silhouetteScore != null ? context.silhouetteScore.toFixed(3) : 'N/A'}
- Varianza explicada PCA (PC1+PC2): ${context.pcaExplainedVariance ? context.pcaExplainedVariance.toFixed(1) + '%' : 'N/A'}
- Resumen de Segmentos:
${JSON.stringify(context.clusterSummaries || [], null, 2)}
`
      : 'No se ha cargado contexto previo de segmentación aún.';

    const chatHistory = Array.isArray(messages) ? messages : [];
    const lastUserMessage = chatHistory[chatHistory.length - 1]?.content || 'Por favor analiza los segmentos.';

    // Construct prompt with full historical context
    const fullPrompt = `${contextPrompt}

HISTORIAL DE CONVERSACIÓN:
${chatHistory.slice(0, -1).map((m: { role: string; content: string }) => `${m.role === 'user' ? 'USUARIO' : 'SEGMENTA360 AI'}: ${m.content}`).join('\n')}

PREGUNTA / SOLICITUD ACTUAL DEL USUARIO:
${lastUserMessage}`;

    let responseText = '';
    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            systemInstruction,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (genErr: any) {
        console.warn(`Attempt with ${modelName} returned error, trying fallback if available:`, genErr?.message);
      }
    }

    if (!responseText) {
      throw new Error('No se pudo obtener respuesta de los modelos de Gemini.');
    }

    return res.json({
      text: responseText,
    });
  } catch (error: any) {
    console.error('Error calling Gemini in /api/gemini/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Error al comunicarse con Google Gemini API.',
    });
  }
});

// Deep Strategic Diagnosis & Matrix Generation
app.post('/api/gemini/strategic-analysis', async (req: Request, res: Response) => {
  try {
    const { datasetSummary, modelResults, businessGoals } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no disponible en el servidor.',
      });
    }

    const prompt = `Analiza detalladamente este modelo de segmentación de clientes y genera un informe de consultoría estratégica ejecutiva de alto nivel:

INFORMACIÓN DEL NEGOCIO:
- Sector: ${businessGoals?.sector || 'Comercial'}
- Objetivo: ${businessGoals?.objective || 'Optimización de valor y retención'}
- Unidad de análisis: ${businessGoals?.unit || 'Cliente'}

DATOS Y MÉTRICAS DEL MODELO:
- Modelo: ${modelResults.algorithm} (K=${modelResults.k})
- Silueta global: ${modelResults.silhouette != null ? Number(modelResults.silhouette).toFixed(3) : 'N/A'}
- Clientes totales: ${datasetSummary.rowCount}
- Variables del modelo: ${modelResults.features?.join(', ')}

PERFILES DE CADA SEGMENTO:
${JSON.stringify(modelResults.profiles, null, 2)}

Por favor genera:
1. Resumen ejecutivo del hallazgo principal.
2. Identificación del segmento de mayor valor inmediato y del segmento con mayor riesgo de abandono.
3. Recomendaciones prioritarias de acción comercial para cada segmento (Marketing, Fidelización, Oferta de producto).
4. Roadmap de implementación en 3 horizontes (Corto plazo: 30 días, Mediano plazo: 90 días, Largo plazo: 180 días).
5. Cuadro de mando de KPIs recomendados para dar seguimiento a cada grupo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres el Director de Estrategia Analítica de SEGMENTA360. Genera un análisis ejecutivo riguroso, directo, basado en datos cuantitativos y altamente accionable.',
      },
    });

    return res.json({
      analysis: response.text,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/strategic-analysis:', error);
    return res.status(500).json({
      error: error?.message || 'Error al generar análisis estratégico con Gemini.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SEGMENTA360 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
