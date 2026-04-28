// src/errors/AppError.js

// Asignamos la clase a una constante para que su referencia sea inmutable (no cambie)
const AppError = class extends Error {
    constructor(message, statusCode) {
        // 'super' llama al constructor de la clase padre (Error de Node.js) y le pasa el mensaje
        super(message); 

        // Guardamos el código HTTP (ej: 404, 400, 500)
        this.statusCode = statusCode; 
        
        // Operador ternario: Si el código empieza con '4' (ej 404), el estado es 'fail' (fallo del cliente).
        // Si empieza con otra cosa (ej 500), es 'error' (fallo del servidor).
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; 
        
        // Esta bandera nos indica que es un error controlado por nosotros, no un fallo inesperado de Node.js
        this.isOperational = true; 

        // Capturamos la traza de la pila (stack trace) para saber en qué línea exacta ocurrió el error
        Error.captureStackTrace(this, this.constructor); 
    }
};

// Exportamos la constante para poder usarla en otros archivos
module.exports = AppError;