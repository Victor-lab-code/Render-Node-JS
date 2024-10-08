const express = require('express');
const pool = require('../db'); // Asegúrate de tener configurada la conexión a tu base de datos
const router = express.Router(); // Define el router para manejar las rutas

// Obtener todos los logs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los logs:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar un nuevo log
router.post('/', async (req, res) => {
  const { mensaje, nivel } = req.body;
  
  // Log para verificar los datos recibidos
  console.log('Datos recibidos:', { mensaje, nivel });
  
  try {
    if (!mensaje || !nivel) {
      return res.status(400).send('El mensaje y el nivel son requeridos');
    }

    const result = await pool.query(
      'INSERT INTO logs (mensaje, nivel, fecha_log) VALUES ($1, $2, NOW()) RETURNING *',
      [mensaje, nivel]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar log:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Eliminar un log
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM logs WHERE id = $1', [id]);
    res.status(200).send('Log eliminado');
  } catch (err) {
    console.error('Error al eliminar log:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exporta el router
