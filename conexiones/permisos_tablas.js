const express = require('express');
const pool = require('../db'); // Asegúrate de tener configurada la conexión a tu base de datos
const router = express.Router(); // Define el router para manejar las rutas

// Obtener todos los permisos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM permisos_tablas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los permisos:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar un nuevo permiso
router.post('/', async (req, res) => {
  const { rol_id, tabla, permiso } = req.body;

  // Log para verificar los datos recibidos
  console.log('Datos recibidos:', { rol_id, tabla, permiso });

  try {
    if (!rol_id || !tabla || !permiso) {
      return res.status(400).send('El rol_id, tabla y el permiso son requeridos');
    }

    const result = await pool.query(
      'INSERT INTO permisos_tablas (rol_id, tabla, permiso) VALUES ($1, $2, $3) RETURNING *',
      [rol_id, tabla, permiso]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar permiso:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Eliminar un permiso
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM permisos_tablas WHERE id = $1', [id]);
    res.status(200).send('Permiso eliminado');
  } catch (err) {
    console.error('Error al eliminar permiso:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exporta el router
