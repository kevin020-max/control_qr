const personaModel = require("../models/personaModel");

// Limpia texto
const limpiarTexto = (texto) => {
    if (!texto) return "";
    return texto.toString().trim().toUpperCase();
};

// Convierte documento a número seguro
const limpiarDocumento = (doc) => {
    if (!doc) return null;
    return parseInt(doc.toString().trim());
};

// Estados válidos del SENA para considerar a un aprendiz activo
const estadosValidosAprendiz = [
    "EN FORMACION",
    "EN FORMACIÓN", // Soporte para tildes
    "CONDICIONADO",
    "INDUCCION",
    "INDUCCIÓN"
];

const esEstadoActivoAprendiz = (estado) => {
    const valor = limpiarTexto(estado);
    return estadosValidosAprendiz.includes(valor);
};

const guardarOActualizarPersona = async (data) => {
    let tipo_estado = 1; // 1 = Activo, 2 = Inactivo

    // Regla de Negocio: Aprendices
    if (data.tipo_persona === 1) {
        const activo = esEstadoActivoAprendiz(data.estado);
        tipo_estado = activo ? 1 : 2;
    }

    // Regla de Negocio: Instructores y funcionarios siempre activos por defecto al subirlos
    if (data.tipo_persona === 2 || data.tipo_persona === 3) {
        tipo_estado = 1;
    }

    const persona = {
        tipo_doc: limpiarTexto(data.tipo_doc),
        numero_documento: limpiarDocumento(data.numero_documento),
        nombres: limpiarTexto(data.nombres),
        apellidos: limpiarTexto(data.apellidos),
        tipo_persona: data.tipo_persona,
        tipo_estado: tipo_estado,
        id_ficha: data.id_ficha || null
    };

    if (!persona.numero_documento) {
        return { status: "error", mensaje: "Documento inválido o vacío" };
    }

    // Busca en la Base de Datos si la persona ya existe
    const existe = await personaModel.findPersonaByDocumento(persona.numero_documento);

    // Si ya existe en la BD, la actualiza (Ej: un aprendiz pasó a estar Inactivo)
    if (existe) {
        // Asumiendo que tu updatePersona en el modelo usa el ID de la persona o el documento
        persona.id_persona = existe.id_persona; 
        await personaModel.updatePersona(persona);
        
        return {
            status: "actualizado",
            documento: persona.numero_documento
        };
    }

    // Si NO existe, y es un aprendiz inactivo, lo omitimos (no lo guardamos)
    if (persona.tipo_persona === 1 && persona.tipo_estado === 2) {
        return {
            status: "omitido",
            documento: persona.numero_documento,
            mensaje: "Aprendiz no activo (Cancelado/Retirado)"
        };
    }

    // Si pasó los filtros, lo insertamos nuevo
    await personaModel.insertPersona(persona);

    return {
        status: "insertado",
        documento: persona.numero_documento
    };
};

module.exports = {
    guardarOActualizarPersona
};