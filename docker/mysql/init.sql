-- Inicializa la base de datos para la aplicación de gestión de productos y órdenes.
CREATE DATABASE IF NOT EXISTS `reto_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `reto_db`;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `qty` INT NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo opcionales
INSERT INTO `products` (`name`, `unit_price`)
SELECT * FROM (
  SELECT 'Laptop básica' AS name, 1500.00 AS unit_price
  UNION ALL SELECT 'Teclado mecánico', 250.00
  UNION ALL SELECT 'Mouse inalámbrico', 180.00
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `products`);
