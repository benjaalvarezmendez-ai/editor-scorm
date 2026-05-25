export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Falta el prompt' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key no configurada' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const respuestaGoogle = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const datos = await respuestaGoogle.json();
    
    // Extracción ultra-segura del texto de la IA (revisa múltiples rutas posibles)
    let textoIA = "";
    if (datos.candidates?.[0]?.content?.parts?.[0]?.text) {
        textoIA = datos.candidates[0].content.parts[0].text;
    } else if (datos.content?.parts?.[0]?.text) {
        textoIA = datos.content.parts[0].text;
    } else if (typeof datos === 'string') {
        textoIA = datos;
    } else {
        // Si Google devuelve un error estructurado, lo capturamos aquí
        textoIA = JSON.stringify(datos);
    }

    return res.status(200).json({ resultado: textoIA });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
