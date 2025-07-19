import 'dotenv/config';
import postgres from 'postgres';
import { PRODUCTS } from '../src/constants.js';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please create a .env file.');
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function seed() {
  console.log('🌱 Starting to seed the database...');

  try {
    console.log('Executing CREATE TABLE statement for "products"...');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        "imageUrl" VARCHAR(255),
        category VARCHAR(100)
      );
    `;
    console.log('✅ "products" table created or already exists.');

    console.log('Executing CREATE TABLE statement for "orders"...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        delivery_method VARCHAR(50) NOT NULL,
        customer_address TEXT,
        customer_city VARCHAR(100),
        customer_state VARCHAR(100),
        customer_zip VARCHAR(20),
        total_price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ "orders" table created or already exists.');
    
    console.log('Executing CREATE TABLE statement for "order_items"...');
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL
      );
    `;
    console.log('✅ "order_items" table created or already exists.');
    
    console.log('Executing CREATE TABLE statement for "store_settings"...');
    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        id SERIAL PRIMARY KEY,
        store_name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(255),
        shop_address TEXT,
        instagram_id VARCHAR(100),
        whatsapp_number VARCHAR(50)
      );
    `;
    console.log('✅ "store_settings" table created or already exists.');

    console.log('Executing CREATE TABLE statement for "reviews"...');
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        author_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ "reviews" table created or already exists.');


    console.log('Inserting default store settings...');
    // Use ON CONFLICT DO NOTHING to avoid errors on re-seeding
    await sql`
      INSERT INTO store_settings (id, store_name, logo_url, shop_address, instagram_id, whatsapp_number)
      VALUES (1, 'Chic Threads', '/vite.svg', '123 Fashion Ave, Style City, 12345', 'chicthreads', '+1234567890')
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('✅ Default store settings inserted if table was empty.');

    console.log('Inserting products... (clearing existing data first)');
    await sql.begin(async (sql) => {
      // Clear reviews before products to avoid foreign key constraint issues
      await sql`DELETE FROM reviews;`;
      await sql`DELETE FROM products;`;
      for (const product of PRODUCTS) {
        await sql`
          INSERT INTO products (id, name, price, description, "imageUrl", category)
          VALUES (${product.id}, ${product.name}, ${product.price}, ${product.description}, ${product.imageUrl}, ${product.category})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            description = EXCLUDED.description,
            "imageUrl" = EXCLUDED."imageUrl",
            category = EXCLUDED.category;
        `;
      }
    });
    console.log(`✅ Inserted/Updated ${PRODUCTS.length} products into the database.`);

    console.log('Seeding sample reviews...');
    await sql`
        INSERT INTO reviews (product_id, rating, comment, author_name) VALUES
        (1, 5, 'Absolutely love this jacket! It fits perfectly and the quality is amazing.', 'Alice'),
        (1, 4, 'Great style, very versatile. A little stiff at first but softens up nicely.', 'Bob'),
        (3, 5, 'These are the best chinos I have ever owned. The fit is perfect and they are so comfortable.', 'Charlie'),
        (4, 5, 'So soft and warm! Worth every penny. I want it in every color.', 'Diana');
    `;
    console.log('✅ Sample reviews inserted.');


    console.log('Database seeding completed successfully! 🎉');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seed();
