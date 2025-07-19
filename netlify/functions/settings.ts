import type { Handler } from "@netlify/functions";
import postgres from 'postgres';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const handler: Handler = async () => {
  try {
    const [settings] = await sql`SELECT * FROM store_settings WHERE id = 1`;
    
    if (!settings) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Store settings not found." }),
        };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch store settings." }),
    };
  }
};

export { handler };
