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

module.exports = router;
