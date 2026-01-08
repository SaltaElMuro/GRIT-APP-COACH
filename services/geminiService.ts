/// <reference types="vite/client" />
/* CÓDIGO FINAL - MODELO FLASH (NUEVA LLAVE)
   Este código usa gemini-1.5-flash, que funcionará perfecto
   con tu nueva llave limpia. Es la versión más rápida.
*/
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClassType, WorkoutRequest } from "../types";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// --- TU LÓGICA ORIGINAL ---
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
  if (!API_KEY) return "Error: Falta la API KEY de Google. Revisa Vercel.";
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // CAMBIO FINAL: Con la llave nueva, usamos FLASH (Mejor y más rápido)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const targetDateObj = request.date ? new Date(request.date) : new Date();
  
  // Contexto de Fecha y Ciclo
  const currentMonth = targetDateObj.toLocaleString('es-ES', { month: 'long' });
  const cycleInfo = request.cycleContext 
    ? `CICLO ACTUAL: ${request.cycleContext.name} (Semana ${request.cycleContext.currentWeek}/${request.cycleContext.totalWeeks}). Objetivo: ${request.cycleContext.goal}` 
    : 'Fase: Mantenimiento General';

  // Contexto de Fatiga / Historial
  let fatigueContext = "No hay datos recientes.";
  if (request.recentHistory && request.recentHistory.length > 0) {
    const lastWorkouts = request.recentHistory.slice(0, 3).map(w => 
      `- ${w.date} (${w.type}): Analiza este entreno anterior para NO repetir patrones musculares hoy.`
    ).join('\n');
    fatigueContext = `HISTORIAL RECIENTE (IMPORTANTE - EVITAR REPETICIÓN MUSCULAR):\n${lastWorkouts}`;
  }

  // Contexto de Material
  const equipStr = request.equipmentContext?.map(e => `${e.name} (${e.quantity} uds)`).join(', ') || 'Material Estándar';

  // INYECTAMOS TU SISTEMA DENTRO DEL PROMPT
  const prompt = `
    INSTRUCCIONES DEL SISTEMA (TU ROL):
    ${SYSTEM_INSTRUCTION}

    ---------------------------------------------------
    
    TAREA: PROGRAMA EL ENTRENAMIENTO PARA: ${targetDateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error en Gemini:", error);
    return `Hubo un error conectando con la IA: ${error.message}`;
  }
};

export const generateSessionImage = async (workoutText: string): Promise<string | null> => {
  return null;
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string) => {
  if (!API_KEY) return "Error: API Key no encontrada.";
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  // Usamos también FLASH aquí
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const chat = model.startChat({
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  });

  try {
    const messageWithContext = `(Rol: Head Coach Bormujos Lab) ${newMessage}`;
    const result = await chat.sendMessage(messageWithContext);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Error de conexión en el chat.";
  }
};
