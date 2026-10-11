const pool = require("./src/db");

async function testConnection() {
    try {
        const result = await pool.query("SELECT version()");
        console.log("PostgreSQL connected successfully!");
        console.log(result.rows[0].version);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    } finally {
        await pool.end();
    }
}

testConnection();
