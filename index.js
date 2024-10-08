const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Agrega una ruta de prueba para verificar que el servidor esté funcionando
app.get('/test', (req, res) => {
  res.send('Ruta de prueba funcionando correctamente');
});

app.get('/hello', (req, res) => {
  res.send('Hola desde la ruta /hello');
});


// Rutas de tu aplicación
const usuariosRoutes = require('./conexiones/usuarios');
const RolesRoutes = require('./conexiones/roles');
const DocumentosRoutes = require('./conexiones/documentos');
const Routes = require('./conexiones/procesos_ocr');
const ResumenesRoutes = require('./conexiones/resumenes');
const EtiquetasRoutes = require('./conexiones/etiquetas');
const LogsRoutes = require('./conexiones/logs');
const ComentariosRoutes = require('./conexiones/comentarios_documentos');
const Permisos = require('./conexiones/permisos_tablas');

app.use(cors());
app.use(bodyParser.json());

// Usar las rutas de tu API
app.use('/usuarios', usuariosRoutes);
app.use('/roles', RolesRoutes);
app.use('/documentos', DocumentosRoutes);
app.use('/procesos_ocr', Routes);
app.use('/resumenes', ResumenesRoutes);
app.use('/etiquetas', EtiquetasRoutes);
app.use('/logs', LogsRoutes);
app.use('/comentarios_documentos', ComentariosRoutes);
app.use('/permisos_tablas', Permisos);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//cambios