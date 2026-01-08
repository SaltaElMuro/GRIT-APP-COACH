/// <reference types="vite/client" />
/* USAMOS EL MODELO ESTÁNDAR (GEMINI-PRO 1.0)
   Este modelo funciona en todas las regiones y cuentas gratuitas sin dar error 404.
*/
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClassType, WorkoutRequest } from "../types";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// INSTRUCCIONES DEL ENTRENADOR
const SYSTEM_INSTRUCTION = `
Eres el Head Coach y Programador de "BORMUJOS FUNCTIONAL LAB".
Tu objetivo es diseñar la clase perfecta: Rentable, Divertida, Segura y Estética.

**1. IDENTIDAD: NO SOMOS CROSSFIT**
   - **Prohibido:** Snatch (Arrancada), Overhead Squats, Jerks técnicos, Muscle-ups.
   - **La Barra Olímpica:** Es una herramienta de FUERZA.
     - *Permitido:* Back/Front Squat, Deadlift, Press (Strict/Push), Remo.
   - **Enfoque:** "Functional Bodybuilding". Fuerte, estético y sano.

**2. LOGÍSTICA INTELIGENTE (LA REGLA DEL 12)**
   - Tienes 12 clientes.
   - **ESTRUCTURA:** Usa Circuitos/Estaciones.
     - Estación A: Fuerza
     - Estación B: Cardio
     - Estación C: Accesorios

**3. INTELIGENCIA DE PROGRAMACIÓN**
   - **Contexto:** Si ayer hubo pierna, hoy no repitas pierna pesada.
   - **Variabilidad:** Usa EMOMs, AMRAPs, For Quality.

**SALIDA (MARKDOWN):**
1. **Concepto:** Título.
2. **Warm-Up:** 8-10 min.
3. **Bloque Principal:** Estaciones, tiempos, rotaciones.
4. **Estímulo:** Qué trabajamos.
5. **Adaptaciones:** Scaling.
`;

export const generateWorkout = async (request: WorkoutRequest): Promise<string> => {
  if (!API_KEY) return "Error: Falta la API KEY. Revisa la configuración en Vercel.";

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // CAMBIO CRUCIAL: Usamos "gemini-pro" (versión estable global)
  // No le pasamos systemInstruction aquí para evitar errores de compatibilidad en v1.0
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const targetDateObj = request.date ? new Date(request.date) : new Date();
  
  const cycleInfo = request.cycleContext 
    ? `CICLO: ${request.cycleContext.name} (Semana ${request.cycleContext.currentWeek}).` 
    : 'Fase: Mantenimiento';

  let fatigueContext = "Sin datos previos.";
  if (request.recentHistory?.length) {
    fatigueContext = "EVITAR REPETIR: " + request.recentHistory.slice(0, 3).map(w => w.type).join(', ');
  }

  const equipStr = request.equipmentContext?.map(e => `${e.name} (${e.quantity})`).join(', ') || 'Material Estándar';

  // Inyectamos las instrucciones DENTRO del prompt para asegurar que el modelo las lea
  const prompt = `
    INSTRUCCIONES DEL SISTEMA:
    ${SYSTEM_INSTRUCTION}

    ---
    TAREA: PROGRAMAR ENTRENAMIENTO
    FECHA: ${targetDateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
    TIPO: ${request.type}
    
    CONTEXTO:
    1. ${cycleInfo}
    2. FOCO: ${request.focus || 'Equilibrado y divertido'}
    3. LOGÍSTICA: 12 Personas.
    4. HISTORIAL: ${fatigueContext}
    5. MATERIAL: ${equipStr}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generando entreno:", error);
    return "Hubo un error al conectar con Gemini. Intenta de nuevo en unos segundos.";
  }
};

export const generateSessionImage = async (workoutText: string): Promise<string | null> => {
  return null;
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string) => {
  if (!API_KEY) return "Error: API Key faltante.";
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  // También aquí usamos gemini-pro
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  });

  try {
    // Le recordamos quién es en cada mensaje para que no pierda el personaje
    const msg = `Actúa como Head Coach de Bormujos Lab. ${newMessage}`;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error chat:", error);
    return "Error de conexión.";
  }
};
