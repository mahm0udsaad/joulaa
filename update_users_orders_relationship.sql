-- Check if the foreign key constraint exists between orders and users
DO $$ 
BEGIN
  -- First, check if the user_id column exists in orders table
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    -- If the column exists but the constraint doesn't, add it
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
      REFERENCES users(id);
      
      RAISE NOTICE 'Foreign key constraint added between orders and users tables';
    ELSE
      RAISE NOTICE 'Foreign key constraint already exists between orders and users tables';
    END IF;
  ELSE
    RAISE NOTICE 'user_id column does not exist in orders table';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Add RLS policies for better security
DO $$ 
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
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
  
  RAISE NOTICE 'RLS policies updated for orders table';
END $$;
