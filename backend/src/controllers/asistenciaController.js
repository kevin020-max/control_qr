const asistenciaModel = require('../models/asistenciaModel');

const calcularTiempo = (entrada, salida) => {

    if (!entrada || !salida) {
        return '--';
    }

    const inicio = new Date(entrada);
    const fin = new Date(salida);

    const diferencia = fin - inicio;

    const horas = Math.floor(
        diferencia / (1000 * 60 * 60)
    );

    const minutos = Math.floor(
        (diferencia % (1000 * 60 * 60))
        / (1000 * 60)
    );

    return `${horas}h ${minutos}m`;
};

const formatearHora = (fecha) => {

    if (!fecha) {
        return '--';
    }

    return new Date(fecha)
        .toLocaleTimeString(
            'es-CO',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );
};

const consultarAsistencia = async (req, res) => {

    try {

        const { id_ficha, fecha } = req.query;

        if (!id_ficha || !fecha) {

            return res.status(400).json({
                status: 'error',
                message: 'Ficha y fecha son obligatorias'
            });
        }

        const registros =
            await asistenciaModel.obtenerAsistenciaPorFichaYFecha(
                id_ficha,
                fecha
            );

        const aprendices = registros.map(
            (item) => {

                const asistio =
                    item.fecha_entrada !== null;

                return {
                    documento: item.numero_documento,
                    nombre: `${item.nombres} ${item.apellidos}`,
                    horaIngreso: formatearHora(
                        item.fecha_entrada
                    ),
                    horaSalida: formatearHora(
                        item.fecha_salida
                    ),
                    tiempoTotal: calcularTiempo(
                        item.fecha_entrada,
                        item.fecha_salida
                    ),
                    estado: asistio
                        ? 'Asistió'
                        : 'Ausente'
                };
            }
        );

        const totalAprendices =
            aprendices.length;

        const presentes =
            aprendices.filter(
                a => a.estado === 'Asistió'
            ).length;

        const ausentes =
            totalAprendices - presentes;

        res.status(200).json({
            status: 'success',
            totalAprendices,
            presentes,
            ausentes,
            aprendices
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 'error',
            message: 'Error al consultar asistencia'
        });
    }
};

module.exports = {
    consultarAsistencia
};