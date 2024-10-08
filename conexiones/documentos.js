const express = require('express');
const pool = require('../db'); // Importa la conexión a la base de datos
const router = express.Router(); // Define el router

// Obtener todos los documentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documentos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Agregar un nuevo documento
router.post('/', async (req, res) => {
  const { titulo, contenido_procesado } = req.body;
  const usuario_id = req.user ? req.user.id : 1; // Aquí asumes que el ID de usuario está disponible en req.user

  try {
    const result = await pool.query(
      'INSERT INTO documentos (titulo, contenido_procesado, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [titulo, contenido_procesado, usuario_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar documento:', err);
    res.status(500).send('Error en el servidor');
  }
});


// Obtener todos los documentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documentos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los documentos:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;


// Eliminar un documento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM documentos WHERE id = $1', [id]);
    res.status(200).send('Documento eliminado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Actualizar un documento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido_procesado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE documentos SET titulo = $1, contenido_procesado = $2 WHERE id = $3 RETURNING *',
      [titulo, contenido_procesado, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router; // Exporta el router
