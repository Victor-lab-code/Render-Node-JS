const express = require('express');
const pool = require('../db');
const router = express.Router(); // Define el router una sola vez

// Obtener todos los roles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Agregar un nuevo rol
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO roles (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Eliminar un rol
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    res.status(200).send('Rol eliminado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router; // Exporta el router
