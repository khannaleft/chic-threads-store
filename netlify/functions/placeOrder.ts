import type { Handler } from "@netlify/functions";
import postgres from 'postgres';
import type { CartItem, OrderDetails } from "../../src/types.js";

const { DATABASE_URL, ADMIN_NOTIFICATION_EMAIL, SENDER_EMAIL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}
if (!ADMIN_NOTIFICATION_EMAIL) {
  throw new Error('ADMIN_NOTIFICATION_EMAIL environment variable is not set');
}
if (!SENDER_EMAIL) {
    throw new Error('SENDER_EMAIL environment variable is not set');
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { cartItems, customerDetails } = body as { cartItems: CartItem[], customerDetails: OrderDetails };

    if (!cartItems || cartItems.length === 0 || !customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.deliveryMethod) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Missing required customer or order fields." }) };
    }
    if (customerDetails.deliveryMethod === 'delivery' && (!customerDetails.address || !customerDetails.city || !customerDetails.state || !customerDetails.zip)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Missing address details for a delivery order." }) };
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [newOrder] = await sql.begin(async (sql) => {
      const [order] = await sql`
        INSERT INTO orders (
            customer_name, customer_email, total_price, customer_phone,
            delivery_method, customer_address, customer_city, customer_state, customer_zip
        )
        VALUES (
            ${customerDetails.name}, ${customerDetails.email}, ${total}, ${customerDetails.phone},
            ${customerDetails.deliveryMethod}, ${customerDetails.address || null}, ${customerDetails.city || null}, ${customerDetails.state || null}, ${customerDetails.zip || null}
        )
        RETURNING *;
      `;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      
      await sql`INSERT INTO order_items ${sql(orderItems, 'order_id', 'product_id', 'quantity', 'price')}`;

      return [order];
    });
    
    const [settings] = await sql`SELECT store_name, shop_address FROM store_settings WHERE id = 1`;

    console.log('--- ADMIN: NEW ORDER NOTIFICATION ---');
    console.log(`Sending notification to: ${ADMIN_NOTIFICATION_EMAIL}`);
    console.log(`Order ID: #${newOrder.id}`);
    
    // ... Email simulation logging ...

    return {
      statusCode: 201, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    };

  } catch (error) {
    console.error("Error placing order:", error);
    if (error instanceof SyntaxError) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Invalid JSON." }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to place order." }) };
  }
};

export { handler };
