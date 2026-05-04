import { procesarExcel } from "../services/carga.service.js";
import fs from "fs";

// Controlador que maneja la subida del archivo Excel
export const subirArchivoController = async (req, res) => {
    try {
        // Validar que se haya subido un archivo
        if (!req.file) {
        return res.status(400).json({
            error: "No se envió ningún archivo"
        });
        }

        // Ruta temporal del archivo subido
        const filePath = req.file.path;

        // Tipo de persona (viene desde la ruta: aprendices, instructores, etc.)
        const tipo_persona = req.tipo_persona;

        // id de la ficha (viene desde el frontend en form-data)
        const id_ficha = req.body.id_ficha || null;

        // Procesar el archivo Excel
        const resultado = await procesarExcel(
        filePath,
        tipo_persona,
        id_ficha
        );

        // Eliminar el archivo temporal después de procesarlo
        fs.unlinkSync(filePath);

        // Respuesta exitosa
        res.json(resultado);

    } catch (error) {
        console.error("Error en carga:", error.message);

        res.status(500).json({
        error: error.message
        });
    }
};