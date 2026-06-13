-- ============================================================================
-- SCRIPT MAESTRO: SISTEMA DE CONTROL QR SENA
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

-- Creación de personas de prueba
INSERT INTO personas (numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha) 
VALUES 
(111122233, 'CC', 'Admin', 'General', CURDATE(), 3, 1, NULL),
(100200321, 'CC', 'Guarda', 'Escaner', CURDATE(), 3, 1, NULL),
(100300123, 'CC', 'Carlos', 'Garcia', CURDATE(), 3, 1, NULL);

INSERT INTO usuarios (numero_documento, contrasenia, estado, id_rol) VALUES
(111122233, '$2b$12$acZeHf13xt/TtFpsJ3FXceKTJt5TvKewcoD6NM45pd65.Jbcqctay', 1, 1), -- Contraseña: admin123
(100200321, '$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O', 1, 2), -- Contraseña: guarda123
(100300123, '$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O', 1, 3); -- -- Contraseña: guarda123

-- ============================================================================
-- FICHAS
-- ============================================================================

INSERT INTO ficha (numero_ficha, nombre) VALUES
('2875001','ADSO Mañana'),
('2875002','ADSO Tarde'),
('2875003','ADSO Noche'),
('2875004','Análisis de Datos'),
('2875005','Desarrollo Multimedia'),
('2875006','Programación de Software'),
('2875007','Redes y Telecomunicaciones'),
('2875008','Seguridad Informática'),
('2875009','Gestión Administrativa'),
('2875010','Contabilidad');

-- ============================================================================
-- APRENDICES (100 REGISTROS)
-- ============================================================================

INSERT INTO personas
(numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha)
VALUES

-- FICHA 1
(100000001,'CC','Juan','Perez',CURDATE(),1,1,1),
(100000002,'CC','Maria','Lopez',CURDATE(),1,1,1),
(100000003,'CC','Andres','Gomez',CURDATE(),1,1,1),
(100000004,'CC','Valentina','Rojas',CURDATE(),1,1,1),
(100000005,'CC','Camilo','Torres',CURDATE(),1,1,1),
(100000006,'CC','Daniela','Moreno',CURDATE(),1,1,1),
(100000007,'CC','Santiago','Ruiz',CURDATE(),1,1,1),
(100000008,'CC','Paula','Castro',CURDATE(),1,1,1),
(100000009,'CC','Felipe','Ramirez',CURDATE(),1,1,1),
(100000010,'CC','Laura','Mendoza',CURDATE(),1,1,1),

-- FICHA 2
(100000011,'CC','Kevin','Vargas',CURDATE(),1,1,2),
(100000012,'CC','Sara','Ortega',CURDATE(),1,1,2),
(100000013,'CC','Nicolas','Diaz',CURDATE(),1,1,2),
(100000014,'CC','Juliana','Martinez',CURDATE(),1,1,2),
(100000015,'CC','Mateo','Herrera',CURDATE(),1,1,2),
(100000016,'CC','David','Suarez',CURDATE(),1,1,2),
(100000017,'CC','Jhon','Pineda',CURDATE(),1,1,2),
(100000018,'CC','Karen','Castillo',CURDATE(),1,1,2),
(100000019,'CC','Alejandro','Parra',CURDATE(),1,1,2),
(100000020,'CC','Luisa','Velasco',CURDATE(),1,1,2),

-- FICHA 3
(100000021,'CC','Brayan','Forero',CURDATE(),1,1,3),
(100000022,'CC','Jennifer','Guerra',CURDATE(),1,1,3),
(100000023,'CC','Esteban','Becerra',CURDATE(),1,1,3),
(100000024,'CC','Cristian','Ospina',CURDATE(),1,1,3),
(100000025,'CC','Paola','Gil',CURDATE(),1,1,3),
(100000026,'CC','Sofia','Muñoz',CURDATE(),1,1,3),
(100000027,'CC','Samuel','Cardona',CURDATE(),1,1,3),
(100000028,'CC','Daniel','Sanchez',CURDATE(),1,1,3),
(100000029,'CC','Valeria','Rincon',CURDATE(),1,1,3),
(100000030,'CC','Juanita','Pardo',CURDATE(),1,1,3),

-- FICHA 4
(100000031,'CC','Mateo','Silva',CURDATE(),1,1,4),
(100000032,'CC','Kevin','Acosta',CURDATE(),1,1,4),
(100000033,'CC','Laura','Peña',CURDATE(),1,1,4),
(100000034,'CC','Natalia','Rios',CURDATE(),1,1,4),
(100000035,'CC','Andres','Lozano',CURDATE(),1,1,4),
(100000036,'CC','Camila','Vega',CURDATE(),1,1,4),
(100000037,'CC','Jeferson','Quintero',CURDATE(),1,1,4),
(100000038,'CC','Melissa','Franco',CURDATE(),1,1,4),
(100000039,'CC','Cristopher','Reyes',CURDATE(),1,1,4),
(100000040,'CC','Angela','Garzon',CURDATE(),1,1,4),

-- FICHA 5
(100000041,'CC','Tatiana','Morales',CURDATE(),1,1,5),
(100000042,'CC','Miguel','Buitrago',CURDATE(),1,1,5),
(100000043,'CC','Sebastian','Cruz',CURDATE(),1,1,5),
(100000044,'CC','Valeria','Pineda',CURDATE(),1,1,5),
(100000045,'CC','Juan','Salazar',CURDATE(),1,1,5),
(100000046,'CC','Diana','Muñoz',CURDATE(),1,1,5),
(100000047,'CC','Javier','Rincon',CURDATE(),1,1,5),
(100000048,'CC','Natalia','Forero',CURDATE(),1,1,5),
(100000049,'CC','Diego','Cardenas',CURDATE(),1,1,5),
(100000050,'CC','Camila','Ortiz',CURDATE(),1,1,5),

-- FICHA 6
(100000051,'CC','Daniel','Soto',CURDATE(),1,1,6),
(100000052,'CC','Karen','Mendez',CURDATE(),1,1,6),
(100000053,'CC','Luis','Garcia',CURDATE(),1,1,6),
(100000054,'CC','Paula','Lopez',CURDATE(),1,1,6),
(100000055,'CC','Felipe','Vega',CURDATE(),1,1,6),
(100000056,'CC','Sara','Herrera',CURDATE(),1,1,6),
(100000057,'CC','Andres','Parra',CURDATE(),1,1,6),
(100000058,'CC','Valentina','Cortes',CURDATE(),1,1,6),
(100000059,'CC','Juan','Mora',CURDATE(),1,1,6),
(100000060,'CC','Laura','Diaz',CURDATE(),1,1,6),

-- FICHA 7
(100000061,'CC','Kevin','Luna',CURDATE(),1,1,7),
(100000062,'CC','Sofia','Torres',CURDATE(),1,1,7),
(100000063,'CC','Mateo','Silva',CURDATE(),1,1,7),
(100000064,'CC','Daniela','Ruiz',CURDATE(),1,1,7),
(100000065,'CC','Miguel','Castillo',CURDATE(),1,1,7),
(100000066,'CC','Tatiana','Bermudez',CURDATE(),1,1,7),
(100000067,'CC','Samuel','Arias',CURDATE(),1,1,7),
(100000068,'CC','Maria','Guzman',CURDATE(),1,1,7),
(100000069,'CC','Cristian','Londoño',CURDATE(),1,1,7),
(100000070,'CC','Valeria','Mejia',CURDATE(),1,1,7),

-- FICHA 8
(100000071,'CC','Nicolas','Ramirez',CURDATE(),1,1,8),
(100000072,'CC','Juliana','Acosta',CURDATE(),1,1,8),
(100000073,'CC','Jhon','Vargas',CURDATE(),1,1,8),
(100000074,'CC','Camila','Moreno',CURDATE(),1,1,8),
(100000075,'CC','Sebastian','Gomez',CURDATE(),1,1,8),
(100000076,'CC','Laura','Martinez',CURDATE(),1,1,8),
(100000077,'CC','Andres','Castro',CURDATE(),1,1,8),
(100000078,'CC','Paula','Rojas',CURDATE(),1,1,8),
(100000079,'CC','Felipe','Suarez',CURDATE(),1,1,8),
(100000080,'CC','Karen','Peña',CURDATE(),1,1,8),

-- FICHA 9
(100000081,'CC','Daniel','Lozano',CURDATE(),1,1,9),
(100000082,'CC','Sofia','Garzon',CURDATE(),1,1,9),
(100000083,'CC','Miguel','Franco',CURDATE(),1,1,9),
(100000084,'CC','Valentina','Herrera',CURDATE(),1,1,9),
(100000085,'CC','Juan','Ortega',CURDATE(),1,1,9),
(100000086,'CC','Natalia','Vega',CURDATE(),1,1,9),
(100000087,'CC','Kevin','Quintero',CURDATE(),1,1,9),
(100000088,'CC','Paula','Cardona',CURDATE(),1,1,9),
(100000089,'CC','Javier','Morales',CURDATE(),1,1,9),
(100000090,'CC','Camila','Silva',CURDATE(),1,1,9),

-- FICHA 10
(100000091,'CC','Mateo','Mendoza',CURDATE(),1,1,10),
(100000092,'CC','Sara','Rincon',CURDATE(),1,1,10),
(100000093,'CC','Felipe','Pardo',CURDATE(),1,1,10),
(100000094,'CC','Daniela','Becerra',CURDATE(),1,1,10),
(100000095,'CC','Andres','Gil',CURDATE(),1,1,10),
(100000096,'CC','Juliana','Ospina',CURDATE(),1,1,10),
(100000097,'CC','Cristian','Muñoz',CURDATE(),1,1,10),
(100000098,'CC','Valeria','Forero',CURDATE(),1,1,10),
(100000099,'CC','Sebastian','Torres',CURDATE(),1,1,10),
(100000100,'CC','Laura','Salazar',CURDATE(),1,1,10);

-- ============================================================================
-- INSTRUCTORES (15)
-- ============================================================================

INSERT INTO personas
(numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha)
VALUES
(200000001,'CC','Carlos','Molina',CURDATE(),2,1,NULL),
(200000002,'CC','Patricia','Gonzalez',CURDATE(),2,1,NULL),
(200000003,'CC','Javier','Cruz',CURDATE(),2,1,NULL),
(200000004,'CC','Diana','Martinez',CURDATE(),2,1,NULL),
(200000005,'CC','Fernando','Gomez',CURDATE(),2,1,NULL),
(200000006,'CC','Sandra','Lopez',CURDATE(),2,1,NULL),
(200000007,'CC','William','Perez',CURDATE(),2,1,NULL),
(200000008,'CC','Monica','Rojas',CURDATE(),2,1,NULL),
(200000009,'CC','Jairo','Morales',CURDATE(),2,1,NULL),
(200000010,'CC','Claudia','Castro',CURDATE(),2,1,NULL),
(200000011,'CC','Mauricio','Ruiz',CURDATE(),2,1,NULL),
(200000012,'CC','Andrea','Vargas',CURDATE(),2,1,NULL),
(200000013,'CC','Ricardo','Bermudez',CURDATE(),2,1,NULL),
(200000014,'CC','Paola','Acosta',CURDATE(),2,1,NULL),
(200000015,'CC','Felipe','Mendez',CURDATE(),2,1,NULL);

-- ============================================================================
-- FUNCIONARIOS (10)
-- ============================================================================

INSERT INTO personas
(numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha)
VALUES
(300000001,'CC','Angela','Salinas',CURDATE(),3,1,NULL),
(300000002,'CC','Diego','Cardenas',CURDATE(),3,1,NULL),
(300000003,'CC','Lorena','Garcia',CURDATE(),3,1,NULL),
(300000004,'CC','Hector','Mendez',CURDATE(),3,1,NULL),
(300000005,'CC','Paula','Herrera',CURDATE(),3,1,NULL),
(300000006,'CC','Oscar','Ramirez',CURDATE(),3,1,NULL),
(300000007,'CC','Martha','Becerra',CURDATE(),3,1,NULL),
(300000008,'CC','Cristian','Ortega',CURDATE(),3,1,NULL),
(300000009,'CC','Natalia','Rincon',CURDATE(),3,1,NULL),
(300000010,'CC','Jhon','Quintero',CURDATE(),3,1,NULL);

-- ============================================================================
-- COORDINADORES (5)
-- ============================================================================

INSERT INTO personas
(numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha)
VALUES
(310000001,'CC','Martha','Velez',CURDATE(),3,1,NULL),
(310000002,'CC','Ricardo','Luna',CURDATE(),3,1,NULL),
(310000003,'CC','Diana','Castro',CURDATE(),3,1,NULL),
(310000004,'CC','Javier','Suarez',CURDATE(),3,1,NULL),
(310000005,'CC','Carolina','Gil',CURDATE(),3,1,NULL);

-- ============================================================================
-- GUARDAS / OPERARIOS (5)
-- ============================================================================

INSERT INTO personas
(numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha)
VALUES
(400000001,'CC','Jorge','Salazar',CURDATE(),3,1,NULL),
(400000002,'CC','Luis','Herrera',CURDATE(),3,1,NULL),
(400000003,'CC','Miguel','Rincon',CURDATE(),3,1,NULL),
(400000004,'CC','Oscar','Benitez',CURDATE(),3,1,NULL),
(400000005,'CC','Andres','Pineda',CURDATE(),3,1,NULL);

-- ============================================================================
-- USUARIOS DEL SISTEMA
-- CONTRASEÑA PARA TODOS: guarda123
-- HASH:
-- $2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O
-- ============================================================================

INSERT INTO usuarios
(numero_documento, contrasenia, estado, id_rol)
VALUES

-- INSTRUCTORES (ROL 3)
(200000001,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000002,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000003,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000004,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000005,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000006,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000007,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000008,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000009,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000010,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000011,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000012,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000013,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000014,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),
(200000015,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,3),

-- COORDINADORES (ROL 4)
(310000001,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,4),
(310000002,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,4),
(310000003,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,4),
(310000004,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,4),
(310000005,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,4),

-- GUARDAS / OPERARIOS (ROL 2)
(400000001,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,2),
(400000002,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,2),
(400000003,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,2),
(400000004,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,2),
(400000005,'$2b$12$BgHOk/GIY9z3CVnfDqSZB.mdjNsHfAG7fXdCZj21ExZ48faevDo1O',1,2);

-- ============================================================================
-- VISITANTES (30)
-- ============================================================================

INSERT INTO personas
(numero_documento, tipo_doc, nombres, apellidos, fecha_registro, tipo_persona, tipo_estado, id_ficha)
VALUES
(500000001,'CC','Visitante','Uno',CURDATE(),4,1,NULL),
(500000002,'CC','Visitante','Dos',CURDATE(),4,1,NULL),
(500000003,'CC','Visitante','Tres',CURDATE(),4,1,NULL),
(500000004,'CC','Visitante','Cuatro',CURDATE(),4,1,NULL),
(500000005,'CC','Visitante','Cinco',CURDATE(),4,1,NULL),
(500000006,'CC','Visitante','Seis',CURDATE(),4,1,NULL),
(500000007,'CC','Visitante','Siete',CURDATE(),4,1,NULL),
(500000008,'CC','Visitante','Ocho',CURDATE(),4,1,NULL),
(500000009,'CC','Visitante','Nueve',CURDATE(),4,1,NULL),
(500000010,'CC','Visitante','Diez',CURDATE(),4,1,NULL),
(500000011,'CC','Visitante','Once',CURDATE(),4,1,NULL),
(500000012,'CC','Visitante','Doce',CURDATE(),4,1,NULL),
(500000013,'CC','Visitante','Trece',CURDATE(),4,1,NULL),
(500000014,'CC','Visitante','Catorce',CURDATE(),4,1,NULL),
(500000015,'CC','Visitante','Quince',CURDATE(),4,1,NULL),
(500000016,'CC','Visitante','Dieciseis',CURDATE(),4,1,NULL),
(500000017,'CC','Visitante','Diecisiete',CURDATE(),4,1,NULL),
(500000018,'CC','Visitante','Dieciocho',CURDATE(),4,1,NULL),
(500000019,'CC','Visitante','Diecinueve',CURDATE(),4,1,NULL),
(500000020,'CC','Visitante','Veinte',CURDATE(),4,1,NULL),
(500000021,'CC','Visitante','Veintiuno',CURDATE(),4,1,NULL),
(500000022,'CC','Visitante','Veintidos',CURDATE(),4,1,NULL),
(500000023,'CC','Visitante','Veintitres',CURDATE(),4,1,NULL),
(500000024,'CC','Visitante','Veinticuatro',CURDATE(),4,1,NULL),
(500000025,'CC','Visitante','Veinticinco',CURDATE(),4,1,NULL),
(500000026,'CC','Visitante','Veintiseis',CURDATE(),4,1,NULL),
(500000027,'CC','Visitante','Veintisiete',CURDATE(),4,1,NULL),
(500000028,'CC','Visitante','Veintiocho',CURDATE(),4,1,NULL),
(500000029,'CC','Visitante','Veintinueve',CURDATE(),4,1,NULL),
(500000030,'CC','Visitante','Treinta',CURDATE(),4,1,NULL);

INSERT INTO qr_control
(fecha_creacion, fecha_expiracion, id_persona)
VALUES
(NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), 139),
(NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), 140),
(NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 141),
(NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 142),
(NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 143),
(NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 144),
(NOW(), DATE_ADD(NOW(), INTERVAL 5 HOUR), 145),
(NOW(), DATE_ADD(NOW(), INTERVAL 5 HOUR), 146),
(NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 147),
(NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 148);

INSERT INTO qr_control
(fecha_creacion, fecha_expiracion, id_persona)
VALUES
(DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 1 HOUR), 149),
(DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_ADD(NOW(), INTERVAL 90 MINUTE), 150),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 151),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 30 MINUTE), 152),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 20 MINUTE), 153);

INSERT INTO qr_control
(fecha_creacion, fecha_expiracion, id_persona)
VALUES
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 154),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 8 MINUTE), 155),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 6 MINUTE), 156),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 4 MINUTE), 157),
(DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 2 MINUTE), 158);

INSERT INTO qr_control
(estado, fecha_creacion, fecha_expiracion, id_persona)
VALUES
('expirado', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 159),
('expirado', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 160),
('expirado', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 161),
('expirado', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 162),
('expirado', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 163),
('expirado', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), 164),
('expirado', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), 165),
('expirado', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 166),
('expirado', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 167),
('expirado', DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 168);

INSERT INTO visita (observacion,id_qr)
VALUES
('Reunion con coordinacion',1),
('Entrega de documentos',2),
('Soporte tecnico',3),
('Proveedor externo',4),
('Visita institucional',5),
('Mantenimiento de equipos',6),
('Capacitacion externa',7),
('Auditoria',8),
('Reunion administrativa',9),
('Visita academica',10),
('Prueba de acceso',11),
('Prueba de alertas',12),
('Prueba de QR',13),
('Proveedor internet',14),
('Proveedor software',15),
('Visita de padres',16),
('Entrega de certificados',17),
('Visita empresarial',18),
('Mantenimiento electrico',19),
('Inspeccion tecnica',20),
('Visita externa',21),
('Entrega material',22),
('Revision infraestructura',23),
('Control calidad',24),
('Auditoria interna',25),
('Verificacion procesos',26),
('Prueba sistema',27),
('Prueba frontend',28),
('Prueba backend',29),
('Prueba reportes',30);

-- ============================================================================
-- ACCESOS DE APRENDICES - HACE 7 DÍAS
-- ============================================================================

-- HACE 7 DÍAS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 16 HOUR,
id_persona,
24
FROM personas
WHERE tipo_persona = 1;

-- HACE 6 DÍAS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 16 HOUR,
id_persona,
25
FROM personas
WHERE tipo_persona = 1;

-- HACE 5 DÍAS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 16 HOUR,
id_persona,
26
FROM personas
WHERE tipo_persona = 1;

-- HACE 4 DÍAS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 16 HOUR,
id_persona,
27
FROM personas
WHERE tipo_persona = 1;

-- HACE 3 DÍAS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR,
id_persona,
28
FROM personas
WHERE tipo_persona = 1;

-- HACE 2 DÍAS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 16 HOUR,
id_persona,
24
FROM personas
WHERE tipo_persona = 1;

-- AYER

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 7 HOUR,
DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 16 HOUR,
id_persona,
25
FROM personas
WHERE tipo_persona = 1;

-- APRENDICES DENTRO DEL CENTRO HOY

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
NOW() - INTERVAL 4 HOUR,
NULL,
id_persona,
26
FROM personas
WHERE tipo_persona = 1
LIMIT 25;

-- APRENDICES QUE YA SALIERON HOY

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
NOW() - INTERVAL 8 HOUR,
NOW() - INTERVAL 1 HOUR,
id_persona,
27
FROM personas
WHERE tipo_persona = 1
LIMIT 50;

-- INSTRUCTORES

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
NOW() - INTERVAL 6 HOUR,
NOW() - INTERVAL 30 MINUTE,
id_persona,
28
FROM personas
WHERE tipo_persona = 2;

-- COORDINADORES

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
NOW() - INTERVAL 7 HOUR,
NOW() - INTERVAL 2 HOUR,
id_persona,
24
FROM personas
WHERE tipo_persona = 3;

-- VISITANTES ACTIVOS

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
NOW() - INTERVAL 1 HOUR,
NULL,
id_persona,
25
FROM personas
WHERE tipo_persona = 4
LIMIT 10;

-- VISITANTES QUE YA SALIERON

INSERT INTO control_acceso
(fecha_entrada, fecha_salida, id_persona, id_usuario)
SELECT
NOW() - INTERVAL 3 HOUR,
NOW() - INTERVAL 20 MINUTE,
id_persona,
26
FROM personas
WHERE tipo_persona = 4
LIMIT 15;