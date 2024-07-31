const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ mensaje: "No autenticado, no hay JWT" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado, no hay JWT" });
  }

  try {
    const revisarToken = jwt.verify(token, "LLAVESECRETA");
    req.user = revisarToken; // Almacenar los datos del usuario en la solicitud
    next();
  } catch (error) {
    return res.status(500).json({ mensaje: "Token inválido" });
  }
};
