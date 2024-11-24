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
router.get('/documentos', async (req, res) => {
  const { usuario_id } = req.query;

  // Validar que se envíe el usuario_id
  if (!usuario_id) {
    return res.status(400).json({ error: 'usuario_id es requerido' });
  }

  try {
    // Obtener todas las carpetas del usuario
    const carpetas = await pool.query(
      'SELECT * FROM carpetas WHERE usuario_id = $1',
      [usuario_id]
    );

    // Obtener documentos que están en carpetas
    const documentosEnCarpetas = await pool.query(`
      SELECT dc.carpeta_id, d.*
      FROM documentos_carpetas dc
      INNER JOIN documentos d ON dc.documento_id = d.id
      WHERE d.usuario_id = $1
    `, [usuario_id]);

    // Mapear documentos a sus respectivas carpetas
    const carpetasConDocumentos = carpetas.rows.map((carpeta) => {
      return {
        id: carpeta.id,
        nombre: carpeta.nombre,
        documentos: documentosEnCarpetas.rows.filter(
          (doc) => doc.carpeta_id === carpeta.id
        ),
      };
    });

    // Obtener documentos sin carpeta
    const documentosSinCarpeta = await pool.query(`
      SELECT *
      FROM documentos
      WHERE usuario_id = $1
      AND id NOT IN (SELECT documento_id FROM documentos_carpetas)
    `, [usuario_id]);

    // Agregar los documentos sin carpeta como una categoría especial
    carpetasConDocumentos.push({
      id: null,
      nombre: 'Sin carpeta',
      documentos: documentosSinCarpeta.rows,
    });

    res.json(carpetasConDocumentos);
  } catch (error) {
    console.error('Error al obtener documentos organizados:', error);
    res.status(500).json({ error: 'Error en el servidor' });
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





module.exports = router;
