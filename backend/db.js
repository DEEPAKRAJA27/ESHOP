// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",          // your postgres username
//   host: "localhost",
//   database: "ecommerce",  // database name
//   password: "1234", // 🔴 replace with your postgres password
//   port: 5432,
// });

// module.exports = pool;
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",        // PostgreSQL username
  host: "localhost",
  database: "ecommerce",   // Your database name
  password: "12345",
  port: 5432,
});

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL:", err);
  } else {
    console.log("✅ PostgreSQL Database Connected Successfully");
    release();
  }
});

module.exports = pool;