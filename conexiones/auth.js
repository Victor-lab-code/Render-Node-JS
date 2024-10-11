// auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, contrasena]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar usuario:', err.stack);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
