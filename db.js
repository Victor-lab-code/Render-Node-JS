// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'optimizacion_documentos',
  password: 'Admin',
  port: 5432,
});

module.exports = pool;
