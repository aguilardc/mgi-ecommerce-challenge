-- La base de datos orders_db ya existe por POSTGRES_DB
-- Ya estamos conectados a ella automáticamente

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL DEFAULT 'TBD',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE orders IS 'Stores order information with event-driven choreography pattern';
COMMENT ON TABLE order_items IS 'Stores individual items for each order';
COMMENT ON COLUMN orders.status IS 'Order status: PENDING, CONFIRMED, FAILED, CANCELLED';


-- ============================================
-- SEED DATA (Datos de Prueba)
-- ============================================

-- Orden 1: CONFIRMED
-- Items: 199.99 + 99.98 = 299.97
INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'user001', 'CONFIRMED', 299.97, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'prod_001', 'Laptop Dell XPS 13', 1, 199.99, 199.99),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'prod_002', 'Mouse Logitech MX Master', 2, 49.99, 99.98);

-- Orden 2: PENDING
-- Items: 149.99
INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'user002', 'PENDING', 149.99, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'prod_003', 'Keyboard Mechanical RGB', 1, 149.99, 149.99);

-- Orden 3: FAILED
-- Items: 0
INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'user003', 'FAILED', 0.00, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours');

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'prod_004', 'Monitor 4K LG 27 inch', 1, 0.00, 0.00);

-- Orden 4: CONFIRMED
-- Items: 699.99 + 149.96 = 849.95
INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440004', 'user001', 'CONFIRMED', 849.95, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'prod_005', 'iPhone 15 Pro', 1, 699.99, 699.99),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'prod_006', 'AirPods Pro', 1, 149.96, 149.96);

-- Orden 5: CANCELLED
-- Items: 299.99
INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440005', 'user004', 'CANCELLED', 299.99, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'prod_007', 'Samsung Galaxy S24', 1, 299.99, 299.99);