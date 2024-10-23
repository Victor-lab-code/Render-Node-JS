const jwt = require('jsonwebtoken');

// Middleware para verificar roles
function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.warn("Acceso denegado: No se proporcionó un token");
      return res.status(403).json({ error: "Acceso denegado: Se requiere un token de autenticación" });
    }

    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro');
      req.user = decoded; // Guardar la información del usuario en req.user

      // Verificar si el rol del usuario está permitido
      if (!rolesPermitidos.includes(decoded.rol)) {
        console.warn(`Acceso denegado: El rol ${decoded.rol} no tiene permisos para esta acción`);
        return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
      }

      next(); // Continuar si el rol está permitido
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.warn("Acceso denegado: El token ha expirado");
        return res.status(401).json({ error: "Token expirado" });
      }

      console.error("Error al verificar el token:", err);
      res.status(401).json({ error: "Token inválido" });
    }
  };
}

module.exports = verificarRol;




// const jwt = require('jsonwebtoken');

// // Middleware para verificar roles
// function verificarRol(rolesPermitidos) {
//     return (req, res, next) => {
//       const token = req.headers.authorization?.split(" ")[1];
//       if (!token) {
//         return res.status(403).json({ error: "Acceso denegado" });
//       }
  
//       try {
//         //const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro');
//         req.user = decoded; // Guardar la información del usuario en req.user
  
//         if (!rolesPermitidos.includes(decoded.rol)) {
//           return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
//         }
  
//         next();
//       } catch (err) {
//         res.status(401).json({ error: "Token inválido" });
//       }
//     };
//   }
  

// module.exports = verificarRol;
