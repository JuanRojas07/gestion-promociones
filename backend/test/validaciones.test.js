const test = require("node:test");
const assert = require("node:assert/strict");
const { validarPromocion, siguienteEstado, estadoInicial } = require("../src/validaciones");

test("no deja crear sin nombre", () => {
  const r = validarPromocion({
    nombre: "  ",
    producto_id: 1,
    tipo_descuento: "Porcentaje",
    valor: 10,
    fecha_inicio: "2026-09-01",
    fecha_fin: "2026-09-10",
  });
  assert.equal(r.ok, false);
});

test("no deja crear sin producto", () => {
  const r = validarPromocion({
    nombre: "Promo 2x1",
    producto_id: null,
    tipo_descuento: "Porcentaje",
    valor: 10,
    fecha_inicio: "2026-09-01",
    fecha_fin: "2026-09-10",
  });
  assert.equal(r.ok, false);
});

test("fecha fin tiene que ser despues de inicio", () => {
  const r = validarPromocion({
    nombre: "Promo",
    producto_id: 1,
    tipo_descuento: "Porcentaje",
    valor: 10,
    fecha_inicio: "2026-09-10",
    fecha_fin: "2026-09-01",
  });
  assert.equal(r.ok, false);
});

test("porcentaje entre 1 y 100", () => {
  const malo = validarPromocion({
    nombre: "Promo",
    producto_id: 1,
    tipo_descuento: "Porcentaje",
    valor: 150,
    fecha_inicio: "2026-09-01",
    fecha_fin: "2026-09-10",
  });
  assert.equal(malo.ok, false);

  const bueno = validarPromocion({
    nombre: "Promo",
    producto_id: 1,
    tipo_descuento: "Porcentaje",
    valor: 20,
    fecha_inicio: "2026-09-01",
    fecha_fin: "2026-09-10",
  });
  assert.equal(bueno.ok, true);
});

test("el estado avanza en orden", () => {
  assert.equal(siguienteEstado("Programada"), "Activa");
  assert.equal(siguienteEstado("Activa"), "Finalizada");
  assert.equal(siguienteEstado("Finalizada"), null);
});

test("si la fecha de inicio es futura queda programada", () => {
  const r = estadoInicial("2099-01-01", "2099-01-10");
  assert.equal(r.ok, true);
  assert.equal(r.estado, "Programada");
});
