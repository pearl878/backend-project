// ========================================
// POSTGRESQL DATABASE CONNECTION
// ========================================

const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "student_db",
    password: "pearl",
    port: 5432
});

module.exports = pool;