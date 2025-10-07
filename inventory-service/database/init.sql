-- ============================================
-- Inventory Service - Database Initialization
-- ============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabla: inventory
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(255) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_available_quantity CHECK (available_quantity >= 0),
    CONSTRAINT check_reserved_quantity CHECK (reserved_quantity >= 0),
    CONSTRAINT check_price CHECK (price >= 0),
    CONSTRAINT check_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'OUT_OF_STOCK'))
    );

-- Índices para inventory
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_created_at ON inventory(created_at);

-- ============================================
-- Tabla: inventory_logs
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_logs (
                                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(255) NOT NULL,
    order_id VARCHAR(255),
    operation VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    locking_strategy VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_operation CHECK (operation IN ('RESERVE', 'RELEASE', 'CHECK'))
    );

-- Índices para inventory_logs
CREATE INDEX idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_order_id ON inventory_logs(order_id);
CREATE INDEX idx_inventory_logs_operation ON inventory_logs(operation);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX idx_inventory_logs_success ON inventory_logs(success);

-- ============================================
-- Trigger para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Datos iniciales (seed)
-- ============================================
INSERT INTO inventory (product_id, product_name, available_quantity, reserved_quantity, price, status)
VALUES
    ('prod_001', 'Laptop Dell XPS 13', 50, 0, 199.99, 'AVAILABLE'),
    ('prod_002', 'Mouse Logitech MX Master', 100, 0, 49.99, 'AVAILABLE'),
    ('prod_003', 'Keyboard Mechanical RGB', 75, 0, 149.99, 'AVAILABLE'),
    ('prod_004', 'Monitor 4K LG 27 inch', 30, 0, 399.99, 'AVAILABLE'),
    ('prod_005', 'iPhone 15 Pro', 25, 0, 699.99, 'AVAILABLE'),
    ('prod_006', 'AirPods Pro', 60, 0, 149.96, 'AVAILABLE'),
    ('prod_007', 'Samsung Galaxy S24', 40, 0, 299.99, 'AVAILABLE'),
    -- Productos adicionales para pruebas de concurrencia
    ('prod_test_001', 'Product Race Condition Test (1 unit)', 1, 0, 99.99, 'AVAILABLE'),
    ('prod_test_002', 'Product High Concurrency Test (10 units)', 10, 0, 199.99, 'AVAILABLE')
    ON CONFLICT (product_id) DO NOTHING;


-- ============================================
-- Comentarios para documentación
-- ============================================
COMMENT ON TABLE inventory IS 'Tabla principal de inventario de productos';
COMMENT ON TABLE inventory_logs IS 'Registro de auditoría de todas las operaciones de inventario';
COMMENT ON COLUMN inventory.version IS 'Campo para optimistic locking (incrementa en cada update)';
COMMENT ON COLUMN inventory_logs.locking_strategy IS 'Estrategia de concurrencia utilizada: PESSIMISTIC, OPTIMISTIC, o APPLICATION';

-- ============================================
-- Verificación final
-- ============================================
\echo 'Inventory database initialized successfully!'
\echo 'Tables created: inventory, inventory_logs'
\echo 'Products seeded: 9 (7 regular + 2 for load testing)'
SELECT product_id, product_name, available_quantity, status FROM inventory;