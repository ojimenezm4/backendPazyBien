const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Persona = require("../models/Persona");

const storage = multer.memoryStorage(); // Usamos memoria para procesar la imagen primero
const upload = multer({ storage: storage });

// Middleware para manejar la subida de archivos
const uploadSingle = upload.single("imagen");

// Controlador para registrar persona
exports.registrarPersona = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ mensaje: "Error al subir la imagen", error: err });
    }

    const {
      nombre,
      cui,
      padre,
      madre,
      telefono,
      telefonoContacto,
      direccion,
      fechaNacimiento,
    } = req.body;
    let imagen = "";

    if (req.file) {
      const filename = Date.now() + path.extname(req.file.originalname);
      const outputPath = path.join(__dirname, "../uploads", filename);

      // Procesar y redimensionar la imagen
      try {
        await sharp(req.file.buffer).resize(400, 400).toFile(outputPath);
        imagen = filename; // Guardar solo el nombre del archivo en la base de datos
      } catch (error) {
        console.error("Error al procesar la imagen", error);
        return res
          .status(500)
          .json({ mensaje: "Error al procesar la imagen", error });
      }
    }

    const persona = new Persona({
      nombre,
      cui,
      padre,
      madre,
      telefono,
      telefonoContacto,
      direccion,
      fechaNacimiento,
      imagen,
    });

    try {
      await persona.save();
      res.json({ mensaje: "Persona Creada Correctamente" });
    } catch (error) {
      if (error.code === 11000) {
        // Error de duplicado
        res.status(400).json({
          mensaje: "error: " + error.message,
          error,
        });
      } else {
        console.log(error);
        res.status(500).json({ mensaje: "Hubo un error", error });
      }
    }
  });
};

// Actualizar una persona por ID si está activa
exports.actualizarPersonaPorId = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ mensaje: "Error al subir la imagen", error: err });
    }

    const { id } = req.params;
    const nuevosDatos = { ...req.body };

    try {
      // Buscar la persona por ID
      const persona = await Persona.findById(id);

      // Verificar si la persona existe y está activa
      if (!persona) {
        return res.status(404).json({ mensaje: "Persona no encontrada" });
      }

      if (!persona.activo) {
        return res.status(403).json({
          mensaje: "La persona está inactiva y no puede ser actualizada",
        });
      }

      if (req.file) {
        const filename = Date.now() + path.extname(req.file.originalname);
        const outputPath = path.join(__dirname, "../uploads", filename);

        // Procesar y redimensionar la imagen
        try {
          await sharp(req.file.buffer).resize(400, 400).toFile(outputPath);
          nuevosDatos.imagen = filename; // Guardar solo el nombre del archivo en la base de datos
        } catch (error) {
          console.error("Error al procesar la imagen", error);
          return res
            .status(500)
            .json({ mensaje: "Error al procesar la imagen", error });
        }
      } else {
        nuevosDatos.imagen = persona.imagen; // Mantener la imagen anterior si no se proporciona una nueva
      }

      // Actualizar la persona con los nuevos datos
      const personaActualizada = await Persona.findByIdAndUpdate(
        id,
        nuevosDatos,
        { new: true }
      );

      res.json(personaActualizada);
    } catch (error) {
      res.status(500).json({ mensaje: "Hubo un error", error });
    }
  });
};

// Obtener todas las personas activas
exports.obtenerPersonas = async (req, res) => {
  try {
    const personas = await Persona.find({ activo: true });
    res.json(personas);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};

// Obtener una persona por ID si está activa
exports.obtenerPersonaPorId = async (req, res) => {
  try {
    const persona = await Persona.findOne({ _id: req.params.id, activo: true });
    if (!persona) {
      return res
        .status(404)
        .json({ mensaje: "Persona no encontrada o no activa" });
    }
    res.json(persona);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};
// Obtener múltiples personas por sus IDs
exports.obtenerPersonasPorIds = async (req, res) => {
  try {
    const ids = req.query.ids.split(",");
    const personas = await Persona.find({ _id: { $in: ids }, activo: true });
    res.json(personas);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};

// Eliminar (desactivar) una persona por ID
exports.eliminarPersonaPorId = async (req, res) => {
  try {
    const persona = await Persona.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!persona) {
      return res.status(404).json({ mensaje: "Persona no encontrada" });
    }
    res.json({ mensaje: "Persona desactivada correctamente", persona });
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};
