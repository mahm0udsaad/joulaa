-- First, let's check the structure of the orders table
DO $
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id),
            status TEXT NOT NULL DEFAULT 'new',
            total_amount DECIMAL(10, 2) NOT NULL,
            shipping_cost DECIMAL(10, 2) DEFAULT 0,
            tax_amount DECIMAL(10, 2) DEFAULT 0,
            discount_amount DECIMAL(10, 2) DEFAULT 0,
            shipping_address JSONB,
            billing_address JSONB,
            payment_intent_id TEXT,
            payment_status TEXT DEFAULT 'pending',
            order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$;

-- Check if order_items table exists, if not create it
DO $
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        CREATE TABLE order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL,
            cost_price DECIMAL(10, 2) DEFAULT 0,
            subtotal DECIMAL(10, 2) NOT NULL,
            color TEXT,
            shade TEXT,
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$;

-- If the tables already exist but the relationship is missing, add it
DO $
BEGIN
    -- Check if the user_id column exists in orders table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        -- Check if the foreign key constraint exists
        IF NOT EXISTS (
            SELECT FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'orders' 
            AND ccu.table_name = 'users'
            AND ccu.column_name = 'id'
        ) THEN
            -- Add the foreign key constraint
            ALTER TABLE orders 
            ADD CONSTRAINT fk_orders_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES auth.users(id);
        END IF;
    ELSE
        -- Add the user_id column if it doesn't exist
        ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END
$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add RLS policies for orders table
DO $
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
    DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
    
    -- Create new policies
    CREATE POLICY "Users can view their own orders" 
    ON orders FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all orders" 
    ON orders FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );
END
$;

-- Add RLS policies for order_items table
DO $
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
    DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
    
    -- Create new policies
    CREATE POLICY "Users can view their own order items" 
    ON order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );
    
    CREATE POLICY "Admins can view all order items" 
    ON order_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );
END
$;

-- Seed sample orders for existing users
DO $
DECLARE
    user_record RECORD;
    product_record RECORD;
    order_id UUID;
    shipping_address JSONB;
    product_count INTEGER;
    random_quantity INTEGER;
    total_price DECIMAL(10, 2);
BEGIN
    -- Get count of products
    SELECT COUNT(*) INTO product_count FROM products;
    
    -- Only proceed if we have products
    IF product_count > 0 THEN
        -- For each user, create 1-3 orders
        FOR user_record IN SELECT id, email FROM auth.users LIMIT 10
        LOOP
            -- Create 1-3 orders per user
            FOR i IN 1..floor(random() * 3 + 1)::int
            LOOP
                -- Create a sample shipping address
                shipping_address := jsonb_build_object(
                    'firstName', split_part(user_record.email, '@', 1),
                    'lastName', 'Customer',
                    'email', user_record.email,
                    'address', '123 Main St',
                    'city', 'Anytown',
                    'state', 'CA',
                    'postalCode', '12345',
                    'country', 'USA',
                    'phone', '555-123-4567'
                );
                
                -- Initialize total price
                total_price := 0;
                
                -- Create a new order
                INSERT INTO orders (
                    user_id, 
                    status, 
                    total_amount, 
                    shipping_cost,
                    tax_amount,
                    discount_amount,
                    shipping_address, 
                    billing_address,
                    payment_status,
                    order_date
                )
                VALUES (
                    user_record.id, 
                    (ARRAY['new', 'processing', 'shipped'])[floor(random() * 3 + 1)], 
                    0, -- We'll update this after adding items
                    9.99, -- Shipping cost
                    0, -- Tax amount (will be calculated)
                    0, -- Discount amount
                    shipping_address,
                    shipping_address,
                    'paid',
                    NOW() - (random() * interval '30 days')
                )
                RETURNING id INTO order_id;
                
                -- Add 1-5 random products to the order
                FOR j IN 1..floor(random() * 5 + 1)::int
                LOOP
                    -- Get a random product
                    SELECT id, name, price, cost_price INTO product_record 
                    FROM products 
                    OFFSET floor(random() * product_count) 
                    LIMIT 1;
                    
                    -- Random quantity between 1 and 3
                    random_quantity := floor(random() * 3 + 1)::int;
                    
                    -- Calculate subtotal
                    total_price := total_price + (product_record.price * random_quantity);
                    
                    -- Add the product to the order
                    INSERT INTO order_items (
                        order_id, 
                        product_id, 
                        product_name,
                        quantity, 
                        unit_price,
                        cost_price,
                        subtotal
                    )
                    VALUES (
                        order_id,
                        product_record.id,
                        product_record.name,
                        random_quantity,
                        product_record.price,
                        COALESCE(product_record.cost_price, product_record.price * 0.6),
                        product_record.price * random_quantity
                    );
                END LOOP;
                
                -- Calculate tax (8.25%)
                DECLARE tax_amount DECIMAL(10, 2) := total_price * 0.0825;
                
                -- Update the order total
                UPDATE orders 
                SET 
                    total_amount = total_price + 9.99 + tax_amount, -- Add shipping and tax
                    tax_amount = tax_amount
                WHERE id = order_id;
            END LOOP;
        END LOOP;
    END IF;
END
$;

-- Add a comment to the tables for documentation
COMMENT ON TABLE orders IS 'Stores order information linked to users';
COMMENT ON TABLE order_items IS 'Stores individual items within an order';
