const express = require('express');
const pool = require('../db'); // Asegúrate de tener configurada la conexión a tu base de datos
const router = express.Router(); // Define el router para manejar las rutas

// Obtener todos los comentarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comentarios_documentos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los comentarios:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar un nuevo comentario
router.post('/', async (req, res) => {
  const { documento_id, usuario_id, comentario } = req.body;

  // Log para verificar los datos recibidos
  console.log('Datos recibidos:', { documento_id, usuario_id, comentario });

  try {
    if (!documento_id || !usuario_id || !comentario) {
      return res.status(400).send('El documento_id, usuario_id y el comentario son requeridos');
    }

    const result = await pool.query(
      'INSERT INTO comentarios_documentos (documento_id, usuario_id, comentario, fecha_comentario) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [documento_id, usuario_id, comentario]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar comentario:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Eliminar un comentario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM comentarios_documentos WHERE id = $1', [id]);
    res.status(200).send('Comentario eliminado');
  } catch (err) {
    console.error('Error al eliminar comentario:', err);
    res.status(500).send('Error en el servidor');
  }
});

router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT id FROM documentos'); // Solo obtener los IDs
      res.json(result.rows);
    } catch (err) {
      console.error('Error al obtener los IDs de los documentos:', err);
      res.status(500).send('Error en el servidor');
    }
  });


module.exports = router; // Exporta el router
