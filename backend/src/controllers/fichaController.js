// src/controllers/fichaController.js
const fichaModel = require('../models/fichaModel');
const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

// 1. CONTROLADOR PARA CREAR FICHA (Queda igual)
const crearFicha = catchAsync(async (req, res, next) => {
    const { numero_ficha, nombre } = req.body;

    if (!numero_ficha || !nombre) {
        return next(new AppError('El número de ficha y el nombre del programa son obligatorios.', httpStatus.BAD_REQUEST));
    }

    const fichaExiste = await fichaModel.buscarPorNumero(numero_ficha);
    if (fichaExiste) {
        return next(new AppError(`La ficha número ${numero_ficha} ya se encuentra registrada en el sistema.`, httpStatus.BAD_REQUEST));
    }

    const id_ficha = await fichaModel.crearFicha(numero_ficha, nombre);

    res.status(httpStatus.CREATED).json({
        status: 'success',
        message: 'Ficha académica registrada correctamente en la plataforma.',
        data: { id_ficha, numero_ficha, nombre }
    });
});

// 2. CONTROLADOR PARA LISTAR FICHAS (Queda igual)
const listarFichas = catchAsync(async (req, res, next) => {
    const fichas = await fichaModel.getFichas();
    res.status(200).json({
        status: 'success',
        data: fichas
    });
});

// 3. NUEVO: CONTROLADOR PARA EDITAR/ACTUALIZAR FICHA
const editarFicha = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Extraemos el id_ficha de la URL
    const { numero_ficha, nombre } = req.body;

    if (!numero_ficha || !nombre) {
        return next(new AppError('Todos los campos son obligatorios para actualizar.', httpStatus.BAD_REQUEST));
    }

    // Regla de negocio: Validar que el nuevo número no choque con OTRA ficha existente
    const fichaDuplicada = await fichaModel.buscarPorNumero(numero_ficha);
    if (fichaDuplicada && fichaDuplicada.id_ficha !== Number(id)) {
        return next(new AppError(`El número de ficha ${numero_ficha} ya está siendo usado por otro programa.`, httpStatus.BAD_REQUEST));
    }

    const filasActualizadas = await fichaModel.actualizarFicha(id, numero_ficha, nombre);
    if (filasActualizadas === 0) {
        return next(new AppError('No se encontró ninguna ficha con el ID especificado.', httpStatus.NOT_FOUND));
    }

    res.status(200).json({
        status: 'success',
        message: 'Ficha académica actualizada correctamente.'
    });
});

// 4. NUEVO: CONTROLADOR PARA ELIMINAR FICHA (CON COMPROBACIÓN DE LLAVE FORÁNEA)
const eliminarFicha = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Escudo de integridad relacional:
    const totalAprendices = await fichaModel.contarAprendicesEnFicha(id);
    if (totalAprendices > 0) {
        return next(new AppError(`No se puede eliminar la ficha porque tiene ${totalAprendices} aprendices asignados. Reubíquelos o elimínelos primero.`, httpStatus.BAD_REQUEST));
    }

    const filasEliminadas = await fichaModel.eliminarFichaFisico(id);
    if (filasEliminadas === 0) {
        return next(new AppError('La ficha no existe o ya ha sido removida del sistema.', httpStatus.NOT_FOUND));
    }

    res.status(200).json({
        status: 'success',
        message: 'La ficha ha sido eliminada del sistema de forma permanente.'
    });
});

module.exports = {
    crearFicha,
    listarFichas,
    editarFicha,    // <-- Exportamos las nuevas funciones
    eliminarFicha
};