import { describe, expect, it } from "vitest";
import { validarFormulario } from "./validarFormulario";

describe("validarFormulario", () => {
  it("pide el nombre", () => {
    const error = validarFormulario({
      nombre: "",
      producto_id: "1",
      tipo_descuento: "Porcentaje",
      valor: "10",
      fecha_inicio: "2026-09-01",
      fecha_fin: "2026-09-10",
    });
    expect(error).toBe("El nombre es obligatorio");
  });

  it("revisa el porcentaje", () => {
    const error = validarFormulario({
      nombre: "Descuento verano",
      producto_id: "1",
      tipo_descuento: "Porcentaje",
      valor: "120",
      fecha_inicio: "2026-09-01",
      fecha_fin: "2026-09-10",
    });
    expect(error).toBe("Si es porcentaje el valor debe estar entre 1 y 100");
  });

  it("deja pasar un formulario valido", () => {
    const error = validarFormulario({
      nombre: "Descuento verano",
      producto_id: "1",
      tipo_descuento: "Porcentaje",
      valor: "15",
      fecha_inicio: "2026-09-01",
      fecha_fin: "2026-09-10",
    });
    expect(error).toBeNull();
  });
});
