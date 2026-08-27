const express = require("express");
const cors = require("cors");
const { pool, esperarBd } = require("./db");
const { validarPromocion, siguienteEstado, estadoInicial } = require("./validaciones");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(503).json({ status: "error" });
  }
});

app.get("/productos", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM productos ORDER BY id");
    res.json(resultado.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al listar productos" });
  }
});

app.get("/resumen", async (req, res) => {
  try {
    const porEstado = await pool.query(
      "SELECT estado, COUNT(*)::int AS total FROM promociones GROUP BY estado"
    );

    const vigentes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM promociones WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin"
    );

    const resumen = {
      Programada: 0,
      Activa: 0,
      Finalizada: 0,
      vigentes_hoy: vigentes.rows[0].total,
    };

    porEstado.rows.forEach((fila) => {
      resumen[fila.estado] = fila.total;
    });

    res.json(resumen);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el resumen" });
  }
});

app.get("/promociones", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, pr.nombre AS producto_nombre, pr.tipo AS producto_tipo
      FROM promociones p
      JOIN productos pr ON pr.id = p.producto_id
      ORDER BY p.id DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al listar promociones" });
  }
});

app.post("/promociones", async (req, res) => {
  const validacion = validarPromocion(req.body);
  if (!validacion.ok) {
    return res.status(400).json({ error: validacion.mensaje });
  }

  const inicial = estadoInicial(req.body.fecha_inicio, req.body.fecha_fin);
  if (!inicial.ok) {
    return res.status(400).json({ error: inicial.mensaje });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO promociones
        (nombre, producto_id, tipo_descuento, valor, fecha_inicio, fecha_fin, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.body.nombre.trim(),
        req.body.producto_id,
        req.body.tipo_descuento,
        req.body.valor,
        req.body.fecha_inicio,
        req.body.fecha_fin,
        inicial.estado,
      ]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "No se pudo crear la promocion" });
  }
});

app.put("/promociones/:id", async (req, res) => {
  try {
    const actual = await pool.query("SELECT * FROM promociones WHERE id = $1", [req.params.id]);
    if (actual.rows.length === 0) {
      return res.status(404).json({ error: "No existe esa promocion" });
    }

    if (actual.rows[0].estado === "Finalizada") {
      return res.status(400).json({ error: "Una promocion finalizada no se puede modificar" });
    }

    const validacion = validarPromocion(req.body);
    if (!validacion.ok) {
      return res.status(400).json({ error: validacion.mensaje });
    }

    const resultado = await pool.query(
      `UPDATE promociones
       SET nombre = $1, producto_id = $2, tipo_descuento = $3, valor = $4,
           fecha_inicio = $5, fecha_fin = $6
       WHERE id = $7
       RETURNING *`,
      [
        req.body.nombre.trim(),
        req.body.producto_id,
        req.body.tipo_descuento,
        req.body.valor,
        req.body.fecha_inicio,
        req.body.fecha_fin,
        req.params.id,
      ]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "No se pudo actualizar la promocion" });
  }
});

app.patch("/promociones/:id/estado", async (req, res) => {
  try {
    const actual = await pool.query("SELECT * FROM promociones WHERE id = $1", [req.params.id]);
    if (actual.rows.length === 0) {
      return res.status(404).json({ error: "No existe esa promocion" });
    }

    const promocion = actual.rows[0];
    if (promocion.estado === "Finalizada") {
      return res.status(400).json({ error: "Una promocion finalizada no se puede modificar" });
    }

    const siguiente = siguienteEstado(promocion.estado);
    if (!siguiente) {
      return res.status(400).json({ error: "No se puede cambiar el estado" });
    }

    if (req.body.estado && req.body.estado !== siguiente) {
      return res.status(400).json({ error: "El estado solo puede avanzar en orden: Programada, Activa, Finalizada" });
    }

    const resultado = await pool.query(
      "UPDATE promociones SET estado = $1 WHERE id = $2 RETURNING *",
      [siguiente, req.params.id]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "No se pudo cambiar el estado" });
  }
});

app.delete("/promociones/:id", async (req, res) => {
  try {
    const actual = await pool.query("SELECT * FROM promociones WHERE id = $1", [req.params.id]);
    if (actual.rows.length === 0) {
      return res.status(404).json({ error: "No existe esa promocion" });
    }

    if (actual.rows[0].estado !== "Programada") {
      return res.status(400).json({ error: "Solo se pueden eliminar promociones en estado Programada" });
    }

    await pool.query("DELETE FROM promociones WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "No se pudo eliminar la promocion" });
  }
});

async function start() {
  await esperarBd();
  app.listen(PORT, () => {
    console.log("backend escuchando en puerto " + PORT);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
