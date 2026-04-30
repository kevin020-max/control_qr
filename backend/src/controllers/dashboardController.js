// src/controllers/dashboardController.js
const catchAsync = require('../errors/catchAsync');
const httpStatus = require('../constants/httpStatus');
const DashboardModel = require('../models/dashboardModel');

const obtenerResumen = catchAsync(async (req, res, next) => {
  // Llamamos a nuestro modelo para que haga el trabajo duro
  const estadisticas = await DashboardModel.obtenerEstadisticasHoy();

  // Devolvemos el JSON de éxito a React
  res.status(httpStatus.OK).json({
    status: 'success',
    data: estadisticas
  });
});

module.exports = { obtenerResumen };