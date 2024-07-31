const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const personaController = require("../controllers/personaController");
const usuariosController = require("../controllers/usuariosController");
const proyectoController = require("../controllers/proyectoController");

// middle para proteger las rutas
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");

module.exports = function () {
  // CRUD para proyectos ***************************************************************
  router.post("/proyectos", proyectoController.crearProyecto);
  router.get("/proyectos", proyectoController.obtenerProyectos);
  router.put(
    "/proyectos/:proyectoId/personas/:personaId",
    proyectoController.agregarPersona
  );
  router.put("/proyectos/:id", proyectoController.actualizarProyecto);

  router.get(
    "/proyectos/beneficiario/:id",
    proyectoController.obtenerProyectosPorBeneficiario
  );

  router.put("/eliminar/:id", proyectoController.eliminarProyecto); // Ruta actualizada para desactivar el proyecto

  // CRUD Personas ***************************************************************
  router.post("/personas", personaController.registrarPersona); //Crear
  router.get("/personas", personaController.obtenerPersonas); //Ver lista
  router.get("/personas/:id", personaController.obtenerPersonaPorId); //ver por ID
  router.get("/personasids", personaController.obtenerPersonasPorIds);
  router.put("/personas/:id/eliminar", personaController.eliminarPersonaPorId); //Eliminar por ID
  router.put("/personas/:id", personaController.actualizarPersonaPorId); //Actualizar por ID
  router.post("/signin", usuariosController.registrarUsuario); //iniciar
  router.post("/login", usuariosController.autenticarUsuario);
  router.get("/usuarios", auth, usuariosController.obtenerUsuarios);
  router.get("/usuarios/inactivos", auth, usuariosController.obtenerUsuariosI);
  router.put(
    "/usuarios/:id",
    upload.single("fotoPerfil"),

    auth,
    vRol(["admin", "super"]),

    usuariosController.actualizarUsuario
  );
  router.get("/usuarios/:id", auth, usuariosController.obtenerUsuario);
  router.delete(
    "/usuarios/:id",
    auth,
    vRol(["admin", "super"]),
    usuariosController.eliminarUsuario
  );
  return router;
};
