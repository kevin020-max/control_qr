import {
  findPersonaByDocumento,
  insertPersona,
  updatePersona
} from "../models/persona.model.js";

// Limpia texto
const limpiarTexto = (texto) => {
  if (!texto) return "";

  return texto
    .toString()
    .trim()
    .toUpperCase();
};

// Convierte documento a número
const limpiarDocumento = (doc) => {
  if (!doc) return null;

  return parseInt(doc.toString().trim());
};

// Estados válidos para aprendices activos
const estadosValidosAprendiz = [
  "EN FORMACION",
  "CONDICIONADO",
  "INDUCCION"
];

// Valida si un estado es activo para aprendices
const esEstadoActivoAprendiz = (estado) => {
  const valor = limpiarTexto(estado);

  return estadosValidosAprendiz.includes(valor);
};

export const guardarOActualizarPersona = async (data) => {

  let tipo_estado = 1;

  // Aprendices
  if (data.tipo_persona === 1) {

    const activo = esEstadoActivoAprendiz(data.estado);

    tipo_estado = activo ? 1 : 2;
  }

  // Instructores y funcionarios siempre activos
  if (
    data.tipo_persona === 2 ||
    data.tipo_persona === 3
  ) {
    tipo_estado = 1;
  }

  const persona = {
    tipo_doc: limpiarTexto(data.tipo_doc),
    numero_documento: limpiarDocumento(data.numero_documento),
    nombres: limpiarTexto(data.nombres),
    apellidos: limpiarTexto(data.apellidos),
    tipo_persona: data.tipo_persona,
    tipo_estado,
    id_ficha: data.id_ficha || null
  };

  if (!persona.numero_documento) {
    return {
      status: "error",
      mensaje: "Documento inválido"
    };
  }

  const existe = await findPersonaByDocumento(
    persona.numero_documento
  );

  // Si ya existe  se actualiza
  if (existe) {

    await updatePersona(persona);

    return {
      status: "actualizado",
      documento: persona.numero_documento
    };
  }


  // SOLO insertar aprendices activos
  if (
    persona.tipo_persona === 1 &&
    persona.tipo_estado === 2
  ) {
    return {
      status: "omitido",
      documento: persona.numero_documento,
      mensaje: "Aprendiz no activo"
    };
  }

  await insertPersona(persona);

  return {
    status: "insertado",
    documento: persona.numero_documento
  };
};