const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

// Importar rutas de usuarios
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

// Usar las rutas de usuarios
app.use('/usuarios', usuariosRoutes);
app.use('/roles', RolesRoutes);
app.use('/documentos', DocumentosRoutes);
app.use('/procesos_ocr', Routes);
app.use('/resumenes', ResumenesRoutes);
app.use('/etiquetas', EtiquetasRoutes);
app.use('/logs', LogsRoutes);
app.use('/comentarios_documentos', ComentariosRoutes);
app.use('/permisos_tablas', Permisos);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
