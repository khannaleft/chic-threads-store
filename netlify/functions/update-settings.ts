import type { Handler } from "@netlify/functions";
import postgres from 'postgres';
import type { StoreSettings } from "../../src/types.js";

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
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { settings, password } = body as { settings: Partial<StoreSettings>, password?: string };

    if (password !== ADMIN_PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: Incorrect password.' }) };
    }

    if (!settings || !settings.store_name) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Store name is required." }) };
    }

    const [updatedSettings] = await sql`
      UPDATE store_settings
      SET
        store_name = ${settings.store_name},
        logo_url = ${settings.logo_url || null},
        shop_address = ${settings.shop_address || null},
        instagram_id = ${settings.instagram_id || null},
        whatsapp_number = ${settings.whatsapp_number || null}
      WHERE id = 1
      RETURNING *;
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    };
  } catch (error) {
    console.error("Error updating settings:", error);
    if (error instanceof SyntaxError) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Invalid JSON format." }) };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update settings in the database." }),
    };
  }
};

export { handler };
