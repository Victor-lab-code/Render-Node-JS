const express = require('express');
const pool = require('../db'); // Importa la conexión a la base de datos
const cohere = require('cohere-ai');
const axios = require('axios');

const router = express.Router(); // Define el router

// Configura la clave API de Cohere desde las variables de entorno
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Función para obtener un resumen utilizando Cohere en español
// Función para obtener un resumen en español utilizando Cohere
async function obtenerResumen(texto) {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/summarize',
      {
        text: `Por favor, genera un resumen en español exclusivamente del siguiente texto, el cual también está en español. Asegúrate de no utilizar inglés u otro idioma:\n\n${texto}`,
       // text: `Genera un resumen en idioma español del siguiente texto (en español, no uses inglés): ${texto}`,
        length: "medium" // Cambia a "short", "medium" o "long" según lo que necesites
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Retorna el resumen generado
    return response.data.summary;
  } catch (error) {
    console.error('Error al obtener el resumen:', error);
    throw new Error('No se pudo generar el resumen');
  }
}

// Ruta para obtener todos los resúmenes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resumenes');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener resúmenes:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para generar el resumen en español
router.post('/generar', async (req, res) => {
  const { documento_id } = req.body;

  try {
    // Obtener el texto OCR almacenado en la base de datos
    const ocrResult = await pool.query(
      'SELECT resultado_ocr FROM procesos_ocr WHERE documento_id = $1',
      [documento_id]
    );

    if (ocrResult.rowCount === 0) {
      return res.status(404).json({ error: 'Documento no encontrado o sin OCR procesado' });
    }

    const textoOCR = ocrResult.rows[0].resultado_ocr;

    // Solicitar el resumen a Cohere
    const resumen = await obtenerResumen(textoOCR);

    // Guardar el resumen en la base de datos
    const result = await pool.query(
      'INSERT INTO resumenes (documento_id, resumen, fecha_resumen) VALUES ($1, $2, NOW()) RETURNING *',
      [documento_id, resumen]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al generar el resumen:', error);
    res.status(500).json({
      error: 'Error al generar el resumen',
      detalles: error.message,
    });
  }
});

// Ruta para agregar un resumen manualmente
router.post('/', async (req, res) => {
  const { documento_id, resumen } = req.body;

  console.log('Datos recibidos:', { documento_id, resumen });

  try {
    if (!documento_id || !resumen) {
      return res.status(400).send('documento_id y resumen son requeridos');
    }

    const result = await pool.query(
      'INSERT INTO resumenes (documento_id, resumen, fecha_resumen) VALUES ($1, $2, NOW()) RETURNING *',
      [documento_id, resumen]
    );

    console.log('Resumen agregado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar resumen:', err);
    res.status(500).send(`Error en el servidor: ${err.message}`);
  }
});

// Ruta para eliminar un resumen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM resumenes WHERE id = $1', [id]);
    res.status(200).send('Resumen eliminado');
  } catch (err) {
    console.error('Error al eliminar resumen:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exporta el router
