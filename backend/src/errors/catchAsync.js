// src/errors/catchAsync.js

// Asignamos nuestra función contenedora a una constante
// Esta función recibe otra función (fn) como parámetro (nuestro controlador)
const catchAsync = (fn) => {
    // Retornamos una nueva función que Express podrá ejecutar recibiendo req, res y next
    return (req, res, next) => {
        // Ejecutamos la función original. Si devuelve un error (promesa rechazada), 
        // el .catch() lo atrapa y se lo pasa a 'next' para que nuestro manejador global lo procese.
        fn(req, res, next).catch(next); 
    };
};

// Exportamos la constante
module.exports = catchAsync;