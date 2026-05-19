// Usamos require en lugar de import
const pool = require("../config/conexion_db"); // Asegúrate de que el nombre del archivo de conexión coincida con el tuyo

const createFicha = async (ficha) => {
    const [result] = await pool.query(
        "INSERT INTO ficha (numero_ficha, nombre) VALUES (?, ?)",
        [ficha.numero_ficha, ficha.nombre]
    );

    return result.insertId;
};

const getFichas = async () => {
    const [rows] = await pool.query("SELECT * FROM ficha");
    return rows;
};

// Exportamos las funciones al estilo CommonJS
module.exports = {
    createFicha,
    getFichas
};