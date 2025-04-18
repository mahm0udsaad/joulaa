-- Check if the columns already exist before adding them
DO $$
BEGIN
    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;

    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'city') THEN
        ALTER TABLE users ADD COLUMN city TEXT;
    END IF;

    -- Add state column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'state') THEN
        ALTER TABLE users ADD COLUMN state TEXT;
    END IF;

    -- Add zip_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'zip_code') THEN
        ALTER TABLE users ADD COLUMN zip_code TEXT;
    END IF;

    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'country') THEN
        ALTER TABLE users ADD COLUMN country TEXT;
    END IF;

    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;

    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;

    RAISE NOTICE 'User table updated successfully with shipping information columns';
END $$;

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Add a comment to the table for documentation
COMMENT ON TABLE users IS 'Stores user information including shipping details';
