const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const asistenciaPdfRoutes = require('./routes/asistenciaPdfRoutes');
const AppError = require('./errors/AppError');
const httpStatus = require('./constants/httpStatus');
const authRoutes = require('./routes/authRoutes');
const controlAccesoRoutes = require('./routes/controlAccesoRoutes');
const visitanteRoutes = require('./routes/visitanteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const aprendizRoutes = require('./routes/aprendizRoutes');
const qrRoutes = require('./routes/qrRoutes');
const cargaRoutes = require('./routes/cargaRoutes');
const fichaRoutes = require('./routes/fichaRoutes');
const personaRoutes = require('./routes/personaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const { iniciarTareasProgramadas } = require('./tasks/cronReportes');
const app = express();

app.use(helmet());

app.use(morgan('dev'));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/api/saludo', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: '¡Hola React! El backend está funcionando perfectamente'
  });
});

iniciarTareasProgramadas();

app.use('/api/auth', authRoutes);
app.use('/api/accesos', controlAccesoRoutes);
app.use('/api/visitantes', visitanteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/aprendices', aprendizRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/carga-masiva', cargaRoutes);
app.use('/api/fichas', fichaRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/asistencia', asistenciaRoutes);

app.use(
  '/api/asistencia/pdf',
  asistenciaPdfRoutes
);

app.use((req, res, next) => {
  next(
    new AppError(
      `No se puede encontrar ${req.originalUrl} en este servidor`,
      httpStatus.NOT_FOUND
    )
  );
});

app.use((err, req, res, next) => {
  err.statusCode =
    err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  err.status =
    err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;