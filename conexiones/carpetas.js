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

// Obtener documentos organizados por carpetas
// Obtener solo el nombre, ID y cantidad de documentos por carpeta
router.get('/documentos', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
  }

  try {
    // Consulta para obtener el nombre, ID y cantidad de documentos en cada carpeta
    const carpetas = await pool.query(`
      SELECT 
        c.id, 
        c.nombre, 
        COUNT(dc.documento_id) AS cantidad_documentos
      FROM carpetas c
      LEFT JOIN documentos_carpetas dc ON c.id = dc.carpeta_id
      WHERE c.usuario_id = $1
      GROUP BY c.id, c.nombre
    `, [usuario_id]);

    // Agregar la cantidad de documentos sin carpeta
    const documentosSinCarpeta = await pool.query(`
      SELECT COUNT(*) AS cantidad_documentos
      FROM documentos d
      WHERE d.usuario_id = $1
      AND d.id NOT IN (SELECT documento_id FROM documentos_carpetas)
    `, [usuario_id]);

    // Formatear la respuesta
    const carpetasConCantidad = carpetas.rows;
    carpetasConCantidad.push({
      id: null,
      nombre: 'Sin carpeta',
      cantidad_documentos: parseInt(documentosSinCarpeta.rows[0].cantidad_documentos, 10),
    });

    res.json(carpetasConCantidad);
  } catch (error) {
    console.error('Error al obtener las carpetas:', error);
    res.status(500).json({ error: 'Error al obtener las carpetas.' });
  }
});


// Ruta para obtener únicamente los nombres e IDs de las carpetas
router.get('/carpetas/nombres', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
  }

  try {
    const carpetas = await pool.query(
      'SELECT id, nombre FROM carpetas WHERE usuario_id = $1',
      [usuario_id]
    );

    res.json(carpetas.rows);
  } catch (error) {
    console.error('Error al obtener nombres de carpetas:', error);
    res.status(500).json({ error: 'Error al obtener nombres de carpetas.' });
  }
});

router.get('/nombres', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
  }

  try {
    const carpetas = await pool.query(
      'SELECT id, nombre FROM carpetas WHERE usuario_id = $1',
      [usuario_id]
    );

    res.json(carpetas.rows);
  } catch (error) {
    console.error('Error al obtener nombres de carpetas:', error);
    res.status(500).json({ error: 'Error al obtener nombres de carpetas.' });
  }
});

// Mover un documento a una carpeta
router.post('/mover', async (req, res) => {
  const { documento_id, carpeta_id } = req.body;

  if (!documento_id || !carpeta_id) {
    return res.status(400).json({ error: 'documento_id y carpeta_id son requeridos.' });
  }

  try {
    // Verificar si la carpeta existe
    const carpeta = await pool.query('SELECT * FROM carpetas WHERE id = $1', [carpeta_id]);
    if (carpeta.rowCount === 0) {
      return res.status(404).json({ error: 'La carpeta no existe.' });
    }

    // Verificar si el documento existe
    const documento = await pool.query('SELECT * FROM documentos WHERE id = $1', [documento_id]);
    if (documento.rowCount === 0) {
      return res.status(404).json({ error: 'El documento no existe.' });
    }

    // Verificar si el documento ya está en la carpeta
    const relacionExistente = await pool.query(
      'SELECT * FROM documentos_carpetas WHERE documento_id = $1 AND carpeta_id = $2',
      [documento_id, carpeta_id]
    );
    if (relacionExistente.rowCount > 0) {
      return res.status(400).json({ error: 'El documento ya está en la carpeta seleccionada.' });
    }

    // Eliminar relaciones existentes del documento con otras carpetas
    await pool.query('DELETE FROM documentos_carpetas WHERE documento_id = $1', [documento_id]);

    // Insertar la nueva relación
    await pool.query(
      'INSERT INTO documentos_carpetas (documento_id, carpeta_id) VALUES ($1, $2)',
      [documento_id, carpeta_id]
    );

    res.status(200).json({ mensaje: 'Documento movido exitosamente.' });
  } catch (error) {
    console.error('Error al mover documento:', error);
    res.status(500).json({ error: 'Error al mover el documento.' });
  }
});





module.exports = router;
