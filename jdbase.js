
const { Pool } = require("pg");

const jdbase = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

jdbase.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

module.exports = jdbase;
