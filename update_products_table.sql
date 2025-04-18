-- Add a new column to the products table to indicate if a product should be displayed in the hero section
ALTER TABLE products
ADD COLUMN new_arrival_hero_section BOOLEAN DEFAULT FALSE;

-- Optionally, add a constraint to ensure only two products can be selected for the hero section
-- This requires creating a function and trigger, which is database-specific and beyond the scope of this example
