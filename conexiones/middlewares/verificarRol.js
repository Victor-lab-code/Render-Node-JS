const jwt = require('jsonwebtoken');

function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro');
      if (!rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
      }
      req.user = decoded; // Guardar el token decodificado para usarlo más adelante
      next();
    } catch (err) {
      res.status(401).json({ error: "Token inválido" });
    }
  };
}

module.exports = verificarRol;
