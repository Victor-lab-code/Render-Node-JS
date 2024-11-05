// procesos_ocr.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de tener configurada la conexión a la base de datos

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

  try {
    // Consulta para obtener el resultado OCR del documento específico
    const result = await pool.query(
      'SELECT resultado_ocr FROM procesos_ocr WHERE documento_id = $1',
      [documento_id]
    );

    if (result.rowCount === 0) {
      // Si no se encuentra el OCR, responder con un error 404
      return res.status(404).json({ error: 'No se encontró un resultado OCR para este documento' });
    }

    // Enviar el texto OCR encontrado
    res.status(200).json({ resultado_ocr: result.rows[0].resultado_ocr });
  } catch (error) {
    console.error('Error al obtener el resultado OCR:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
