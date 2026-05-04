import { Router } from "express";
import { crearFicha, listarFichas } from "../controllers/ficha.controller.js";

const router = Router();

router.post("/", crearFicha);
router.get("/", listarFichas);

export default router;