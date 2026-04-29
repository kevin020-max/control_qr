const db = require('../config/conexion_db');

/**
 * Busca si una persona tiene un ingreso activo (sin fecha de salida).
 */

const buscarIngresoActivo = async (idPersona) => {
  // Buscamos el registro más reciente de la persona donde la salida sea nula.
  const sql = `
    SELECT id_control, fecha_entrada
    FROM control_acceso
    WHERE id_persona = ? AND fecha_salida IS NULL
    LIMIT 1
  `;
  const [filas] = await db.query(sql, [idPersona]);
  return filas[0]; //Retorna el registro o undefined
};

//Registra un nuevo ingreso en la institucion
const registrarEntrada = async (idPersona, idUsuario) => {
  const sql = `
    INSERT INTO control_acceso (fecha_entrada, id_persona, id_usuario)
    VALUES (NOW(), ?, ?)
  `;
  //Estamos usando la función NOW() directamente en el SQL. ¿Por qué? Porque es más preciso usar la hora del servidor de base de datos que la hora de la computadora donde corre Node.js. Así evitamos desfases de segundos.

  const [resultado] = await db.query(sql, [idPersona, idUsuario]);
  return resultado.insertId;
};

//Registra la salida actualizando un ingreso previo
const registrarSalida = async (idControl) => {
  const sql = `
    UPDATE control_acceso
    SET fecha_salida = NOW()
    WHERE id_control = ?
  `;
  const [resultado] = await db.query(sql, [idControl]);
  return resultado.affectedRows > 0;
};

module.exports = {
  buscarIngresoActivo,
  registrarEntrada,
  registrarSalida
};