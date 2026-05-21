// src/models/ficha.model.js
const db = require("../config/conexion_db"); 

// 1. Buscar si una ficha ya existe por su número único
const buscarPorNumero = async (numero_ficha) => {
    const [rows] = await db.execute('SELECT id_ficha FROM ficha WHERE numero_ficha = ?', [numero_ficha]);
    return rows[0];
};

// 2. CORREGIDO: Ahora recibe las dos variables sueltas directamente en los argumentos
const crearFicha = async (numero_ficha, nombre) => {
    const [result] = await db.execute(
        "INSERT INTO ficha (numero_ficha, nombre) VALUES (?, ?)",
        [numero_ficha, nombre] // <-- Inyecta directamente las variables al array posicional de MySQL
    );

    return result.insertId;
};

// 3. OPTIMIZADO: Cambiamos .query por .execute para estandarizar el rendimiento de MySQL2
const getFichas = async () => {
    const [rows] = await db.execute("SELECT * FROM ficha ORDER BY id_ficha DESC");
    return rows;
};

// 4. NUEVO: Verificar si la ficha tiene aprendices asignados (Evita errores de llave foránea)
const contarAprendicesEnFicha = async (id_ficha) => {
    const [rows] = await db.execute(
        'SELECT COUNT(*) as total FROM personas WHERE id_ficha = ?', 
        [id_ficha]
    );
    return rows[0].total;
};

// 5. NUEVO: Actualizar los datos de una ficha
const actualizarFicha = async (id_ficha, numero_ficha, nombre) => {
    const [result] = await db.execute(
        'UPDATE ficha SET numero_ficha = ?, nombre = ? WHERE id_ficha = ?',
        [numero_ficha, nombre, id_ficha]
    );
    return result.affectedRows;
};

// 6. NUEVO: Eliminar físicamente la ficha de la base de datos
const eliminarFichaFisico = async (id_ficha) => {
    const [result] = await db.execute(
        'DELETE FROM ficha WHERE id_ficha = ?',
        [id_ficha]
    );
    return result.affectedRows;
};

module.exports = {
    buscarPorNumero,
    crearFicha,
    getFichas,
    contarAprendicesEnFicha,  // <-- Exportamos las nuevas funciones
    actualizarFicha,
    eliminarFichaFisico
};