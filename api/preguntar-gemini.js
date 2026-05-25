// api/preguntar-gemini.js
export default async function handler(req, res) {
  // 1. Permitir que tu HTML se conecte desde cualquier sitio (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Falta el texto del prompt' });
    }

    // 2. Comprobar que la clave de Google está configurada
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'La API Key de Gemini no está configurada en el servidor' });
    }

    // 3. Llamada oficial a la API de Google Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const respuestaGoogle = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const datos = await respuestaGoogle.json();
    
    if (!respuestaGoogle.ok) {
      return res.status(respuestaGoogle.status).json({ error: datos.error?.message || 'Error en Gemini' });
    }

    // 4. Extraer el texto limpio que nos devuelve la IA
    const textoIA = datos.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ resultado: textoIA });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno: ' + error.message });
  }
}
