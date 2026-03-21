-- 1. Tabla Tipos de Vehículo
CREATE TABLE tipos_vehiculo (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabla Operarios
CREATE TABLE operarios (
    id_operario SERIAL PRIMARY KEY,
    documento VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- 3. Tabla Clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    documento VARCHAR(20) UNIQUE,
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20)
);

-- 4. Tabla Celdas
CREATE TABLE celdas (
    id_celda SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    id_tipo_vehiculo INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Libre' CHECK (estado IN ('Libre', 'Ocupada', 'Inactiva')),
    CONSTRAINT fk_tipo_celda FOREIGN KEY (id_tipo_vehiculo) REFERENCES tipos_vehiculo(id_tipo)
);

-- 5. Tabla Vehículos
CREATE TABLE vehiculos (
    placa VARCHAR(10) PRIMARY KEY,
    id_tipo INT NOT NULL,
    id_cliente INT,
    CONSTRAINT fk_tipo_vehiculo FOREIGN KEY (id_tipo) REFERENCES tipos_vehiculo(id_tipo),
    CONSTRAINT fk_cliente_vehiculo FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

-- 6. Tabla Mensualidades
CREATE TABLE mensualidades (
    id_mensualidad SERIAL PRIMARY KEY,
    placa_vehiculo VARCHAR(10) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_vehiculo_mensualidad FOREIGN KEY (placa_vehiculo) REFERENCES vehiculos(placa)
);

-- 7. Tabla Registros de Acceso (Transaccional)
CREATE TABLE registros_acceso (
    id_registro SERIAL PRIMARY KEY,
    placa_vehiculo VARCHAR(10) NOT NULL,
    id_celda INT,
    id_operario_entrada INT NOT NULL,
    id_operario_salida INT,
    fecha_hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_hora_salida TIMESTAMP,
    novedades TEXT,
    estado VARCHAR(20) DEFAULT 'Adentro' CHECK (estado IN ('Adentro', 'Finalizado', 'Anulado')),
    CONSTRAINT fk_vehiculo_acceso FOREIGN KEY (placa_vehiculo) REFERENCES vehiculos(placa),
    CONSTRAINT fk_celda_acceso FOREIGN KEY (id_celda) REFERENCES celdas(id_celda),
    CONSTRAINT fk_operario_entrada FOREIGN KEY (id_operario_entrada) REFERENCES operarios(id_operario),
    CONSTRAINT fk_operario_salida FOREIGN KEY (id_operario_salida) REFERENCES operarios(id_operario)
);
