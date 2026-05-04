import {
  findPersonaByDocumento,
  insertPersona,
  updatePersona
} from "../models/persona.model.js";

// Limpia texto
const limpiarTexto = (texto) => {
  if (!texto) return "";
  return texto.toString().trim().toUpperCase();
};

// Convierte documento a número
const limpiarDocumento = (doc) => {
  if (!doc) return null;
  return parseInt(doc.toString().trim());
};

// Mapea estado
const mapEstado = (estado) => {
  if (!estado) return 2;

  const valor = estado.toString().trim().toUpperCase();

  if (valor === "EN FORMACION") {
    return 1;
  }

  return 2;
};

export const guardarOActualizarPersona = async (data) => {
  const persona = {
    tipo_doc: limpiarTexto(data.tipo_doc),
    numero_documento: limpiarDocumento(data.numero_documento),
    nombres: limpiarTexto(data.nombres),
    apellidos: limpiarTexto(data.apellidos),
    tipo_persona: data.tipo_persona || 1,
    tipo_estado: mapEstado(data.estado),
    id_ficha: data.id_ficha || null,

    // Fecha actual automática
    fecha_registro: new Date().toISOString().split("T")[0]
  };

  if (!persona.numero_documento) {
    return {
      status: "error",
      mensaje: "Documento inválido"
    };
  }

  const existe = await findPersonaByDocumento(persona.numero_documento);

  if (existe) {
    await updatePersona(persona);
    return {
      status: "actualizado",
      documento: persona.numero_documento
    };
  }

  await insertPersona(persona);

  return {
    status: "insertado",
    documento: persona.numero_documento
  };
};