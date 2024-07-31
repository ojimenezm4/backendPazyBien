const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personaSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    required: true,
  },
  cui: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  padre: {
    type: String,
    trim: true,
  },
  madre: {
    type: String,
    trim: true,
  },
  telefono: {
    type: String,
    trim: true,
  },
  telefonoContacto: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  fechaNacimiento: {
    type: Date,
    required: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  imagen: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Persona", personaSchema);
