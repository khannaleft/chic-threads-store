import type { Handler } from "@netlify/functions";
import postgres from 'postgres';
import type { NewProduct } from "../../src/types.js";

const { DATABASE_URL, ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable is not set');
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { product, password } = body as { product: NewProduct, password?: string };

    if (password !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Incorrect password.' }),
      };
    }

    if (!product || !product.name || !product.price || !product.category) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Bad Request: Missing required product fields." }),
        };
    }

    const [newProduct] = await sql`
      INSERT INTO products (name, price, description, "imageUrl", category)
      VALUES (
        ${product.name}, 
        ${product.price}, 
        ${product.description}, 
        ${product.imageUrl}, 
        ${product.category}
      )
      RETURNING *; 
    `;

    return {
      statusCode: 201, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    };
  } catch (error) {
    console.error("Error adding product:", error);

    if (error instanceof SyntaxError) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Bad Request: Invalid JSON format." }),
        };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to add product to the database." }),
    };
  }
};

export { handler };
