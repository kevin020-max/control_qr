import { pool } from "../config/conexion_bd.js";

// Buscar persona por documento
export const findPersonaByDocumento = async (numero_documento) => {
  const [rows] = await pool.query(
    "SELECT * FROM personas WHERE numero_documento = ?",
    [numero_documento]
  );

  return rows[0];
};

// Insertar persona 
export const insertPersona = async (persona) => {
  const {
    tipo_doc,
    numero_documento,
    nombres,
    apellidos,
    tipo_persona,
    tipo_estado,
    id_ficha
  } = persona;

  await pool.query(
    `INSERT INTO personas 
    (tipo_doc, numero_documento, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha) 
    VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
    [
      tipo_doc,
      numero_documento,
      nombres,
      apellidos,
      tipo_persona,
      tipo_estado,
      id_ficha
    ]
  );
};

// Actualizar persona
export const updatePersona = async (persona) => {
  const {
    tipo_doc,
    numero_documento,
    nombres,
    apellidos,
    tipo_persona,
    tipo_estado,
    id_ficha
  } = persona;

  await pool.query(
    `UPDATE personas 
     SET tipo_doc = ?, nombres = ?, apellidos = ?, tipo_persona = ?, tipo_estado = ?, id_ficha = ?
     WHERE numero_documento = ?`,
    [
      tipo_doc,
      nombres,
      apellidos,
      tipo_persona,
      tipo_estado,
      id_ficha,
      numero_documento
    ]
  );
};