const personaService = require('../services/personaService');
const catchAsync = require('../errors/catchAsync');

const crearPersona = catchAsync(async (req, res, next) => {
    const result = await personaService.guardarOActualizarPersona(req.body);
    
    res.status(200).json({
        status: 'success',
        data: result
    });
});

module.exports = {
    crearPersona
};