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

// const { Pool } = require('pg');
// require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // Usar la URL de la base de datos de Render
//   ssl: {
//     rejectUnauthorized: false, // Esto es necesario para las conexiones SSL en Render
//   },
// }) ;

// module.exports = pool;
// COMENTARIO NUEBO

const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
