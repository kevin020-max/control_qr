import { Router } from "express";
import { crearPersonaController } from "../controllers/persona.controller.js";
import { validarPersona } from "../validators/persona.validator.js";

const router = Router();

router.post("/", validarPersona, crearPersonaController);

export default router;