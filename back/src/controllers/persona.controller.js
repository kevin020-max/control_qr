import { guardarOActualizarPersona } from "../services/persona.service.js";

export const crearPersonaController = async (req, res) => {
    try {
        const result = await guardarOActualizarPersona(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
        error: error.message
        });
    }
};