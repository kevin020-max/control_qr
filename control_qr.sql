-- ============================================================================
-- SCRIPT MAESTRO: SISTEMA DE CONTROL QR SENA
-- Autor: Samuel Nuñez Gamboa y Equipo ADSO
-- ============================================================================

-- 1. PREPARACIÓN DEL ENTORNO
-- Borramos la base de datos si ya existe para asegurar una instalación limpia
DROP DATABASE IF EXISTS control_qr;
CREATE DATABASE control_qr;
USE control_qr;

-- ============================================================================
-- 2. TABLAS MAESTRAS (Sin llaves foráneas)
-- ============================================================================

CREATE TABLE estado(
    tipo_estado INT PRIMARY KEY,
    tipo_de_estado VARCHAR(20)
);

CREATE TABLE tipo_persona(
    tipo_persona INT PRIMARY KEY,
    nombre_tipo VARCHAR(40) NOT NULL
);

CREATE TABLE ficha (
    id_ficha INT AUTO_INCREMENT PRIMARY KEY,
    numero_ficha VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE permisos(
    id_permiso INT PRIMARY KEY,
    nombre_permiso VARCHAR(40)
);

CREATE TABLE roles(
    id_rol INT PRIMARY KEY,
    nombre_rol VARCHAR(40)
);

-- ============================================================================
-- 3. TABLAS DEPENDIENTES (Nivel 1)
-- ============================================================================

-- Tabla pivote para la relación Muchos a Muchos entre Roles y Permisos (RBAC)
CREATE TABLE rol_permiso(
    id_permiso INT,
    id_rol INT, 
    PRIMARY KEY(id_permiso, id_rol),
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- La tabla central de personas de la institución
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

-- ============================================================================
-- 4. TABLAS DEPENDIENTES (Nivel 2)
-- ============================================================================

-- Tabla de Usuarios (Solo para quienes inician sesión en la plataforma)
CREATE TABLE usuarios(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    numero_documento INT UNIQUE NOT NULL, 
    contrasenia VARCHAR(255) NOT NULL,    -- 255 caracteres para soportar el hash de bcrypt
    estado INT DEFAULT 1,                 -- 1: Activo, 2: Inactivo
    id_rol INT,
    FOREIGN KEY (numero_documento) REFERENCES personas(numero_documento),
    FOREIGN KEY (estado) REFERENCES estado(tipo_estado), -- Vinculado a la tabla de estados
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Tabla para el control y expiración de los códigos QR
CREATE TABLE qr_control(
    id_qr INT PRIMARY KEY AUTO_INCREMENT,
    estado ENUM('activo','expirado') DEFAULT 'activo',
    fecha_creacion DATETIME NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    id_persona INT,
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona)
);

-- ============================================================================
-- 5. TABLAS DE REGISTRO / LOGS (Nivel 3)
-- ============================================================================

-- Tabla para visitantes temporales que no están en la tabla personas
CREATE TABLE visita(
    id_visita INT PRIMARY KEY AUTO_INCREMENT,
    observacion TEXT, 
    id_qr INT, 
    FOREIGN KEY (id_qr) REFERENCES qr_control(id_qr)
);

-- Tabla principal de operaciones operativas (Entradas y Salidas)
CREATE TABLE control_acceso (
    id_control INT PRIMARY KEY AUTO_INCREMENT,
    fecha_entrada DATETIME, 
    fecha_salida DATETIME,
    id_persona INT, 
    id_usuario INT, -- El guarda/operario que autorizó o escaneó el acceso
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- ============================================================================
-- 6. INSERCIÓN DE DATOS INICIALES (Data Seeding)
-- ============================================================================

-- Estados del sistema
INSERT INTO estado VALUES
(1, 'activo'),
(2, 'inactivo');

-- Tipos de persona en la institución
INSERT INTO tipo_persona (tipo_persona, nombre_tipo) VALUES
(1, 'aprendiz'),
(2, 'instructor'),
(3, 'funcionario'),
(4, 'visitante');

-- Roles de la plataforma
INSERT INTO roles (id_rol, nombre_rol) VALUES
(1, 'Administrador'),
(2, 'Operario'),
(3, 'Instructor'),
(4, 'Coordinador');

-- Permisos del sistema
INSERT INTO permisos (id_permiso, nombre_permiso) VALUES
(1, 'escanear_qr'),
(2, 'registrar_visitante'),
(3, 'carga_masiva'),
(4, 'ver_reportes');

-- Asignación de Permisos a Roles
INSERT INTO rol_permiso (id_rol, id_permiso) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- Admin hace todo
(2, 1), (2, 2),                 -- Operario/Guarda escanea y registra visitantes
(3, 4),                         -- Instructor ve reportes
(4, 4);                         -- Coordinador ve reportes

-- Fichas de prueba ADSO
INSERT INTO ficha (numero_ficha, nombre) VALUES 
('2758231', 'Análisis y Desarrollo de Software (Jornada Mañana)'),
('2801923', 'Análisis y Desarrollo de Software (Jornada Tarde)'),
('2910293', 'Sistemas e Informática (Fines de Semana)');

-- Creación de personas de prueba
INSERT INTO personas (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha) 
VALUES 
(100500123, 'CC', 'Juan', 'Pérez', CURDATE(), 1, 1, 1),
(1114309103, 'CC', 'Samuel', 'Nuñez Gamboa', CURDATE(), 1, 1, 1);

-- NOTA: Recuerda que a ti (Samuel) debes crearte también en la tabla 'usuarios' 
-- desde tu backend o con un script encriptado para poder iniciar sesión.