const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();



console.log(process.env.DATABASE_URL);  

// Configurar el límite de tamaño de las solicitudes
app.use(express.json({ limit: '100mb' })); // 50MB como ejemplo
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Configurar CORS
app.use(cors());

// Rutas de prueba para verificar el funcionamiento del servidor
app.get('/test', (req, res) => {
  res.send('Ruta de prueba funcionando correctamente');
});

app.get('/hello', (req, res) => {
  res.send('Hola desde la ruta /hello');
});

// Rutas de tu aplicación
const usuariosRoutes = require('./conexiones/usuarios');
const carpetasRoutes = require('./conexiones/carpetas');
const rolesRoutes = require('./conexiones/roles');
const documentosRoutes = require('./conexiones/documentos');
const procesosOcrRoutes = require('./conexiones/procesos_ocr');
const resumenesRoutes = require('./conexiones/resumenes');
const etiquetasRoutes = require('./conexiones/etiquetas');
const logsRoutes = require('./conexiones/logs');
const comentariosRoutes = require('./conexiones/comentarios_documentos');
const permisosRoutes = require('./conexiones/permisos_tablas');
const authRoutes = require('./conexiones/auth'); // Cambia a auth.js o register.js si aplica
const chatbot = require('./conexiones/chatbot'); // Cambia a auth.js o register.js si aplica

// Usar las rutas de la API
app.use('/usuarios', usuariosRoutes);
app.use('/roles', rolesRoutes);
app.use('/documentos', documentosRoutes);
app.use('/procesos_ocr', procesosOcrRoutes);
app.use('/resumenes', resumenesRoutes);
app.use('/etiquetas', etiquetasRoutes);
app.use('/logs', logsRoutes);
app.use('/comentarios_documentos', comentariosRoutes);
app.use('/permisos_tablas', permisosRoutes);
app.use('/', authRoutes); // Ruta para autenticación
app.use('/carpetas', carpetasRoutes);
app.use('/chatbot', chatbot);



// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
