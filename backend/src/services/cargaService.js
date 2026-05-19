const ExcelJS = require('exceljs');
const personaService = require('./personaService');

// Normaliza valores limpiando espacios y pasándolos a mayúsculas
const normalizar = (valor) => {
    if (!valor) return "";
    return valor.toString().trim().toUpperCase();
};

const procesarExcel = async (filePath, tipo_persona, id_ficha) => {
    const inicio = Date.now();
    
    // 1. Iniciamos el lector de ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Seleccionamos la primera hoja del documento
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throw new Error('El archivo Excel está vacío o no tiene hojas.');
    }

    let encabezadosIndex = -1;
    let mapaEncabezados = {}; // Guardaremos { 'NUMERO DE DOCUMENTO': 2 (columna B) }

    // 2. Buscar dinámicamente dónde están los encabezados
    // Recorremos las primeras 15 filas (por si el SENA pone logos arriba)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (encabezadosIndex !== -1) return; // Si ya los encontramos, ignoramos el resto
        
        const textoFila = row.values.join(' ').toLowerCase();
        
        // Criterio de búsqueda de la fila de títulos
        if (textoFila.includes('documento') && textoFila.includes('nombre')) {
            encabezadosIndex = rowNumber;
            
            // Mapeamos en qué columna (índice) está cada dato
            row.eachCell((cell, colNumber) => {
                const titulo = normalizar(cell.value);
                mapaEncabezados[titulo] = colNumber;
            });
        }
    });

    if (encabezadosIndex === -1) {
        throw new Error("No se encontró una fila de encabezados válida (debe contener 'documento' y 'nombre').");
    }

    // Identificamos las columnas clave basándonos en cómo se llaman en el Excel
    const colDoc = mapaEncabezados['NÚMERO DE DOCUMENTO'] || mapaEncabezados['DOCUMENTO'] || mapaEncabezados['NUMERO DE DOCUMENTO'];
    const colTipoDoc = mapaEncabezados['TIPO DE DOCUMENTO'] || mapaEncabezados['TIPO DOCUMENTO'];
    const colNombres = mapaEncabezados['NOMBRE'] || mapaEncabezados['NOMBRES'];
    const colApellidos = mapaEncabezados['APELLIDOS'] || mapaEncabezados['APELLIDO'];
    const colEstado = mapaEncabezados['ESTADO']; // Importante para aprendices

    const mapa = new Map();

    // 3. Leer los datos a partir de la fila siguiente a los encabezados
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber <= encabezadosIndex) return; // Saltamos los títulos

        const documentoRaw = row.getCell(colDoc).value;
        const tipoDocRaw = row.getCell(colTipoDoc).value;
        const nombresRaw = row.getCell(colNombres).value;
        const apellidosRaw = row.getCell(colApellidos).value;
        const estadoRaw = colEstado ? row.getCell(colEstado).value : 'ACTIVO'; // Si no hay columna estado, asumimos activo

        if (!documentoRaw) return; // Ignora filas vacías

        const key = documentoRaw.toString().trim();

        // Evita duplicados dentro del mismo Excel
        if (!mapa.has(key)) {
            mapa.set(key, {
                tipo_doc: normalizar(tipoDocRaw),
                numero_documento: key,
                nombres: normalizar(nombresRaw),
                apellidos: normalizar(apellidosRaw),
                estado: normalizar(estadoRaw),
                tipo_persona: Number(tipo_persona),
                id_ficha: id_ficha ? Number(id_ficha) : null
            });
        }
    });

    const personasUnicas = Array.from(mapa.values());
    const resultados = [];
    let insertados = 0;
    let actualizados = 0;
    let omitidos = 0;

    // 4. Inserta o actualiza personas en la BD
    for (const persona of personasUnicas) {
        try {
            const resultado = await personaService.guardarOActualizarPersona(persona);
            resultados.push(resultado);

            if (resultado.status === "insertado") insertados++;
            else if (resultado.status === "actualizado") actualizados++;
            else if (resultado.status === "omitido") omitidos++;
            
        } catch (error) {
            resultados.push({
                status: "error",
                documento: persona.numero_documento,
                mensaje: error.message
            });
        }
    }

    const tiempoMs = Date.now() - inicio;

    // Respuesta limpia
    return {
        totalFilasLeidas: personasUnicas.length,
        estadisticas: { insertados, actualizados, omitidos, errores: resultados.filter(r => r.status === 'error').length },
        tiempoEjecucionMs: tiempoMs,
        detalle: resultados
    };
};

module.exports = {
    procesarExcel
};