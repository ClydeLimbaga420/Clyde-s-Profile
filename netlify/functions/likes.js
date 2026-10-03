import { neon } from "@neondatabase/serverless";

let client;

function getClient() {
    if (!client) {
        client = neon(process.env.NETLIFY_DB_URL);
    }

    return client;
}

function json(body, status) {
    return new Response(JSON.stringify(body), {
        status: status || 200,
        headers: { "Content-Type": "application/json" }
    });
}

export default async (req) => {
    if (req.method !== "GET" && req.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    try {
        const sql = getClient();

        if (req.method === "POST") {
            const [row] = await sql`
                UPDATE likes
                SET "count" = "count" + 1
                WHERE id = 1
                RETURNING "count"
            `;

            return json({ likes: Number(row["count"]) });
        }

        const [row] = await sql`SELECT "count" FROM likes WHERE id = 1`;

        return json({ likes: Number(row["count"]) });
    } catch (error) {
        console.error("LIKES ERROR:", error);

        return json({ error: "Likes are unavailable" }, 500);
    }
};