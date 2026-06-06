const express = require('express');
const router = express.Router();
const asistenciaPdfController = require('../controllers/asistenciaPdfController');

router.get(
    '/',
    asistenciaPdfController.exportarPdf
);

module.exports = router;