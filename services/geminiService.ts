/// <reference types="vite/client" />
/* CÓDIGO DE DIAGNÓSTICO CON ALERTAS */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WorkoutRequest, ChatMessage } from "../types";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// INSTRUCCIONES
const SYSTEM_INSTRUCTION = `Eres un entrenador de CrossTraining funcional.`;

export const generateWorkout = async (request: WorkoutRequest): Promise<string> => {
  // 1. CHEQUEO DE LLAVE
  if (!API_KEY) {
    alert("❌ ERROR GRAVE: No detecto la API KEY. Revisa las Variables de Entorno en Vercel.");
    return "Error de configuración.";
  }

  try {
    // 2. AVISO DE INICIO
    // alert("✅ Llave detectada. Iniciando conexión con Google..."); 
    // (Comentado para no molestar, descomenta si quieres ver si llega aquí)

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Usamos el modelo más básico para asegurar compatibilidad
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Genera un entrenamiento de CrossTraining funcional para hoy.
      Objetivo: ${request.focus || 'General'}
      Duración: 60 min.
      Formato: Markdown.
    `;

    // 3. INTENTO DE GENERACIÓN
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error: any) {
    // 4. EL CHIVATO: AQUÍ SALDRÁ EL ERROR REAL
    alert(`💀 ERROR DE IA:\n\n${error.toString()}\n\nMensaje detallado: ${error.message}`);
    console.error(error);
    return "Hubo un error. MIRA LA ALERTA EN PANTALLA.";
  }
};

// Funciones auxiliares simplificadas para que no den error
export const generateSessionImage = async () => null;
export const sendChatMessage = async (history: ChatMessage[], msg: string) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    try {
        const result = await model.generateContent(msg);
        return (await result.response).text();
    } catch (e) { return "Error"; }
};
