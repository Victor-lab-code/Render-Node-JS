const express = require('express'); 
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Ruta para registrar un nuevo usuario
router.post('/register', [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('correo').isEmail().withMessage('Debe ser un correo válido'),
  body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
], async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verificar si el correo ya está registrado
    const existingUser = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (existingUser.rowCount > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING id, nombre, correo',
      [nombre, correo, hashedPassword]
    );
    
    console.log('Usuario registrado:', result.rows[0]);

    // Enviar solo los datos necesarios al cliente
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar usuario:', err.stack);
    res.status(500).json({ error: 'Error en el servidor', detalles: err.message });
  }
});

// Ruta de inicio de sesión
router.post('/login', [
  body('correo').isEmail().withMessage('Debe ser un correo válido'),
  body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
], async (req, res) => {
  const { correo, contrasena } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Intentando iniciar sesión con correo:', correo);

    // Verificar si el correo existe en la base de datos
    const result = await pool.query(`
      SELECT usuarios.*, roles.nombre AS rol_nombre 
      FROM usuarios 
      LEFT JOIN roles ON usuarios.rol_id = roles.id 
      WHERE usuarios.correo = $1
    `, [correo]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];
    console.log('Usuario encontrado:', usuario);

    // Verificar la contraseña usando bcrypt
    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT que incluya el ID del usuario y el rol
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol_nombre },
      process.env.JWT_SECRET || 'mi_secreto_super_seguro',
      { expiresIn: '1h' }
    );

    console.log('Token generado:', token);

    // Enviar el token, el userId y el rol al cliente
    res.json({ token, userId: usuario.id, rol: usuario.rol_nombre });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error en el servidor', detalles: err.message });
  }
});

module.exports = router;












// const express = require('express');
// const router = express.Router();
// const pool = require('../db');
// const bcrypt = require('bcryptjs'); // Importar bcryptjs
// const jwt = require('jsonwebtoken'); // Importar jsonwebtoken

// // Ruta para registrar un nuevo usuario
// router.post('/register', async (req, res) => {
//   const { nombre, correo, contrasena } = req.body;

//   try {
//     // Encriptar la contraseña
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(contrasena, salt);

//     const result = await pool.query(
//       'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING id, nombre, correo',
//       [nombre, correo, hashedPassword]
//     );
    
//     console.log('Usuario registrado:', result.rows[0]);

//     // Enviar solo los datos necesarios al cliente
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error al registrar usuario:', err.stack);
//     res.status(500).json({ error: 'Error en el servidor', detalles: err.message });
//   }
// });

// // Ruta de inicio de sesión
// // Ruta de inicio de sesión
// router.post('/login', async (req, res) => {
//   const { correo, contrasena } = req.body;

//   try {
//     console.log('Intentando iniciar sesión con correo:', correo);

//     // Verificar si el correo existe en la base de datos
//     const result = await pool.query(`
//       SELECT usuarios.*, roles.nombre AS rol_nombre 
//       FROM usuarios 
//       LEFT JOIN roles ON usuarios.rol_id = roles.id 
//       WHERE usuarios.correo = $1
//     `, [correo]);

//     if (result.rows.length === 0) {
//       return res.status(400).json({ error: 'Usuario no encontrado' });
//     }

//     const usuario = result.rows[0];
//     console.log('Usuario encontrado:', usuario);

//     // Verificar la contraseña usando bcrypt
//     const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);

//     if (!validPassword) {
//       return res.status(400).json({ error: 'Contraseña incorrecta' });
//     }

//     // Generar un token JWT que incluya el ID del usuario y el rol
//     const token = jwt.sign(
//       { id: usuario.id, rol: usuario.rol_nombre },
//       process.env.JWT_SECRET || 'mi_secreto_super_seguro',
//       { expiresIn: '1h' }
//     );

//     console.log('Token generado:', token);

//     // Enviar el token, el userId y el rol al cliente
//     res.json({ token, userId: usuario.id, rol: usuario.rol_nombre });
//   } catch (err) {
//     console.error('Error al iniciar sesión:', err);
//     res.status(500).json({ error: 'Error en el servidor', detalles: err.message });
//   }
// });


// module.exports = router;
