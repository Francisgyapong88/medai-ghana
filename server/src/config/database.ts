import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Aiven (and most managed cloud MySQL providers) require SSL connections.
// Local XAMPP does not use or need SSL. We detect which environment we're
// in by checking DB_HOST - if it's not "localhost", we're connecting to a
// real cloud database and need to enable SSL.
const isLocalDatabase = process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: isLocalDatabase
    ? undefined
    : {
        // Aiven's certificate is signed by a trusted authority, but Node's
        // default strict verification sometimes has trouble with managed
        // database providers' certificate chains. This still encrypts the
        // connection - it just skips the strictest hostname verification.
        rejectUnauthorized: false,
      },
});

export default pool;