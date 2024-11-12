const express = require('express');
const pool = require('../db');
const verificarRol = require('./middlewares/verificarRol');
const router = express.Router();

// Obtener todos los documentos (permitido para 'admin', 'viewer' y 'manager')
router.get('/', verificarRol(['admin', 'viewer', 'manager']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documentos');
    const documentos = result.rows.map((documento) => ({
      ...documento,
      contenido_original: documento.contenido_original.toString('base64'),
    }));
    res.json(documentos);
  } catch (err) {
    console.error('Error al obtener los documentos:', err);
    res.status(500).send(err.message);
  }
});

// Obtener documentos por usuario_id
router.get('/usuario/:usuario_id', verificarRol(['admin', 'viewer', 'manager', 'user']), async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM documentos WHERE usuario_id = $1', [usuario_id]);
    const documentos = result.rows.map((documento) => ({
      ...documento,
      contenido_original: documento.contenido_original.toString('base64'),
    }));
    res.json(documentos);
  } catch (err) {
    console.error('Error al obtener los documentos del usuario:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar un nuevo documento
router.post('/', verificarRol(['admin', 'user']), async (req, res) => {
  const { contenido_original, usuario_id, titulo, contenido_procesado } = req.body;
  
  try {
    const userIdParsed = parseInt(usuario_id);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ error: 'ID de usuario no válido. Debe ser un número.' });
    }
    if (!contenido_original) {
      return res.status(400).json({ error: 'El contenido del documento no puede estar vacío.' });
    }

    // Verificar si el usuario existe
    const usuario = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userIdParsed]);
    if (usuario.rowCount === 0) {
      return res.status(400).json({ error: 'El ID de usuario proporcionado no existe.' });
    }

    const buffer = Buffer.from(contenido_original, 'base64');
    
    // Agregar documento con fecha asignada automáticamente
    const result = await pool.query(
      'INSERT INTO documentos (contenido_original, usuario_id, titulo, contenido_procesado, fecha_subida) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [buffer, userIdParsed, titulo || null, contenido_procesado || null]
    );

    if (result.rowCount === 0) {
      return res.status(500).json({ error: 'No se pudo guardar el documento. Intente de nuevo.' });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar el documento:', err);
    res.status(500).json({ error: 'Error en el servidor al intentar guardar el documento.', detalles: err.message });
  }
});


// Eliminar un documento
router.delete('/:id', verificarRol(['admin', 'manager', 'user']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM documentos WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Documento no encontrado');
    }
    res.status(200).send('Documento eliminado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Actualizar un documento
router.put('/:id', verificarRol(['admin', 'user']), async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido_procesado } = req.body;
  if (!titulo && !contenido_procesado) {
    return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar.' });
  }
  try {
    const result = await pool.query(
      'UPDATE documentos SET titulo = $1, contenido_procesado = $2 WHERE id = $3 RETURNING *',
      [titulo, contenido_procesado, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).send('Documento no encontrado');
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;





















// const express = require('express');
// const pool = require('../db'); // Importa la conexión a la base de datos
// const verificarRol = require('./middlewares/verificarRol'); // Importar el middleware
// const router = express.Router(); // Define el router

// // Obtener todos los documentos (permitido para 'admin', 'viewer' y 'manager')
// router.get('/', verificarRol(['admin', 'viewer', 'manager']), async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM documentos');
    
//     // Convertir contenido_original de buffer a base64
//     const documentos = result.rows.map((documento) => {
//       return {
//         ...documento,
//         contenido_original: documento.contenido_original.toString('base64'), // Convertir buffer a base64
//       };
//     });

//     res.json(documentos);
//   } catch (err) {
//     console.error('Error al obtener los documentos:', err);
//     res.status(500).send(err.message);
//   }
// });
// //COMENTARIO X

// // Obtener documentos por usuario_id (permitido para 'admin', 'viewer' y 'manager')
// router.get('/usuario/:usuario_id', verificarRol(['admin', 'viewer', 'manager']), async (req, res) => {
//   const { usuario_id } = req.params;
  
//   try {
//     const result = await pool.query('SELECT * FROM documentos WHERE usuario_id = $1', [usuario_id]);
    
//     // Convertir contenido_original de buffer a base64
//     const documentos = result.rows.map((documento) => {
//       return {
//         ...documento,
//         contenido_original: documento.contenido_original.toString('base64'), // Convertir buffer a base64
//       };
//     });

//     res.json(documentos);
//   } catch (err) {
//     console.error('Error al obtener los documentos del usuario:', err);
//     res.status(500).send('Error en el servidor');
//   }
// });

// // Agregar un nuevo documento (solo permitido para 'admin' y 'user')
// // Agregar un nuevo documento (solo permitido para 'admin' y 'user')
// // Agregar un nuevo documento (solo permitido para 'admin' y 'user')
// router.post('/', verificarRol(['admin', 'user']), async (req, res) => {
//   const { contenido_original, usuario_id, titulo, contenido_procesado } = req.body;

//   try {
//     // Validar que `usuario_id` no sea nulo y sea un número válido
//     const userIdParsed = parseInt(usuario_id);
//     if (isNaN(userIdParsed)) {
//       return res.status(400).json({ error: 'ID de usuario no válido. Debe ser un número.' });
//     }

//     // Validar que el contenido no esté vacío
//     if (!contenido_original) {
//       return res.status(400).json({ error: 'El contenido del documento no puede estar vacío.' });
//     }

//     // Convertir contenido de base64 a buffer
//     const buffer = Buffer.from(contenido_original, 'base64');

//     // Imprimir los valores que se están intentando insertar para depuración
//     console.log('Intentando insertar documento:', {
//       buffer: buffer.length,
//       usuario_id: userIdParsed,
//       titulo: titulo || 'Sin título',
//       contenido_procesado: contenido_procesado || 'Sin contenido procesado',
//     });

//     // Insertar el documento en la base de datos
//     const result = await pool.query(
//       'INSERT INTO documentos (contenido_original, usuario_id, titulo, contenido_procesado) VALUES ($1, $2, $3, $4) RETURNING *',
//       [buffer, userIdParsed, titulo || null, contenido_procesado || null]
//     );

//     // Verificar si la inserción fue exitosa
//     if (result.rowCount === 0) {
//       return res.status(500).json({ error: 'No se pudo guardar el documento. Intente de nuevo.' });
//     }

//     // Responder con los datos del documento insertado
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error al guardar el documento:', err);
//     res.status(500).json({ error: 'Error en el servidor al intentar guardar el documento.', detalles: err.message });
//   }
// });



// // Eliminar un documento (permitido para 'admin' y 'manager')
// router.delete('/:id', verificarRol(['admin', 'manager']), async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query('DELETE FROM documentos WHERE id = $1', [id]);
//     res.status(200).send('Documento eliminado');
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// // Actualizar un documento (permitido para 'admin' y 'user')
// router.put('/:id', verificarRol(['admin', 'user']), async (req, res) => {
//   const { id } = req.params;
//   const { titulo, contenido_procesado } = req.body;
//   try {
//     const result = await pool.query(
//       'UPDATE documentos SET titulo = $1, contenido_procesado = $2 WHERE id = $3 RETURNING *',
//       [titulo, contenido_procesado, id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// module.exports = router;
