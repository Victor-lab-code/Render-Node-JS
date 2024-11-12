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
