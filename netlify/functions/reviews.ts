import type { Handler, HandlerEvent } from "@netlify/functions";
import postgres from 'postgres';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const handler: Handler = async (event: HandlerEvent) => {
    switch (event.httpMethod) {
        case 'GET':
            return getReviews(event);
        case 'POST':
            return addReview(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method Not Allowed' }),
            };
    }
};

async function getReviews(event: HandlerEvent) {
    const productId = event.queryStringParameters?.productId;
    if (!productId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'productId query parameter is required' }),
        };
    }

    try {
        const reviews = await sql`
            SELECT id, product_id, rating, comment, author_name, created_at
            FROM reviews
            WHERE product_id = ${productId}
            ORDER BY created_at DESC
        `;
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviews),
        };
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch reviews' }),
        };
    }
}

async function addReview(event: HandlerEvent) {
    try {
        const body = JSON.parse(event.body || '{}');
        const { productId, rating, comment, author_name } = body;

        if (!productId || !rating || !author_name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields: productId, rating, author_name' }),
            };
        }
        
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
             return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Rating must be a number between 1 and 5' }),
            };
        }

        const [newReview] = await sql`
            INSERT INTO reviews (product_id, rating, comment, author_name)
            VALUES (${productId}, ${rating}, ${comment || ''}, ${author_name})
            RETURNING *
        `;
        
        return {
            statusCode: 201,
            body: JSON.stringify(newReview),
        };
    } catch (error) {
        console.error('Error adding review:', error);
        if (error instanceof SyntaxError) {
             return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON format' }),
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add review' }),
        };
    }
}

export { handler };
