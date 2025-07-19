import type { Handler, HandlerEvent } from "@netlify/functions";
import postgres from 'postgres';
import type { SortOption } from "../../src/types.js";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const handler: Handler = async (event: HandlerEvent) => {
  try {
    const { search, category, sortBy } = event.queryStringParameters || {};
    const typedSortBy = (sortBy as SortOption) || 'default';

    const sortOptions: Record<SortOption, postgres.PendingQuery<any>> = {
      'default': sql`p.id`,
      'price_asc': sql`p.price ASC`,
      'price_desc': sql`p.price DESC`,
      'name_asc': sql`p.name ASC`,
      'name_desc': sql`p.name DESC`,
    };
    
    const conditions: postgres.PendingQuery<any>[] = [];

    if (search) {
      conditions.push(sql`p.name ILIKE ${'%' + search + '%'}`);
    }
    if (category && category !== 'all') {
      conditions.push(sql`p.category = ${category}`);
    }

    const whereClause = conditions.length > 0
      ? sql`WHERE ${conditions.reduce((prev, curr) => sql`${prev} AND ${curr}`)}`
      : sql``;
      
    const orderByClause = sql`ORDER BY ${sortOptions[typedSortBy]}`;

    const products = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.description, 
        p."imageUrl", 
        p.category,
        COALESCE(AVG(r.rating), 0)::float AS avg_rating,
        COUNT(r.id)::int AS review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      ${whereClause}
      GROUP BY p.id
      ${orderByClause}
    `;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch products from the database." }),
    };
  }
};

export { handler };