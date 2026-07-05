-- ============================================================
-- SEED DATA — Kenya E-Commerce Platform
-- Run AFTER all migrations. Uses service-role (supabase_admin).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. CATEGORIES
-- ────────────────────────────────────────────────────────────
insert into public.categories (id, name, slug, description, sort_order, is_active) values
  ('a0000000-0000-0000-0000-000000000001', 'Fashion',        'fashion',        'Clothing, shoes, and accessories',                          1, true),
  ('a0000000-0000-0000-0000-000000000002', 'Electronics',    'electronics',    'Phones, laptops, gadgets, and accessories',                 2, true),
  ('a0000000-0000-0000-0000-000000000003', 'Beauty & Health','beauty-health',  'Skincare, makeup, haircare, and wellness products',         3, true),
  ('a0000000-0000-0000-0000-000000000004', 'Home & Living',  'home-living',    'Furniture, decor, kitchen, and household essentials',       4, true),
  ('a0000000-0000-0000-0000-000000000005', 'Groceries',      'groceries',      'Fresh produce, pantry staples, and beverages',              5, true),
  ('a0000000-0000-0000-0000-000000000006', 'Sports & Outdoors','sports-outdoors','Fitness gear, outdoor equipment, and sportswear',        6, true),
  ('a0000000-0000-0000-0000-000000000007', 'Books & Stationery','books-stationery','Textiles, notebooks, pens, and learning materials',     7, true),
  ('a0000000-0000-0000-0000-000000000008', 'Kids & Baby',    'kids-baby',      'Toys, clothing, and essentials for children and infants',   8, true);

-- Subcategories
insert into public.categories (id, parent_id, name, slug, description, sort_order, is_active) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Women''s Clothing',  'womens-clothing',  'Dresses, tops, skirts, and more',       1, true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Men''s Clothing',    'mens-clothing',    'Shirts, trousers, jackets, and more',   2, true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Shoes',              'shoes',            'Sneakers, heels, sandals, and boots',   3, true),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Accessories',        'accessories',      'Bags, jewellery, watches, and hats',    4, true),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Smartphones',        'smartphones',      'Android and iOS phones',                1, true),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Laptops',            'laptops',          'Notebooks, tablets, and accessories',   2, true),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Audio',              'audio',            'Headphones, speakers, and earbuds',     3, true),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'Skincare',           'skincare',         'Moisturizers, cleansers, and serums',   1, true),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'Makeup',             'makeup',           'Lipstick, foundation, and eyeshadow',   2, true),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'Furniture',          'furniture',        'Chairs, tables, and sofas',             1, true),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', 'Kitchen',            'kitchen',          'Cookware, utensils, and appliances',    2, true);

-- ────────────────────────────────────────────────────────────
-- 2. USERS (via auth.users + profiles)
--    Password for all seed users: Password123!
-- ────────────────────────────────────────────────────────────

-- Admin user
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  'c0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@kenyaecommerce.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}'
);

insert into public.profiles (id, email, display_name, phone, status) values
  ('c0000000-0000-0000-0000-000000000001', 'admin@kenyaecommerce.com', 'Admin User', '+254700000001', 'active');

insert into public.user_roles (user_id, role, granted_by) values
  ('c0000000-0000-0000-0000-000000000001', 'super_admin', 'c0000000-0000-0000-0000-000000000001');

-- Seller user
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  'c0000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'seller@kenyaecommerce.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Grace Wanjiku"}'
);

insert into public.profiles (id, email, display_name, phone, status, default_country_code) values
  ('c0000000-0000-0000-0000-000000000002', 'seller@kenyaecommerce.com', 'Grace Wanjiku', '+254700000002', 'active', 'KE');

insert into public.user_roles (user_id, role, granted_by) values
  ('c0000000-0000-0000-0000-000000000002', 'seller', 'c0000000-0000-0000-0000-000000000001');

-- Buyer user
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  'c0000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'buyer@kenyaecommerce.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Amina Hassan"}'
);

insert into public.profiles (id, email, display_name, phone, status, default_country_code) values
  ('c0000000-0000-0000-0000-000000000003', 'buyer@kenyaecommerce.com', 'Amina Hassan', '+254700000003', 'active', 'KE');

insert into public.user_roles (user_id, role, granted_by) values
  ('c0000000-0000-0000-0000-000000000003', 'buyer', 'c0000000-0000-0000-0000-000000000001');

-- Second seller
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  'c0000000-0000-0000-0000-000000000004',
  'authenticated',
  'authenticated',
  'james@kenyaecommerce.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"James Ochieng"}'
);

insert into public.profiles (id, email, display_name, phone, status, default_country_code) values
  ('c0000000-0000-0000-0000-000000000004', 'james@kenyaecommerce.com', 'James Ochieng', '+254700000004', 'active', 'KE');

insert into public.user_roles (user_id, role, granted_by) values
  ('c0000000-0000-0000-0000-000000000004', 'seller', 'c0000000-0000-0000-0000-000000000001');

-- ────────────────────────────────────────────────────────────
-- 3. SELLERS (stores)
-- ────────────────────────────────────────────────────────────
insert into public.sellers (id, owner_id, store_name, slug, description, status, kyc_status, country_code, support_email, support_phone) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Nairobi Fashion Hub',   'nairobi-fashion-hub',   'Premium fashion for the modern Kenyan woman. Sustainable, stylish, and affordable.', 'active', 'approved', 'KE', 'support@nairobifashion.co.ke', '+254711000001'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'TechZone Kenya',        'techzone-kenya',         'Latest electronics at competitive prices. Genuine products with warranty.',         'active', 'approved', 'KE', 'hello@techzone.co.ke',     '+254711000002');

-- ────────────────────────────────────────────────────────────
-- 4. PRODUCTS
-- ────────────────────────────────────────────────────────────

-- Fashion Hub products
insert into public.products (id, seller_id, category_id, name, slug, description, status, base_price_minor, compare_at_price_minor, currency, is_featured, published_at) values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Ankara Maxi Dress',          'ankara-maxi-dress',          'Beautiful handcrafted Ankara maxi dress with modern cut. Perfect for weddings and special occasions.', 'active', 450000, 550000, 'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Kikoy Wrap Skirt',           'kikoy-wrap-skirt',           'Lightweight Kikoy wrap skirt ideal for the Kenyan coast. Handwoven cotton.',                            'active', 280000, null,     'KES', false, now()),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Linen Safari Shirt',         'linen-safari-shirt',         'Breathable linen shirt in earth tones. Perfect for the Nairobi climate.',                                'active', 320000, 380000, 'KES', false, now()),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Leather Safari Boots',        'leather-safari-boots',        'Genuine leather boots handmade in Kenya. Durable and stylish.',                                          'active', 650000, null,     'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Maasai Beaded Necklace',     'maasai-beaded-necklace',     'Authentic Maasai beadwork necklace. Each piece is unique and tells a story.',                            'active', 180000, 220000, 'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Cotton Kaftan Top',          'cotton-kaftan-top',          'Relaxed-fit cotton kaftan with African print accents. Versatile and comfortable.',                        'active', 220000, null,     'KES', false, now()),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Woven Raffia Bag',           'woven-raffia-bag',           'Handwoven raffia tote bag. Eco-friendly and spacious for everyday use.',                                 'active', 350000, 420000, 'KES', false, now());

-- TechZone products
insert into public.products (id, seller_id, category_id, name, slug, description, status, base_price_minor, compare_at_price_minor, currency, is_featured, published_at) values
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'Samsung Galaxy A54',         'samsung-galaxy-a54',         'Samsung Galaxy A54 5G. 128GB, 6GB RAM. Amazing camera and battery life.',                                'active', 3800000, 4200000, 'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'HP Laptop 15',               'hp-laptop-15',               'HP 15.6" laptop, Intel Core i5, 8GB RAM, 256GB SSD. Perfect for work and study.',                       'active', 5500000, 6200000, 'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'JBL Tune 510BT Headphones', 'jbl-tune-510bt',             'Wireless on-ear headphones with 40-hour battery. Pure bass sound.',                                     'active', 450000, 550000, 'KES', false, now()),
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'iPhone 14',                  'iphone-14',                  'Apple iPhone 14, 128GB. A15 Bionic chip, advanced camera system.',                                       'active', 8500000, 9200000, 'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'MacBook Air M2',             'macbook-air-m2',             'Apple MacBook Air M2, 8GB RAM, 256GB SSD. Ultra-thin, all-day battery.',                                'active', 14500000, null,     'KES', true,  now()),
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'Anker Soundcore Speaker',    'anker-soundcore',            'Portable Bluetooth speaker with deep bass. IPX7 waterproof.',                                           'active', 320000, 380000, 'KES', false, now());

-- ────────────────────────────────────────────────────────────
-- 5. PRODUCT IMAGES (placeholder URLs using picsum)
-- ────────────────────────────────────────────────────────────
insert into public.product_images (product_id, url, alt_text, sort_order, is_primary) values
  ('e0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/ankara-dress/600/800',     'Ankara Maxi Dress',           0, true),
  ('e0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/kikoy-skirt/600/800',     'Kikoy Wrap Skirt',            0, true),
  ('e0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/safari-shirt/600/800',    'Linen Safari Shirt',          0, true),
  ('e0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/safari-boots/600/800',    'Leather Safari Boots',        0, true),
  ('e0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/maasai-necklace/600/800', 'Maasai Beaded Necklace',      0, true),
  ('e0000000-0000-0000-0000-000000000006', 'https://picsum.photos/seed/kaftan-top/600/800',      'Cotton Kaftan Top',           0, true),
  ('e0000000-0000-0000-0000-000000000007', 'https://picsum.photos/seed/raffia-bag/600/800',      'Woven Raffia Bag',            0, true),
  ('e0000000-0000-0000-0000-000000000008', 'https://picsum.photos/seed/galaxy-a54/600/800',      'Samsung Galaxy A54',          0, true),
  ('e0000000-0000-0000-0000-000000000009', 'https://picsum.photos/seed/hp-laptop/600/800',       'HP Laptop 15',                0, true),
  ('e0000000-0000-0000-0000-000000000010', 'https://picsum.photos/seed/jbl-headphones/600/800',  'JBL Tune 510BT Headphones',   0, true),
  ('e0000000-0000-0000-0000-000000000011', 'https://picsum.photos/seed/iphone-14/600/800',       'iPhone 14',                   0, true),
  ('e0000000-0000-0000-0000-000000000012', 'https://picsum.photos/seed/macbook-air/600/800',     'MacBook Air M2',              0, true),
  ('e0000000-0000-0000-0000-000000000013', 'https://picsum.photos/seed/anker-speaker/600/800',   'Anker Soundcore Speaker',     0, true);

-- ────────────────────────────────────────────────────────────
-- 6. SAMPLE ORDERS
-- ────────────────────────────────────────────────────────────
insert into public.orders (id, order_number, buyer_id, seller_id, status, payment_status, fulfillment_status, subtotal_minor, shipping_minor, discount_minor, tax_minor, total_minor, currency, shipping_address, placed_at) values
  ('f0000000-0000-0000-0000-000000000001', 'KE-2026-000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'delivered',  'paid',     'fulfilled',  450000, 150000, 0, 0, 600000, 'KES', '{"name":"Amina Hassan","phone":"+254700000003","line1":"Kenyatta Avenue","city":"Nairobi","county":"Nairobi","country":"KE"}', now() - interval '14 days'),
  ('f0000000-0000-0000-0000-000000000002', 'KE-2026-000002', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'shipped',   'paid',     'partial',    3800000, 0, 0, 0, 3800000, 'KES', '{"name":"Amina Hassan","phone":"+254700000003","line1":"Kenyatta Avenue","city":"Nairobi","county":"Nairobi","country":"KE"}', now() - interval '5 days'),
  ('f0000000-0000-0000-0000-000000000003', 'KE-2026-000003', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'processing','paid',     'unfulfilled',180000, 100000, 20000, 0, 260000, 'KES', '{"name":"Amina Hassan","phone":"+254700000003","line1":"Kenyatta Avenue","city":"Nairobi","county":"Nairobi","country":"KE"}', now() - interval '2 days');

insert into public.order_items (order_id, product_id, seller_id, product_name, quantity, unit_price_minor, total_minor, currency) values
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Ankara Maxi Dress',    1, 450000, 450000, 'KES'),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 'Samsung Galaxy A54',   1, 3800000, 3800000, 'KES'),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Maasai Beaded Necklace',1, 180000, 180000, 'KES');

-- ────────────────────────────────────────────────────────────
-- 7. SAMPLE REVIEWS
-- ────────────────────────────────────────────────────────────
insert into public.reviews (product_id, seller_id, buyer_id, rating, title, body, status) values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 5, 'Absolutely stunning!',   'The dress exceeded my expectations. The fabric quality is excellent and the fit is perfect.', 'published'),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 4, 'Great phone for the price','Battery life is impressive. Camera could be slightly better in low light.',           'published');

-- ────────────────────────────────────────────────────────────
-- 8. SAMPLE WISHLIST
-- ────────────────────────────────────────────────────────────
insert into public.wishlists (id, user_id, name, is_default) values
  ('aa000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Default', true);

insert into public.wishlist_items (wishlist_id, product_id) values
  ('aa000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004'),
  ('aa000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000012');
