-- ================================================================
-- Step 1: Add missing columns to existing tables (run first)
-- ================================================================

-- Add new columns to products table if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Migrate old image column data to image_url (if image column exists)
UPDATE products SET image_url = image WHERE image_url IS NULL AND image IS NOT NULL;

-- Add new columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'LOCAL';
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- ================================================================
-- Step 2: Insert 20 realistic products
-- ================================================================

INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('Samsung Galaxy M14 5G', '6GB RAM, 128GB storage, 6000mAh battery', 12999.00, 'Electronics', 50, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop'),
('boAt Airdopes 141', 'True wireless earbuds, 42h playback', 1299.00, 'Electronics', 120, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop'),
('HP 15s Laptop', 'Intel i3, 8GB RAM, 512GB SSD, Windows 11', 38990.00, 'Electronics', 25, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop'),
('Mi Smart Band 7', 'Fitness tracker with AMOLED display', 2999.00, 'Electronics', 80, 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=600&auto=format&fit=crop'),
('Men Casual Cotton Shirt', 'Regular fit, machine wash', 599.00, 'Fashion', 200, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop'),
('Women Kurti Set', 'Rayon fabric, printed, 3-piece set', 899.00, 'Fashion', 150, 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'),
('Nike Revolution Sneakers', 'Lightweight running shoes', 2499.00, 'Fashion', 60, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'),
('Leather Wallet for Men', 'Genuine leather, RFID protected', 449.00, 'Fashion', 100, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop'),
('Tata Sampann Toor Dal 1kg', 'Unpolished, protein rich', 165.00, 'Grocery', 300, 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop'),
('Aashirvaad Atta 5kg', 'Whole wheat flour', 249.00, 'Grocery', 250, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'),
('Fortune Sunflower Oil 1L', 'Refined cooking oil', 145.00, 'Grocery', 200, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop'),
('Red Label Tea 500g', 'Rich blend black tea', 210.00, 'Grocery', 180, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&auto=format&fit=crop'),
('Prestige Non-Stick Kadai', 'Induction base, 2.5L capacity', 899.00, 'Home & Kitchen', 70, 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600&auto=format&fit=crop'),
('Cotton Bedsheet Set', 'King size, double bed with 2 pillow covers', 799.00, 'Home & Kitchen', 90, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop'),
('Philips LED Bulb 9W', 'Cool day white, pack of 4', 399.00, 'Home & Kitchen', 150, 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop'),
('Milton Thermosteel Bottle', '1L, hot & cold retention', 649.00, 'Home & Kitchen', 100, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop'),
('Lakme Sunscreen SPF 50', '50g, non-greasy formula', 299.00, 'Beauty', 130, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop'),
('Mamaearth Face Wash', 'Vitamin C, 100ml', 249.00, 'Beauty', 110, 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&auto=format&fit=crop'),
('Nivea Body Lotion 400ml', 'Deep moisture, all skin types', 349.00, 'Beauty', 140, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&auto=format&fit=crop'),
('Wildstone Deodorant', '150ml, long lasting fragrance', 199.00, 'Beauty', 160, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=600&auto=format&fit=crop');
