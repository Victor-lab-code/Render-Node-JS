const express = require('express');
const pool = require('../db');
const router = express.Router(); // Define el router una sola vez

// Obtener todos los usuarios
// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    console.log('Solicitud GET recibida en /usuarios');
    const result = await pool.query('SELECT * FROM usuarios');
    console.log('Consulta a la base de datos ejecutada, result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los usuarios:', err.stack);
    res.status(500).send('Error en el servidor');
  }
});


// Agregar un nuevo usuario
// router.post('/', async (req, res) => {
//   const { nombre, correo, contrasena } = req.body;
//   console.log('Solicitud POST recibida en /usuarios con los datos:', { nombre, correo, contrasena });

//   try {
//     const result = await pool.query(
//       'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
//       [nombre, correo, contrasena]
//     );
//     console.log('Consulta INSERT ejecutada. Usuario agregado:', result.rows[0]);
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error al agregar usuario:', err.stack);
//     res.status(500).send('Error en el servidor');
//   }
// });

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Solicitud DELETE recibida para eliminar el usuario con ID: ${id}`);

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      console.log(`Usuario con ID ${id} eliminado correctamente`);
      res.status(200).send('Usuario eliminado');
    } else {
      console.log(`No se encontró usuario con ID ${id}`);
      res.status(404).send('Usuario no encontrado');
    }
  } catch (err) {
    console.error('Error al eliminar usuario:', err.stack);
    res.status(500).send('Error en el servidor');
  }
});


//Registrar un usuario

// Ruta para registrar usuarios
router.post('/register', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  try {
    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Guardar usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING id',
      [nombre, correo, hashedPassword]
    );

    // Crear un token JWT único para el usuario registrado
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Enviar el token al cliente
    res.status(201).json({ token });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
});




module.exports = router; // Exporta el router
