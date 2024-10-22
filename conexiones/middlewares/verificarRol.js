const jwt = require('jsonwebtoken');

// Middleware para verificar roles
function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro');
        req.user = decoded; // Guardar la información del usuario en req.user
  
        if (!rolesPermitidos.includes(decoded.rol)) {
          return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
        }
  
        next();
      } catch (err) {
        res.status(401).json({ error: "Token inválido" });
      }
    };
  }
  

module.exports = verificarRol;
