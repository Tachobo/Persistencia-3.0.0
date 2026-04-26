-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS inventario_adso;

-- 2. Crear el usuario restringido a localhost
CREATE USER 'app_user'@'localhost' IDENTIFIED BY '#ADSO_node';

-- 3. Asignar todos los privilegios de ESA base de datos a ESTE usuario
GRANT ALL PRIVILEGES ON inventario_adso.* TO 'app_user'@'localhost';

-- 4. Aplicar los cambios de privilegios inmediatamente
FLUSH PRIVILEGES;

-- 5. Seleccionar la base de datos para empezar a crear las tablas
USE inventario_adso;

-- 6. Crear la tabla de Categorías (Debe ir primero porque no depende de nadie)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Crear la tabla de Productos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Definición de la Llave Foránea con restricción de eliminación
    CONSTRAINT fk_product_category 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id)
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

-- 8. Modificamos la tabla productos para poder almacenar los precios
ALTER TABLE products ADD COLUMN price DECIMAL(10, 2) AFTER name;

-- 9. Renombrar las columnas de auditoría al estándar de la industria
ALTER TABLE categories 
RENAME COLUMN created_ud TO created_at,
RENAME COLUMN updated_up TO updated_at;

-- 10. Renombrar las columnas de auditoría y corregir el typo de la categoría
ALTER TABLE products 
RENAME COLUMN created_ud TO created_at,
RENAME COLUMN updated_up TO updated_at,
RENAME COLUMN categori_id TO category_id;

-- 11. Destruimos la llave foránea anterior para liberar la columna
-- Caso especial
SHOW CREATE TABLE products;
-- De no mostrarnos un resultado con el CONSTRAINT EJECUTAMOS
SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'products' 
AND CONSTRAINT_TYPE = 'FOREIGN KEY';

--Luego tomamos el nombre del CONSTRAINT y lo eliminamos para luego modificarlo
-- 1. Destruyes usando el nombre que te dio la consulta
ALTER TABLE products DROP FOREIGN KEY fk_product_category;

-- 2. Cambias el nombre de la columna
ALTER TABLE products RENAME COLUMN categori_id TO category_id;

-- 3. Creas la nueva llave estandarizada
ALTER TABLE products ADD CONSTRAINT fk_products_categories
FOREIGN KEY (category_id)
REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 12. Creamos la nueva llave foránea con el nombre correcto y estandarizado
ALTER TABLE products
ADD CONSTRAINT fk_products_categories
FOREIGN KEY (category_id) REFERENCES categories(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 13. Creación de la tabla usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
)

-- 14. Agregamos el token de refresco para la seguridad
ALTER TABLE users 
ADD COLUMN refresh_token VARCHAR(255) DEFAULT NULL;

-- 15. Tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Tabla de permisos atómicos
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Tabla pivote: qué roles tiene cada usuario
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 18. Tabla pivote: qué permisos tiene cada rol
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);