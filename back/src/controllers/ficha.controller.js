import { createFicha, getFichas } from "../models/ficha.model.js";

export const crearFicha = async (req, res) => {
    try {
        const { numero_ficha, nombre } = req.body;

        const id = await createFicha({ numero_ficha, nombre });

        res.json({
        message: "Ficha creada",
        id_ficha: id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarFichas = async (req, res) => {
    try {
        const fichas = await getFichas();
        res.json(fichas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};