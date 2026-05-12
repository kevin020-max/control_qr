import { pool } from "../config/conexion_bd.js";

export const createFicha = async (ficha) => {
    const [result] = await pool.query(
        "INSERT INTO ficha (numero_ficha, nombre) VALUES (?, ?)",
        [ficha.numero_ficha, ficha.nombre]
    );

    return result.insertId;
};

export const getFichas = async () => {
    const [rows] = await pool.query("SELECT * FROM ficha");
    return rows;
};