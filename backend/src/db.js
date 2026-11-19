const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** Creates the employees table if it does not exist yet. */
async function initDb() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
  await pool.query(sql);
}

module.exports = { pool, initDb };
