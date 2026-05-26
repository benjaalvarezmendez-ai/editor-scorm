import { GoogleGenAI } from '@google/genai';

// Inicializamos la IA con la clave guardada en Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Solo permitimos peticiones POST (cuando el usuario envía el formulario)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { promptUsuario } = req.body;

    if (!promptUsuario) {
      return res.status(400).json({ error: 'Falta la petición del usuario' });
    }

    // Llamamos a la API de Gemini configurando el prompt oculto
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      config: {
        // PROMPT OCULTO: Aquí le damos el rol de experto en SCORM e-learning
        systemInstruction: `Eres un Ingeniero Instruccional experto en eLearning y SCORM. 
        Analiza las indicaciones del usuario y genera una propuesta de estructura de módulos en formato JSON. 
        Devuelve EXCLUSIVAMENTE el objeto JSON, sin textos de introducción ni bloques de código markdown (\`\`\`json).
        Esquema requerido:
        {
          "curso_titulo": "Título general del curso",
          "modulos": [
            {
              "modulo_id": 1,
              "modulo_titulo": "Título del Módulo",
              "objetivo_aprendizaje": "Al finalizar, el alumno...",
              "temas": ["Tema 1", "Tema 2"]
            }
          ]
        }`,
        responseMimeType: 'application/json', // Fuerza a Gemini a responder en JSON estructurado
        temperature: 0.3
      },
      contents: promptUsuario,
    });

    // Convertimos la respuesta de texto de Gemini a un objeto JSON real
    const estructuraCurso = JSON.parse(response.text);

    // Devolvemos el JSON limpio al frontend del editor
    return res.status(200).json(estructuraCurso);

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ error: 'Error al procesar la IA', detalle: error.message });
  }
}
