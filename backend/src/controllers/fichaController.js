const fichaModel = require('../models/fichaModel');
const catchAsync = require('../errors/catchAsync');

const crearFicha = catchAsync(async (req, res, next) => {
    const { numero_ficha, nombre } = req.body;
    const id = await fichaModel.createFicha({ numero_ficha, nombre });

    res.status(201).json({
        status: 'success',
        message: 'Ficha creada',
        data: { id_ficha: id }
    });
});

const listarFichas = catchAsync(async (req, res, next) => {
    const fichas = await fichaModel.getFichas();
    
    res.status(200).json({
        status: 'success',
        data: fichas
    });
});

module.exports = {
    crearFicha,
    listarFichas
};