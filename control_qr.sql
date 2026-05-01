CREATE DATABASE control_qr;
USE control_qr;

CREATE TABLE estado(
    tipo_estado INT PRIMARY KEY,
    tipo_de_estado VARCHAR(20)
);

INSERT INTO estado VALUES
(1, 'activo'),
(2, 'inactivo');

CREATE TABLE tipo_persona(
    tipo_persona INT PRIMARY KEY,
    nombre_tipo VARCHAR(40) NOT NULL
);

INSERT INTO tipo_persona (tipo_persona, nombre_tipo) VALUES
(1, 'aprendiz'),
(2, 'instructor'),
(3, 'funcionario'),
(4, 'visitante');

CREATE TABLE ficha (
    id_ficha INT AUTO_INCREMENT PRIMARY KEY,
    numero_ficha VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE personas(
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    numero_documento INT UNIQUE,
    tipo_doc VARCHAR(30),
    nombres VARCHAR(30),
    apellidos VARCHAR(30),
    fecha_registro DATE, 
    tipo_persona INT,
    tipo_estado INT,
    id_ficha INT NULL,
    FOREIGN KEY (tipo_persona) REFERENCES tipo_persona(tipo_persona),
    FOREIGN KEY (tipo_estado) REFERENCES estado(tipo_estado),
    FOREIGN KEY (id_ficha) REFERENCES ficha(id_ficha)
);

CREATE TABLE qr_control(
    id_qr INT PRIMARY KEY AUTO_INCREMENT,
    estado ENUM('activo','expirado') DEFAULT 'activo',
    fecha_creacion DATETIME NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    id_persona INT,
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona)
);

CREATE TABLE visita(
    id_visita INT PRIMARY KEY AUTO_INCREMENT,
    observacion TEXT, 
    id_qr INT, 
    FOREIGN KEY (id_qr) REFERENCES qr_control(id_qr)
);

CREATE TABLE permisos(
    id_permiso INT PRIMARY KEY,
    nombre_permiso VARCHAR(40)
);

CREATE TABLE roles(
    id_rol INT PRIMARY KEY,
    nombre_rol VARCHAR(40)
);

CREATE TABLE rol_permiso(
    id_permiso INT,
    id_rol INT, 
    PRIMARY KEY(id_permiso, id_rol),
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE usuarios(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    numero_documento INT UNIQUE, 
    contraseña VARCHAR(60),
    id_rol INT,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE control_acceso (
    id_control INT PRIMARY KEY AUTO_INCREMENT,
    fecha_entrada DATETIME, 
    fecha_salida DATETIME,
    id_persona INT, 
    id_usuario INT, 
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- 2. Creamos a nuestros aprendices de prueba
INSERT INTO personas (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado) 
VALUES (100500123, 'CC', 'Juan', 'Pérez', CURDATE(), 1, 1);

INSERT INTO personas (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado) 
VALUES (1114309103, 'CC', 'Samuel', 'Nuñez Gamboa', CURDATE(), 1, 1);

-- 1. Borramos las tablas dependientes primero para evitar errores
DROP TABLE IF EXISTS control_acceso;
DROP TABLE IF EXISTS usuarios;

-- 2. Creamos la tabla de usuarios adaptada a tu requerimiento
CREATE TABLE usuarios(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    numero_documento INT UNIQUE NOT NULL, -- Este será nuestro "Usuario" para el Login
    contrasenia VARCHAR(255) NOT NULL,    -- OBLIGATORIO: Ampliamos a 255 para el hash de seguridad
    estado INT DEFAULT 1,                 -- 1: Activo, 2: Inactivo
    id_rol INT,
    FOREIGN KEY (numero_documento) REFERENCES personas(numero_documento),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- 3. Insertamos los roles de la institución
INSERT INTO roles (id_rol, nombre_rol) VALUES
(1, 'Administrador'),
(2, 'Operario'),
(3, 'Instructor'),
(4, 'Coordinador');

-- 4. Creamos los permisos
INSERT INTO permisos (id_permiso, nombre_permiso) VALUES
(1, 'escanear_qr'),
(2, 'registrar_visitante'),
(3, 'carga_masiva'),
(4, 'ver_reportes');

-- 5. Asignamos permisos a los roles (RBAC)
INSERT INTO rol_permiso (id_rol, id_permiso) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- Admin hace todo
(2, 1), (2, 2),                 -- Operario/Guarda escanea y registra visitantes
(3, 4),                         -- Instructor ve reportes
(4, 4);                         -- Coordinador ve reportes

-- Insertamos un par de programas de formación (Fichas) de prueba para ADSO
INSERT INTO ficha (numero_ficha, nombre) VALUES 
('2758231', 'Análisis y Desarrollo de Software (Jornada Mañana)'),
('2801923', 'Análisis y Desarrollo de Software (Jornada Tarde)'),
('2910293', 'Sistemas e Informática (Fines de Semana)');