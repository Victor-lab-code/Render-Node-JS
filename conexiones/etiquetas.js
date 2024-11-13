const express = require('express');
const pool = require('../db'); // Configuración de conexión a la base de datos
const router = express.Router(); // Define el router para manejar las rutas

// Obtener todas las etiquetas de un usuario
router.get('/', async (req, res) => {
  const { userId } = req.query; // Obtenemos el userId desde los parámetros de consulta

  try {
    if (!userId) {
      return res.status(400).send('El userId es requerido');
    }

    // Consulta para obtener las etiquetas del usuario especificado
    const result = await pool.query('SELECT * FROM etiquetas WHERE usuario_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las etiquetas:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar una nueva etiqueta
router.post('/', async (req, res) => {
  const { documento_id, etiqueta, color, usuario_id } = req.body;

  // Log para verificar los datos recibidos en el servidor
  console.log('Datos recibidos:', { documento_id, etiqueta, color, usuario_id });

  try {
    // Verificar que todos los datos requeridos estén presentes, excepto documento_id que ahora es opcional
    if (!etiqueta || !color || !usuario_id) {
      console.error('Faltan datos requeridos:', { etiqueta, color, usuario_id });
      return res.status(400).send('etiqueta, color y usuario_id son requeridos');
    }

    // Crear la consulta SQL e insertar la etiqueta en la base de datos
    const queryText = documento_id
      ? 'INSERT INTO etiquetas (documento_id, etiqueta, color, fecha_etiqueta, usuario_id) VALUES ($1, $2, $3, NOW(), $4) RETURNING *'
      : 'INSERT INTO etiquetas (etiqueta, color, fecha_etiqueta, usuario_id) VALUES ($1, $2, NOW(), $3) RETURNING *';

    // Establecer los valores de los parámetros según si `documento_id` está presente o no
    const values = documento_id
      ? [documento_id, etiqueta, color, usuario_id]
      : [etiqueta, color, usuario_id];

    // Ejecutar la consulta en la base de datos
    const result = await pool.query(queryText, values);

    console.log('Etiqueta creada:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar etiqueta:', err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Actualizar una etiqueta existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { documento_id, etiqueta, color } = req.body;

  // Log para verificar los datos recibidos en el servidor
  console.log('Datos para actualizar:', { documento_id, etiqueta, color });

  try {
    // Verificar que al menos `etiqueta` o `color` estén presentes para actualizar
    if (!etiqueta && !color) {
      console.error('Se requiere al menos un campo para actualizar (etiqueta o color)');
      return res.status(400).send('Se requiere al menos un campo para actualizar (etiqueta o color)');
    }

    // Crear la consulta SQL para actualizar con condicional en `documento_id`
    const queryText = documento_id
      ? 'UPDATE etiquetas SET documento_id = $1, etiqueta = $2, color = $3 WHERE id = $4 RETURNING *'
      : 'UPDATE etiquetas SET etiqueta = $1, color = $2 WHERE id = $3 RETURNING *';

    // Establecer los valores de los parámetros según si `documento_id` está presente o no
    const values = documento_id
      ? [documento_id, etiqueta, color, id]
      : [etiqueta, color, id];

    // Ejecutar la consulta de actualización
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).send('Etiqueta no encontrada');
    }

    console.log('Etiqueta actualizada:', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar etiqueta:', err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta en Node.js para asociar una etiqueta a un documento
router.put('/documentos/:id/etiqueta', async (req, res) => {
  const { id } = req.params; // id del documento
  const { etiqueta, color } = req.body;

  try {
    // Comprobamos si ya existe una entrada en etiquetas para este documento
    const etiquetaExistente = await pool.query(
      'SELECT * FROM etiquetas WHERE documento_id = $1',
      [id]
    );

    if (etiquetaExistente.rowCount > 0) {
      // Si existe, actualizamos la etiqueta y el color
      await pool.query(
        'UPDATE etiquetas SET nombre = $1, color = $2 WHERE documento_id = $3',
        [etiqueta, color, id]
      );
    } else {
      // Si no existe, insertamos una nueva fila en la tabla etiquetas
      await pool.query(
        'INSERT INTO etiquetas (nombre, color, documento_id) VALUES ($1, $2, $3)',
        [etiqueta, color, id]
      );
    }

    res.status(200).json({ message: 'Etiqueta asociada exitosamente al documento' });
  } catch (error) {
    console.error('Error al asociar la etiqueta al documento:', error);
    res.status(500).json({ error: 'Error al asociar la etiqueta al documento' });
  }
});


// Eliminar una etiqueta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Ejecutar la consulta de eliminación
    await pool.query('DELETE FROM etiquetas WHERE id = $1', [id]);
    res.status(200).send('Etiqueta eliminada');
  } catch (err) {
    console.error('Error al eliminar etiqueta:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exporta el router

