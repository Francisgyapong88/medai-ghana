import pool from "./database";

async function testConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("✅ MariaDB Connected Successfully!");

    connection.release();
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
  }
}

testConnection();