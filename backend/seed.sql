-- Run this in psql or pgAdmin to set up your database

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT
);

CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clear and re-seed
TRUNCATE TABLE cart, orders, products RESTART IDENTITY CASCADE;

-- Every product has a unique Unsplash photo ID (no duplicates)
INSERT INTO products (name, price, image) VALUES
('Running Shoes',       4999,  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'),
('Laptop',              70000, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop'),
('T-Shirt',             1799,  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop'),
('Samsung S23',         19999, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop'),
('iPhone 14',           69999, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop'),
('Sony Headphones',     29999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop'),
('HP Laptop',           54999, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop'),
('Boat Headphones',     1499,  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop'),
('Samsung Smart TV',    32999, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop'),
('Nike Shoes',          4999,  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop'),
('Apple Watch',         39999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'),
('Power Bank',          1999,  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop'),
('Canon Camera',        41999, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop'),
('Wireless Mouse',      799,   'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop'),
('Keyboard',            2999,  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop'),
('Air Fryer',           8999,  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop'),
('Backpack',            1899,  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop'),
('Gaming Mouse',        1999,  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop'),
('Bluetooth Speaker',   2499,  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop'),
('Tablet',              21999, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop'),
('Office Chair',        6999,  'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&auto=format&fit=crop'),
('Gaming Chair',        12999, 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&auto=format&fit=crop'),
('Electric Kettle',     1499,  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop'),
('Washing Machine',     18999, 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=600&auto=format&fit=crop'),
('Printer',             12999, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop'),
('External Hard Drive', 5499,  'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&auto=format&fit=crop'),
('Desk Lamp',           1299,  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop'),
('Yoga Mat',            999,   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop'),
('Dumbbells',           3499,  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop'),
('Coffee Maker',        5999,  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop'),
('Refrigerator',        25999, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop'),
('Wall Clock',          899,   'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&auto=format&fit=crop'),
('Router',              2999,  'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&auto=format&fit=crop'),
('Wireless Charger',    1999,  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop'),
('Travel Bag',          4999,  'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=600&auto=format&fit=crop'),
('Suitcase',            4999,  'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop'),
('Earbuds',             2999,  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop'),
('Mechanical Keyboard', 3999,  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop'),
('Gaming Laptop',       85999, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop'),
('Study Table',         8999,  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop'),
('Bookshelf',           6999,  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop'),
('Water Bottle',        499,   'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop'),
('Men Casual Shirt',    1299,  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop'),
('Laptop Bag',          1499,  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop'),
('Mini Projector',      8999,  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop'),
('VR Headset',          12999, 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop'),
('Gaming Controller',   3499,  'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&auto=format&fit=crop'),
('LED Monitor',         12999, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop'),
('Fitness Band',        2999,  'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop'),
('Drone Camera',        25999, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&auto=format&fit=crop'),
('Camping Tent',        6999,  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop'),
('Action Camera',       15999, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop'),
('Security Camera',     4999,  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop'),
('Smart Thermostat',    6999,  'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop'),
('Hair Dryer',          1999,  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop'),
('Smart Scale',         2499,  'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&auto=format&fit=crop'),
('Graphic Tablet',      6999,  'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop'),
('Notebook Set',        399,   'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop'),
('Pen Set',             299,   'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop'),
('Desk Organizer',      699,   'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop'),
('Sleeping Bag',        3499,  'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&auto=format&fit=crop'),
('Office Desk',         8999,  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop'),
('Dining Table',        15999, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop'),
('Microwave Oven',      12499, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop'),
('Induction Stove',     2499,  'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&auto=format&fit=crop'),
('Ceiling Fan',         3999,  'https://images.unsplash.com/photo-1513506003901-1e6a35f0c4e8?w=600&auto=format&fit=crop'),
('Smart LED Bulb',      799,   'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&auto=format&fit=crop'),
('Portable SSD',        8999,  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop'),
('Bluetooth Tracker',   1999,  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop'),
('Smart Plug',          1499,  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'),
('Digital Alarm Clock', 999,   'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop'),
('Hiking Boots',        4999,  'https://images.unsplash.com/photo-1520219306100-ec4afba9ea9f?w=600&auto=format&fit=crop'),
('Car Phone Holder',    499,   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop'),
('Smart Door Lock',     9999,  'https://images.unsplash.com/photo-1636953099671-5e5b5e5e5e5e?w=600&auto=format&fit=crop'),
('Solar Power Bank',    2999,  'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=600&auto=format&fit=crop'),
('Electric Scooter',    45999, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&auto=format&fit=crop'),
('Smart Watch',         7999,  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop'),
('Wireless Headphones', 3499,  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop'),
('Air Purifier',        12999, 'https://images.unsplash.com/photo-1626436819559-b5e2e9e5e5e5?w=600&auto=format&fit=crop'),
('Humidifier',          2999,  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop'),
('Electric Toothbrush', 2999,  'https://images.unsplash.com/photo-1559591937-abc8a8b8e8e8?w=600&auto=format&fit=crop'),
('Travel Backpack',     2499,  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&auto=format&fit=crop'),
('Smartphone Stand',    499,   'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&auto=format&fit=crop'),
('Curtains',            1799,  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop'),
('Portable Fan',        799,   'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop'),
('Portable Heater',     3499,  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&auto=format&fit=crop'),
('Bike Helmet',         1999,  'https://images.unsplash.com/photo-1557803175-b9ab5a4d5034?w=600&auto=format&fit=crop'),
('Cycling Gloves',      799,   'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop'),
('Car Vacuum Cleaner',  2499,  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop');

