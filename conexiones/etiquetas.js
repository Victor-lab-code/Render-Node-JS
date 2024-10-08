const express = require('express');
const pool = require('../db'); // Asegúrate de tener configurada la conexión a tu base de datos
const router = express.Router(); // Define el router para manejar las rutas

// Obtener todas las etiquetas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM etiquetas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las etiquetas:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar una nueva etiqueta
router.post('/', async (req, res) => {
  const { documento_id, etiqueta } = req.body;
  
  // Log para verificar los datos recibidos
  console.log('Datos recibidos:', { documento_id, etiqueta });
  
  try {
    if (!documento_id || !etiqueta) {
      return res.status(400).send('El documento_id y la etiqueta son requeridos');
    }

    const result = await pool.query(
      'INSERT INTO etiquetas (documento_id, etiqueta, fecha_etiqueta) VALUES ($1, $2, NOW()) RETURNING *',
      [documento_id, etiqueta]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar etiqueta:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Eliminar una etiqueta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM etiquetas WHERE id = $1', [id]);
    res.status(200).send('Etiqueta eliminada');
  } catch (err) {
    console.error('Error al eliminar etiqueta:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exporta el router
