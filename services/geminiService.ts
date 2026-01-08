
import { GoogleGenAI } from "@google/genai";
import { ClassType, WorkoutRequest } from "../types";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `
Eres el Head Coach y Programador de "BORMUJOS FUNCTIONAL LAB".
Tu objetivo es diseñar la clase perfecta: Rentable, Divertida, Segura y Estética.

**1. IDENTIDAD: NO SOMOS CROSSFIT**
   - **Prohibido:** Snatch (Arrancada), Overhead Squats, Jerks técnicos, Muscle-ups, Handstand Walks. No buscamos "Rendimiento Deportivo" a costa de la técnica.
   - **La Barra Olímpica:** Es una herramienta de FUERZA, no de cardio.
     - *Permitido:* Back/Front Squat, Deadlift (Peso Muerto), Press de Banca/Hombro (Strict/Push Press), Remo con barra.
     - *Excepcional:* Power Clean (Cargada de potencia) solo si es sencillo.
   - **Enfoque:** "Functional Bodybuilding". Queremos gente fuerte, con buena composición corporal y que se mueva bien. Mezcla la intensidad funcional con la estética del culturismo.

**2. LOGÍSTICA INTELIGENTE (LA REGLA DEL 12)**
   - Tienes 12 clientes y un espacio finito.
   - **ESTRUCTURA DE ROTACIONES:** No pongas a 12 personas a hacer lo mismo a la vez si requiere mucho material específico.
   - **Usa Estaciones:** Diseña circuitos. Ejemplo:
     - Estación A: Fuerza (Rack/Mancuernas pesadas)
     - Estación B: Cardio (Ergometros/Carrera/Comba)
     - Estación C: Accesorios/Core (Kettlebell/Bandas)
   - El entrenamiento debe fluir. Evita "cuellos de botella" donde la gente espera material.

**3. INTELIGENCIA DE PROGRAMACIÓN (VARIABILIDAD)**
   - **Analiza el contexto:** Si ayer hubo mucha Sentadilla, hoy NO programes pierna pesada. Si ayer hubo muchos empujes, hoy toca tracciones.
   - **No repetir estímulos:** No hagas siempre "For Time". Usa EMOMs (para controlar tiempos), AMRAPs (para intensidad individual) y TABATAs (para finishers).

**ESTRUCTURA DE SALIDA (MARKDOWN):**
1.  **Concepto del Día:** Título atractivo (ej: "Upper Body Pump & Run").
2.  **Warm-Up (Flujo):** 8-10 min. Movilidad específica para lo que viene después.
3.  **Bloque Principal (The Work):** Detalla claramente las estaciones, los tiempos de trabajo/descanso y las rotaciones.
4.  **Estímulo/Intención:** Explica brevemente qué músculo o sistema de energía estamos atacando.
5.  **Adaptaciones:** Opción para novatos (Scaling).
`;

export const generateWorkout = async (request: WorkoutRequest): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const targetDateObj = request.date ? new Date(request.date) : new Date();
  
  // Contexto de Fecha y Ciclo
  const currentMonth = targetDateObj.toLocaleString('es-ES', { month: 'long' });
  const annualPhase = request.annualContext?.phases.find(p => p.month.toLowerCase() === currentMonth.toLowerCase());
  const cycleInfo = request.cycleContext 
    ? `CICLO ACTUAL: ${request.cycleContext.name} (Semana ${request.cycleContext.currentWeek}/${request.cycleContext.totalWeeks}). Objetivo: ${request.cycleContext.goal}` 
    : 'Fase: Mantenimiento General';

  // Contexto de Fatiga / Historial (Inteligencia Muscular)
  let fatigueContext = "No hay datos recientes.";
  if (request.recentHistory && request.recentHistory.length > 0) {
    // Tomamos los últimos 3 entrenamientos para ver qué se ha trabajado
    const lastWorkouts = request.recentHistory.slice(0, 3).map(w => 
      `- ${w.date} (${w.type}): Analiza este entreno anterior para NO repetir patrones musculares hoy.`
    ).join('\n');
    fatigueContext = `HISTORIAL RECIENTE (IMPORTANTE - EVITAR REPETICIÓN MUSCULAR):\n${lastWorkouts}`;
  }

  // Contexto de Material
  const equipStr = request.equipmentContext?.map(e => `${e.name} (${e.quantity} uds)`).join(', ') || 'Material Estándar';

  const prompt = `
    PROGRAMA EL ENTRENAMIENTO PARA: ${targetDateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
    TIPO DE CLASE: ${request.type}
    
    INSTRUCCIONES CLAVE DE HOY:
    1. ${cycleInfo}
    2. FOCO/OBJETIVO DEL DÍA: ${request.focus || 'Diseña una sesión equilibrada y divertida.'}
    3. LOGÍSTICA: Tienes 12 personas. ${request.equipmentContext ? 'Usa el inventario disponible de forma inteligente (Circuitos/Rotaciones).' : ''}
    
    ${fatigueContext}
    
    INVENTARIO REAL DISPONIBLE:
    ${equipStr}

    RECUERDA: Nada de Crossfit complejo. Prioriza Salud, Estética y Diversión. Si usas barra, que sea básico (Squat/Deadlift/Press).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION, 
      temperature: 0.8, // Un poco menos de caos para asegurar estructura
      thinkingConfig: { thinkingBudget: 6000 } // Mayor presupuesto para pensar la logística de rotaciones
    },
  });

  return response.text || "Error generando la programación. Inténtalo de nuevo.";
};

export const generateSessionImage = async (workoutText: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Prompt visual actualizado: Gente real, funcional, no competición
  const prompt = `Professional fitness photography, modern functional training studio, group class using kettlebells and dumbbells, circuit training station, fit people but realistic bodies, warm lighting, dynamic action, gym interior design with industrial touches, yellow and black color palette, 8k resolution.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (e) {
    console.error("Poster generation failed", e);
  }
  return null;
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = [...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: newMessage }] }];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: { 
        systemInstruction: "Eres el Head Coach de Bormujos Lab. Tu estilo es directo, técnico pero accesible. Odias el riesgo innecesario en los ejercicios. Tu prioridad es que el cliente vuelva mañana (que no se lesione y se divierta). Responde conciso." 
    }
  });
  return response.text || "";
};
