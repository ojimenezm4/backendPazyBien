const jwt = require('jsonwebtoken');

module.exports = (rolesPermitidos) => {
  return (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      res.status(401).json({ message: "No autenticado, no hay JWT", statusCode: 401 });
      return;
    }

    const token = authHeader.split(" ")[1];
    let revisarToken;
    try {
      revisarToken = jwt.verify(token, "LLAVESECRETA");
    } catch (error) {
      res.status(500).json({ message: error.message, statusCode: 500 });
      return;
    }

    if (!revisarToken) {
      res.status(401).json({ message: "No autenticado", statusCode: 401 });
      return;
    }

    if (!rolesPermitidos.includes(revisarToken.rol)) {
      res.status(403).json({ message: "No tienes autorización para hacer esto", statusCode: 403 });
      return;
    }

    req.usuario = revisarToken;  // Pasamos el usuario verificado a la request
    next();
  };
};
