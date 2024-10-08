const express = require('express');
const pool = require('../db'); // Importa la conexión a la base de datos
const router = express.Router(); // Define el router

// Obtener todos los procesos OCR
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM procesos_ocr');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Agregar un nuevo proceso OCR
router.post('/', async (req, res) => {
    const { documento_id, estado } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO procesos_ocr (documento_id, estado, fecha_proceso) VALUES ($1, $2, NOW()) RETURNING *',
        [documento_id, estado]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
     // console.error('Error al agregar proceso OCR:', err);
      //res.status(500).send('Error en el servidor');
    }
  });
  

// Eliminar un proceso OCR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM procesos_ocr WHERE id = $1', [id]);
    res.status(200).send('Proceso OCR eliminado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Actualizar un proceso OCR (opcional)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { estado, resultado_ocr } = req.body;
  try {
    const result = await pool.query(
      'UPDATE procesos_ocr SET estado = $1, resultado_ocr = $2, fecha_proceso = NOW() WHERE id = $3 RETURNING *',
      [estado, resultado_ocr, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router; // Exporta el router
