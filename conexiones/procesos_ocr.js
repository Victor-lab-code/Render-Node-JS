// procesos_ocr.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de tener configurada la conexión a la base de datos
const axios = require('axios');
const cohere = require('cohere-ai')


const COHERE_API_KEY = process.env.COHERE_API_KEY; // Usar variable de entorno
const COHERE_GENERATE_URL = 'https://api.cohere.ai/v1/generate';

router.post('/chatbot', async (req, res) => {
  const { textoDocumento, pregunta } = req.body;

  console.log('Datos recibidos en /chatbot:', { textoDocumento, pregunta });

  if (!textoDocumento || !pregunta) {
    return res.status(400).json({ error: 'Texto del documento y pregunta son requeridos' });
  }

  try {
    // Construir el prompt usando directamente el texto enviado desde Flutter
const prompt = `
El siguiente texto está en español:
${textoDocumento}

Por favor, responde la siguiente pregunta en español:
Pregunta: ${pregunta}

Respuesta:
`;

    console.log('Prompt enviado a Cohere:', prompt);

    // Enviar el prompt a la API de Cohere
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command-medium-nightly', // Cambiar al modelo disponible
        prompt: prompt,
        max_tokens: 500, // Reservar tokens para la respuesta generada
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const respuesta = response.data.generations[0]?.text.trim();
    console.log('Respuesta de Cohere:', respuesta);

    res.status(200).json({ respuesta });
  } catch (error) {
    console.error('Error al comunicarse con Cohere:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al obtener respuesta del chatbot',
      detalles: error.response?.data || error.message,
    });
  }
});









// Ruta para guardar el resultado OCR
router.post('/guardar-ocr', async (req, res) => {
  const { documento_id, resultado_ocr } = req.body;

  try {
    const query = `
      INSERT INTO procesos_ocr (documento_id, estado, resultado_ocr, fecha_proceso)
      VALUES ($1, 'procesado', $2, NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [documento_id, resultado_ocr]);

    res.status(201).json({
      success: true,
      message: 'OCR guardado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar OCR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar OCR',
      error: error.message,
    });
  }
});

// Ruta para verificar si ya existe un resultado OCR para un documento
router.get('/:documentoId', async (req, res) => {
  const { documentoId } = req.params;

  try {
    const query = `
      SELECT resultado_ocr FROM procesos_ocr WHERE documento_id = $1;
    `;

    const result = await pool.query(query, [documentoId]);

    if (result.rowCount === 0) {
      // Si no se encuentra un resultado, responde con un 404
      return res.status(404).json({
        success: false,
        message: 'No se encontró un resultado OCR para este documento',
      });
    }

    // Si se encuentra un resultado, responde con el OCR guardado
    res.status(200).json({
      success: true,
      data: result.rows[0].resultado_ocr,
    });
  } catch (error) {
    console.error('Error al verificar el OCR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el OCR',
      error: error.message,
    });
  }
});

router.get('/ver/:documento_id', async (req, res) => {
  const { documento_id } = req.params;
  console.log(`ID recibido en el backend: '${documento_id}'`); // Log para depurar

  try {
    const result = await pool.query(
      'SELECT resultado_ocr FROM procesos_ocr WHERE documento_id = $1',
      [documento_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No se encontró un resultado OCR para este documento' });
    }

    res.status(200).json({ resultado_ocr: result.rows[0].resultado_ocr });
  } catch (error) {
    console.error('Error al obtener el resultado OCR:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/', (req, res) => {
  res.send('Ruta /procesos_ocr funcionando correctamente');
});


module.exports = router;
