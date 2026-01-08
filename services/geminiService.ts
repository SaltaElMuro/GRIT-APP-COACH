/// <reference types="vite/client" />
/* USAMOS LA LIBRERÍA ESTÁNDAR (@google/generative-ai)
   Esta versión coincide con tu package.json y es la más estable.
*/
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClassType, WorkoutRequest } from "../types";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// INSTRUCCIONES DEL ENTRENADOR (SYSTEM PROMPT)
const SYSTEM_INSTRUCTION = `
Eres el Head Coach y Programador de "BORMUJOS FUNCTIONAL LAB".
Tu objetivo es diseñar la clase perfecta: Rentable, Divertida, Segura y Estética.

**1. IDENTIDAD: NO SOMOS CROSSFIT**
   - **Prohibido:** Snatch (Arrancada), Overhead Squats, Jerks técnicos, Muscle-ups, Handstand Walks.
   - **La Barra Olímpica:** Es una herramienta de FUERZA.
     - *Permitido:* Back/Front Squat, Deadlift, Press (Strict/Push), Remo.
     - *Excepcional:* Power Clean (sencillo).
   - **Enfoque:** "Functional Bodybuilding". Fuerte, estético y sano.

**2. LOGÍSTICA INTELIGENTE (LA REGLA DEL 12)**
   - Tienes 12 clientes.
   - **ESTRUCTURA:** Usa Circuitos/Estaciones para no colapsar el material.
     - Estación A: Fuerza
     - Estación B: Cardio
     - Estación C: Accesorios
   - Evita colas.

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

  // Inicializamos la IA Estándar
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Usamos el modelo FLASH que es rápido y estable
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION 
  });

  const targetDateObj = request.date ? new Date(request.date) : new Date();
  
  const cycleInfo = request.cycleContext 
    ? `CICLO: ${request.cycleContext.name} (Semana ${request.cycleContext.currentWeek}). Objetivo: ${request.cycleContext.goal}` 
    : 'Fase: Mantenimiento';

  let fatigueContext = "Sin datos previos.";
  if (request.recentHistory?.length) {
    fatigueContext = "EVITAR REPETIR: " + request.recentHistory.slice(0, 3).map(w => w.type).join(', ');
  }

  const equipStr = request.equipmentContext?.map(e => `${e.name} (${e.quantity})`).join(', ') || 'Material Estándar';

  const prompt = `
    PROGRAMAR PARA: ${targetDateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
    TIPO: ${request.type}
    
    CONTEXTO:
    1. ${cycleInfo}
    2. FOCO: ${request.focus || 'Equilibrado y divertido'}
    3. LOGÍSTICA: 12 Personas. Usa rotaciones si es necesario.
    4. HISTORIAL: ${fatigueContext}
    5. MATERIAL: ${equipStr}

    RECUERDA: Nada de movimientos complejos de Halterofilia. Prioriza Salud y Estética.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generando entreno:", error);
    return "Hubo un error al conectar con Gemini. Por favor intenta de nuevo en unos segundos.";
  }
};

export const generateSessionImage = async (workoutText: string): Promise<string | null> => {
  // Desactivamos temporalmente la imagen para asegurar estabilidad
  return null;
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string) => {
  if (!API_KEY) return "Error: API Key faltante.";
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Eres el Head Coach de Bormujos Lab. Responde directo, técnico y conciso."
  });

  const chat = model.startChat({
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  });

  try {
    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error chat:", error);
    return "Error de conexión.";
  }
};
