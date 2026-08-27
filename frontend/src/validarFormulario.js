export function validarFormulario(datos) {
  if (!datos.nombre || !datos.nombre.trim()) {
    return "El nombre es obligatorio";
  }

  if (!datos.producto_id) {
    return "Hay que elegir un producto o categoria";
  }

  if (datos.valor === "" || datos.valor === null || datos.valor === undefined) {
    return "El valor del descuento es obligatorio";
  }

  const valor = Number(datos.valor);
  if (Number.isNaN(valor)) {
    return "El valor no es un numero";
  }

  if (!datos.fecha_inicio || !datos.fecha_fin) {
    return "Las fechas son obligatorias";
  }

  if (new Date(datos.fecha_fin) <= new Date(datos.fecha_inicio)) {
    return "La fecha de fin debe ser posterior a la de inicio";
  }

  if (datos.tipo_descuento === "Porcentaje" && (valor < 1 || valor > 100)) {
    return "Si es porcentaje el valor debe estar entre 1 y 100";
  }

  if (datos.tipo_descuento === "Monto fijo" && valor <= 0) {
    return "El monto fijo tiene que ser mayor a 0";
  }

  return null;
}
