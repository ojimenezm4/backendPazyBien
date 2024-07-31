const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proyectoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFin: {
    type: Date,
    required: true,
  },
  areaCobertura: {
    type: String,
    required: true,
  },
  actividades: {
    type: [String], // Array de actividades realizadas
    required: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  personas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
    },
  ],
});

module.exports = mongoose.model("Proyecto", proyectoSchema);
