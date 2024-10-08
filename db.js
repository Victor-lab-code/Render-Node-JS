// // db.js
// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'optimizacion_documentos',
//   password: 'Admin',
//   port: 5432,
// });

// module.exports = pool;

const { Pool } = require('pg');
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usar la URL de la base de datos de Render
  ssl: {
    rejectUnauthorized: false, // Esto es necesario para las conexiones SSL en Render
  },
});

module.exports = pool;
