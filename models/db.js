require("dotenv").config();
const { Pool } = require("pg");

const connectionConfig = {};

if (process.env.DATABASE_URL) {
  connectionConfig.connectionString = process.env.DATABASE_URL;
  connectionConfig.ssl = {
    rejectUnauthorized: false,
  };
} else {
  connectionConfig.user = process.env.DB_USER;
  connectionConfig.host = process.env.DB_HOST;
  connectionConfig.database = process.env.DB_DATABASE;
  connectionConfig.password = process.env.DB_PASSWORD;
  connectionConfig.port = process.env.DB_PORT;
}

const pool = new Pool(connectionConfig);

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error saat koneksi ke database:", err.stack);
  }
  console.log("Koneksi ke database PostgreSQL berhasil!");
  client.release();
});

module.exports = pool;
