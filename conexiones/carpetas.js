const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Crear una nueva carpeta
router.post('/crear', async (req, res) => {
  const { nombre, usuario_id } = req.body;

  if (!nombre || !usuario_id) {
    return res.status(400).json({ error: 'El nombre de la carpeta y el ID del usuario son obligatorios.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO carpetas (nombre, usuario_id) VALUES ($1, $2) RETURNING *',
      [nombre, usuario_id]
    );

    res.status(201).json({
      mensaje: 'Carpeta creada exitosamente.',
      carpeta: result.rows[0],
    });
  } catch (error) {
    console.error('Error al crear la carpeta:', error);
    res.status(500).json({ error: 'Error al crear la carpeta.' });
  }
});

module.exports = router;
