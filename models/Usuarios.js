const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usuariosSchema = new Schema({
  nombre: {
    type: String,
    required: "Agrega tu Nombre",
  },
  rol: {
    type: String,
    enum: ["super", "admin", "usuario"],
    default: "usuario",
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  fotoPerfil: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Usuarios", usuariosSchema);
