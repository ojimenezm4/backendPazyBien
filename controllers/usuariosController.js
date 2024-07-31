const Usuarios = require("../models/Usuarios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Configuración de almacenamiento con multer
const storage = multer.memoryStorage(); // Usamos memoria para procesar la imagen primero
const upload = multer({ storage: storage });

// Middleware para manejar la subida de archivos
const uploadSingle = upload.single("fotoPerfil");

// Controlador para registrar usuario
exports.registrarUsuario = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ mensaje: "Error al subir la foto de perfil", error: err });
    }

    const { nombre, email, password, rol } = req.body;
    let fotoPerfil = "";

    if (req.file) {
      const filename = Date.now() + path.extname(req.file.originalname);
      const outputPath = path.join(__dirname, "../uploads", filename);

      // Procesar y redimensionar la imagen
      try {
        await sharp(req.file.buffer).resize(400, 400).toFile(outputPath);

        fotoPerfil = filename; // Guardar solo el nombre del archivo en la base de datos
      } catch (error) {
        console.error("Error al procesar la imagen", error);
        return res
          .status(500)
          .json({ mensaje: "Error al procesar la imagen", error });
      }
    }

    const usuario = new Usuarios({
      nombre,
      email,
      password: await bcrypt.hash(password, 12),
      rol,
      fotoPerfil,
    });

    try {
      await usuario.save();
      res.json({ mensaje: "Usuario Creado Correctamente" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: "Hubo un error", error });
    }
  });
};
//actualizar usuario

exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const nuevoUsuario = { ...req.body };

  try {
    if (req.body.currentPassword && req.body.newPassword) {
      const usuarioExistente = await Usuarios.findById(id);
      const passwordValida = await bcrypt.compare(
        req.body.currentPassword,
        usuarioExistente.password
      );

      if (!passwordValida) {
        return res
          .status(401)
          .json({ mensaje: "Contraseña actual incorrecta" });
      }

      nuevoUsuario.password = await bcrypt.hash(req.body.newPassword, 12);
    } else {
      delete nuevoUsuario.password;
    }

    if (req.file) {
      const inputImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        req.file.filename
      );
      const outputImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        `optimized-${req.file.filename}`
      );

      await sharp(inputImagePath).resize(400, 400).toFile(outputImagePath);
      fs.renameSync(outputImagePath, inputImagePath);

      nuevoUsuario.fotoPerfil = req.file.filename;
    } else {
      const usuarioExistente = await Usuarios.findById(id);
      nuevoUsuario.fotoPerfil = usuarioExistente.fotoPerfil;
    }

    const usuarioActualizado = await Usuarios.findByIdAndUpdate(
      id,
      nuevoUsuario,
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado 404" });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error.message);
    res
      .status(500)
      .json({ mensaje: "Hubo un error 500", error: error.message });
  }
};
// Controlador para marcar un usuario como inactivo
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioInactivo = await Usuarios.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );
    if (!usuarioInactivo) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario marcado como inactivo correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Hubo un error" });
  }
};

exports.autenticarUsuario = async (req, res, next) => {
  const { email, password } = req.body;
  const usuario = await Usuarios.findOne({ email });

  if (!usuario || !usuario.activo) {
    return res.status(401).json({ mensaje: "Ese usuario no existe" });
  } else if (!bcrypt.compareSync(password, usuario.password)) {
    return res.status(401).json({ mensaje: "Password Incorrecto" });
  } else {
    const token = jwt.sign(
      {
        email: usuario.email,
        nombre: usuario.nombre,
        id: usuario._id,
        rol: usuario.rol,
      },
      "LLAVESECRETA",
      { expiresIn: "1h" }
    );

    res.json({ token });
  }
};

// Controlador para obtener todos los usuarios activos
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuarios.find({ activo: true });
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Hubo un error" });
  }
};

// Controlador para obtener todos los usuarios inactivos
exports.obtenerUsuariosI = async (req, res) => {
  try {
    const usuarios = await Usuarios.find({ activo: false });
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Hubo un error" });
  }
};

// Controlador para obtener un usuario activo por su ID
exports.obtenerUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuarios.findOne({ _id: id, activo: true });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Hubo un error" });
  }
};
