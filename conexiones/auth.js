const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs'); // Importar bcryptjs
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  try {
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Insertar el nuevo usuario con la contraseña encriptada
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar usuario:', err.stack);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Verificar si el correo existe en la base de datos
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar la contraseña usando bcrypt
    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar el token al cliente
    res.json({ token });
  } catch (err) {
    console.error('Error al iniciar sesión:', err.stack);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
