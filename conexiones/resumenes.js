const express = require('express');
const pool = require('../db'); // Importa la conexión a la base de datos
const router = express.Router(); // Define el router

// Obtener todos los resúmenes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resumenes');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener resúmenes:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Agregar un nuevo resumen
router.post('/', async (req, res) => {
    const { documento_id, resumen } = req.body;
  
    // Log para verificar los datos recibidos
    console.log('Datos recibidos:', { documento_id, resumen });
  
    try {
      if (!documento_id || !resumen) {
        return res.status(400).send('documento_id y resumen son requeridos');
      }
  
      const result = await pool.query(
        'INSERT INTO resumenes (documento_id, resumen, fecha_resumen) VALUES ($1, $2, NOW()) RETURNING *',
        [documento_id, resumen]
      );
  
      console.log('Resumen agregado:', result.rows[0]);
      res.status(201).json(result.rows[0]);
  
    } catch (err) {
    //  console.error('Error al agregar resumen:', err);
     // res.status(500).send(`Error en el servidor: ${err.message}`);
    }
  });
  
  
  

// Eliminar un resumen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM resumenes WHERE id = $1', [id]);
    res.status(200).send('Resumen eliminado');
  } catch (err) {
    console.error('Error al eliminar resumen:', err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exporta el router
