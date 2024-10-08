// usuarios.js
const express = require('express');
const pool = require('../db');
const router = express.Router(); // Define el router una sola vez

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Agregar un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, contrasena]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(200).send('Usuario eliminado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router; // Exporta el router
