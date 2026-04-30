// crearPrueba.js
const bcrypt = require('bcrypt');
const pool = require('./src/config/conexion_db');

const crearUsuarioAdmin = async () => {
    try {
        console.log('Iniciando creación de usuario de prueba...');

        // 1. Asegurarnos de que exista al menos el Rol 1 (Administrador) en la base de datos
        await pool.query("INSERT IGNORE INTO roles (id_rol, nombre_rol) VALUES (1, 'Administrador')");

        // 2. Encriptar la contraseña 'admin123'
        // El '10' es el "costo" o nivel de seguridad del algoritmo (estándar en la industria)
        const contrasenaPlana = 'admin123';
        const contrasenaEncriptada = await bcrypt.hash(contrasenaPlana, 10);

        // 3. Insertar el usuario en la base de datos
        // Usamos IGNORE para que no dé error si ya corriste el script antes (por el UNIQUE del usuario)
        const sql = `INSERT IGNORE INTO usuarios (numero_documento, contraseña, id_rol) VALUES ('123456789', ?, 1)`;
        await pool.query(sql, [contrasenaEncriptada]);

        console.log('✅ ¡Usuario creado con éxito!');
        console.log('👉 Usuario: operario_principal');
        console.log('👉 Contraseña: admin123');
        
        process.exit(0); // Apaga el script automáticamente al terminar
    } catch (error) {
        console.error('❌ Error al crear el usuario:', error);
        process.exit(1);
    }
};

crearUsuarioAdmin();