import xlsx from "xlsx";
import { guardarOActualizarPersona } from "./persona.service.js";

// Normaliza valores
const normalizar = (valor) => {
    if (!valor) return "";

    return valor
        .toString()
        .trim()
        .toUpperCase();
};

export const procesarExcel = async (
    filePath,
    tipo_persona,
    id_ficha
) => {

    // Inicia medición de tiempo
    const inicio = Date.now();

    // Lee el archivo Excel
    const workbook = xlsx.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    // Convierte la hoja en matriz
    const filas = xlsx.utils.sheet_to_json(
        sheet,
        { header: 1 }
    );

    let encabezadosIndex = -1;

    // Busca la fila donde están los encabezados reales
    for (let i = 0; i < filas.length; i++) {

        const fila = filas[i];

        if (!fila) continue;

        const texto = fila
        .join(" ")
        .toLowerCase();

        if (
        texto.includes("tipo") &&
        texto.includes("documento") &&
        texto.includes("nombre")
        ) {
        encabezadosIndex = i;
        break;
        }
    }

    // Si no encuentra encabezados
    if (encabezadosIndex === -1) {
        throw new Error(
        "No se encontró la fila de encabezados"
        );
    }

    const encabezados = filas[encabezadosIndex];

    // Lee datos desde la fila de encabezados
    const data = xlsx.utils.sheet_to_json(sheet, {
        header: encabezados,
        range: encabezadosIndex + 1
    });

    // Elimina duplicados por documento
    const mapa = new Map();

    for (const fila of data) {

        // Toma solo las columnas necesarias
        const documento = fila["Número de Documento"];
        const tipoDoc = fila["Tipo de Documento"];
        const nombres = fila["Nombre"];
        const apellidos = fila["Apellidos"];
        const estado = fila["Estado"];

        // Ignora filas inválidas
        if (
        !documento ||
        documento === "Número de Documento"
        ) {
        continue;
        }

        const key = documento
        .toString()
        .trim();

        // Evita duplicados
        if (!mapa.has(key)) {

        mapa.set(key, {
            tipo_doc: normalizar(tipoDoc),
            numero_documento: key,
            nombres: normalizar(nombres),
            apellidos: normalizar(apellidos),
            estado: normalizar(estado),
            tipo_persona,
            id_ficha
        });
        }
    }

    const personasUnicas = Array.from(
        mapa.values()
    );

    const resultados = [];

    let insertados = 0;
    let actualizados = 0;
    let omitidos = 0;

    // Inserta o actualiza personas
    for (const persona of personasUnicas) {

        try {

        const resultado =
            await guardarOActualizarPersona(persona);

        resultados.push(resultado);

        if (resultado.status === "insertado") {
            insertados++;
        }

        if (resultado.status === "actualizado") {
            actualizados++;
        }

        if (resultado.status === "omitido") {
            omitidos++;
        }

        } catch (error) {

        resultados.push({
            status: "error",
            mensaje: error.message
        });
        }
    }

    // Calcula tiempo de ejecución
    const fin = Date.now();

    const tiempoMs = fin - inicio;

    // Logs
    console.log("Total de filas:", data.length);

    console.log(
        "Personas únicas:",
        personasUnicas.length
    );

    console.log("Insertados:", insertados);

    console.log("Actualizados:", actualizados);

    console.log("Omitidos:", omitidos);

    console.log(
        "Tiempo de ejecución:",
        tiempoMs + " ms"
    );

    // Respuesta final
    return {
        totalFilas: data.length,
        personasUnicas: personasUnicas.length,
        insertados,
        actualizados,
        omitidos,
        tiempoMs,
        resultados
    };
};