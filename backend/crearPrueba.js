// crearPrueba.js
const bcrypt = require('bcrypt');
const pool = require('./src/config/conexion_db'); // Asegúrate de que esta ruta sea correcta

const crearUsuarioAdmin = async () => {
    try {
        console.log('Iniciando creación de credenciales para el Administrador...');

        // 1. Definimos los datos del Administrador.
        // Usaremos tu número de documento que YA EXISTE en la tabla 'personas' gracias al script SQL.
        const numeroDocumento = 1114309103; 
        const contrasenaPlana = 'admin123';
        
        // 2. Encriptamos la contraseña usando bcrypt
        // El '10' es el "costo" o nivel de seguridad del algoritmo (estándar seguro en la industria)
        const contrasenaEncriptada = await bcrypt.hash(contrasenaPlana, 10);

        // 3. Insertamos el usuario en la base de datos
        // Usamos IGNORE para evitar errores si ejecutas este archivo varias veces.
        // OJO: Usamos 'contrasenia' (sin la ñ) y asignamos estado = 1 (Activo)
        const sql = `
            INSERT IGNORE INTO usuarios (numero_documento, contrasenia, estado, id_rol) 
            VALUES (?, ?, 1, 1)
        `;
        
        // Ejecutamos la consulta. Usamos execute (o query dependiendo de tu config) pasando los datos de forma segura
        await pool.execute(sql, [numeroDocumento, contrasenaEncriptada]);

        console.log('✅ ¡Credenciales del Administrador creadas con éxito!');
        console.log(`👉 Documento (Login): ${numeroDocumento}`);
        console.log(`👉 Contraseña: ${contrasenaPlana}`);
        
        // 4. Apagamos la conexión a la base de datos y salimos del script
        process.exit(0); 
    } catch (error) {
        console.error('❌ Error al crear el usuario:', error);
        process.exit(1);
    }
};

// Ejecutamos la función
crearUsuarioAdmin();