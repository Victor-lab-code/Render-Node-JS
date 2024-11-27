const express = require('express');
const axios = require('axios'); // Para hacer solicitudes HTTP
const router = express.Router();

const COHERE_API_KEY = '8Dj2lrUnIY8bqQ7WrGVgjJ7gsIOISN7jiNctpDFi';
const COHERE_GENERATE_URL = 'https://api.cohere.ai/v1/generate';

// Endpoint para procesar preguntas del chatbot
router.post('/chatbot', async (req, res) => {
  const { textoDocumento, pregunta } = req.body;

  if (!textoDocumento || !pregunta) {
    return res.status(400).json({ error: 'Texto del documento y pregunta son requeridos' });
  }

  try {
    const prompt = `
Texto del documento:
${textoDocumento}

Pregunta del usuario:
${pregunta}

Respuesta basada en el texto:
`;

    const response = await axios.post(
      COHERE_GENERATE_URL,
      {
        model: 'xlarge', // Usa un modelo adecuado según tu suscripción
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
        stop_sequences: ["\n"],
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const respuesta = response.data.generations[0].text.trim();
    res.json({ respuesta });
  } catch (error) {
    console.error('Error al comunicarse con Cohere:', error);
    res.status(500).json({ error: 'Error al obtener respuesta del chatbot' });
  }
});

module.exports = router;
