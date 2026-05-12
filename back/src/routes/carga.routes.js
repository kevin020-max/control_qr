import { Router } from "express";
import multer from "multer";
import { subirArchivoController } from "../controllers/carga.controller.js";

const router = Router();

// Configuración de multer (subida de archivos)
const upload = multer({ dest: "uploads/" });

// Cada endpoint define el tipo de persona

// Aprendices
router.post("/aprendices", upload.single("archivo"), (req, res) => {
    req.tipo_persona = 1;
    subirArchivoController(req, res);
});

// Instructores
router.post("/instructores", upload.single("archivo"), (req, res) => {
    req.tipo_persona = 2;
    subirArchivoController(req, res);
});

// Funcionarios
router.post("/funcionarios", upload.single("archivo"), (req, res) => {
    req.tipo_persona = 3;
    subirArchivoController(req, res);
});



export default router;