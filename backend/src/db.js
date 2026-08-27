const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function esperarBd() {
  for (let i = 0; i < 15; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("conexion a postgres ok");
      return;
    } catch (error) {
      console.log("esperando la base de datos...", i + 1);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("no se pudo conectar a la base de datos");
}

module.exports = {
  pool,
  esperarBd,
};
