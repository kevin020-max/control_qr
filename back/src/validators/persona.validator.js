export const validarPersona = (req, res, next) => {
    const { numero_documento, tipo_doc, nombres, apellidos } = req.body;

    if (!numero_documento || !tipo_doc || !nombres || !apellidos) {
        return res.status(400).json({
        error: "Faltan campos obligatorios"
        });
    }

    next();
};