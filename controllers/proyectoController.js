const Proyecto = require("../models/Proyecto");
const Persona = require("../models/Persona");

// Crear un nuevo proyecto
exports.crearProyecto = async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error" + error.message, error });
  }
};

// Actualizar un proyecto por ID
exports.actualizarProyecto = async (req, res) => {
  const { id } = req.params;
  const { personas } = req.body;
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(
      id,
      { personas },
      { new: true }
    );
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};

// Agregar una persona a un proyecto
exports.agregarPersona = async (req, res) => {
  const { proyectoId, personaId } = req.params;

  try {
    const proyecto = await Proyecto.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    const persona = await Persona.findById(personaId);
    if (!persona) {
      return res.status(404).json({ mensaje: "Persona no encontrada" });
    }

    proyecto.personas.push(personaId);
    await proyecto.save();

    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};

// Obtener todos los proyectos activos
exports.obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ activo: true });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};

// Obtener proyectos por beneficiario
exports.obtenerProyectosPorBeneficiario = async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ personas: req.params.id });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};

// Desactivar un proyecto por ID
exports.eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }
    res.json({ mensaje: "Proyecto desactivado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error", error });
  }
};
