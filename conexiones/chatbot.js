const express = require('express');
const axios = require('axios'); // Para hacer solicitudes HTTP
const router = express.Router();

const COHERE_API_KEY = '8Dj2lrUnIY8bqQ7WrGVgjJ7gsIOISN7jiNctpDFi';
const COHERE_GENERATE_URL = 'https://api.cohere.ai/v1/generate';

// Endpoint para procesar preguntas del chatbot
router.post('/', async (req, res) => {

  const { textoDocumento, pregunta } = req.body;

  // Log para diagnosticar los datos que llegan al servidor
  console.log('Datos recibidos en /chatbot:', { textoDocumento, pregunta });

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

    console.log('Prompt enviado a Cohere:', prompt); // Log del prompt generado

    const response = await axios.post(
      COHERE_GENERATE_URL,
      {
        model: 'xlarge', // Cambia al modelo adecuado si "xlarge" no está disponible
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

    const respuesta = response.data.generations[0]?.text.trim();
    console.log('Respuesta de Cohere:', respuesta); // Log de la respuesta recibida
    res.json({ respuesta });
  } catch (error) {
    console.error('Error al comunicarse con Cohere:', error.message); // Log del error
    res.status(500).json({ error: 'Error al obtener respuesta del chatbot' });
  }
});

module.exports = router;
