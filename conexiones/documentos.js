const express = require('express');
const pool = require('../db'); // Importa la conexión a la base de datos
const router = express.Router(); // Define el router

// Obtener todos los documentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documentos');
    
    // Convertir contenido_original de buffer a base64
    const documentos = result.rows.map((documento) => {
      return {
        ...documento,
        contenido_original: documento.contenido_original.toString('base64'), // Convertir buffer a base64
      };
    });

    res.json(documentos);
  } catch (err) {
    console.error('Error al obtener los documentos:', err);
    res.status(500).send(err.message);
  }
});

// Obtener documentos por usuario_id
router.get('/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM documentos WHERE usuario_id = $1', [usuario_id]);
    
    // Convertir contenido_original de buffer a base64
    const documentos = result.rows.map((documento) => {
      return {
        ...documento,
        contenido_original: documento.contenido_original.toString('base64'), // Convertir buffer a base64
      };
    });

    res.json(documentos);
  } catch (err) {
    console.error('Error al obtener los documentos del usuario:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar un nuevo documento
router.post('/', async (req, res) => {
  const { contenido_original, usuario_id, titulo, contenido_procesado } = req.body;

  try {
    // Validar usuario_id
    const userIdParsed = parseInt(usuario_id);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    // Validar contenido_original
    if (!contenido_original) {
      return res.status(400).json({ error: 'El contenido del documento no puede estar vacío' });
    }

    // Convertir contenido_original de base64 a buffer
    const buffer = Buffer.from(contenido_original, 'base64');

    // Verificar los valores antes de ejecutar la consulta
    console.log('Valores insertados:', { buffer, userIdParsed, titulo, contenido_procesado });

    // Ejecutar la consulta
    const result = await pool.query(
      'INSERT INTO documentos (contenido_original, usuario_id, titulo, contenido_procesado) VALUES ($1, $2, $3, $4) RETURNING *',
      [buffer, userIdParsed, titulo || null, contenido_procesado || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar el documento:', err);
    res.status(500).send('Error en el servidor');
  }
});

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

module.exports = router;
