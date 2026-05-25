module.exports = async (req, res) => {
  // 1. Configurar cabeceras para que el HTML pueda comunicarse sin bloqueos (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si es una petición de control (OPTIONS), respondemos OK de inmediato
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'La API Key de Gemini no está configurada en Vercel' });
    }

    // 2. Llamada directa por HTTP nativo al modelo Gemini 1.5 Flash (el estándar actual)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const respuestaGoogle = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const datos = await respuestaGoogle.json();
    
    if (!respuestaGoogle.ok) {
      return res.status(respuestaGoogle.status).json({ error: datos.error?.message || 'Error en la API de Google' });
    }

    // 3. Extraer el texto devuelto por la IA
    const textoIA = datos.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta de la IA';
    
    // 4. Enviar la respuesta de vuelta a tu editor
    return res.status(200).json({ resultado: textoIA });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor Vercel: ' + error.message });
  }
};
