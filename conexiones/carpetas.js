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

// Asignar un documento a una carpeta
router.post('/asignar-documento', async (req, res) => {
  const { documento_id, carpeta_id } = req.body;

  // Validar que se envíen los datos requeridos
  if (!documento_id || !carpeta_id) {
    return res.status(400).json({ error: 'documento_id y carpeta_id son requeridos' });
  }

  try {
    // Verificar si la carpeta existe
    const carpeta = await pool.query('SELECT * FROM carpetas WHERE id = $1', [carpeta_id]);
    if (carpeta.rowCount === 0) {
      return res.status(404).json({ error: 'La carpeta no existe' });
    }

    // Verificar si el documento existe
    const documento = await pool.query('SELECT * FROM documentos WHERE id = $1', [documento_id]);
    if (documento.rowCount === 0) {
      return res.status(404).json({ error: 'El documento no existe' });
    }

    // Insertar la relación en documentos_carpetas
    await pool.query(
      'INSERT INTO documentos_carpetas (documento_id, carpeta_id) VALUES ($1, $2)',
      [documento_id, carpeta_id]
    );

    res.status(201).json({ message: 'Documento asignado a la carpeta correctamente' });
  } catch (error) {
    console.error('Error al asignar documento a carpeta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
