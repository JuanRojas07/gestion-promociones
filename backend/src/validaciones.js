function parseFecha(valor) {
  const texto = String(valor).slice(0, 10);
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function validarPromocion(datos) {
  if (!datos.nombre || !String(datos.nombre).trim()) {
    return { ok: false, mensaje: "El nombre es obligatorio" };
  }

  if (!datos.producto_id) {
    return { ok: false, mensaje: "Hay que elegir un producto o categoria" };
  }

  if (datos.valor === undefined || datos.valor === null || datos.valor === "") {
    return { ok: false, mensaje: "El valor del descuento es obligatorio" };
  }

  const valor = Number(datos.valor);
  if (Number.isNaN(valor)) {
    return { ok: false, mensaje: "El valor del descuento no es valido" };
  }

  if (!datos.fecha_inicio || !datos.fecha_fin) {
    return { ok: false, mensaje: "Las fechas son obligatorias" };
  }

  if (parseFecha(datos.fecha_fin) <= parseFecha(datos.fecha_inicio)) {
    return { ok: false, mensaje: "La fecha de fin debe ser posterior a la de inicio" };
  }

  if (datos.tipo_descuento === "Porcentaje") {
    if (valor < 1 || valor > 100) {
      return { ok: false, mensaje: "Si es porcentaje el valor debe estar entre 1 y 100" };
    }
  }

  if (datos.tipo_descuento === "Monto fijo") {
    if (valor <= 0) {
      return { ok: false, mensaje: "El monto fijo tiene que ser mayor a 0" };
    }
  }

  if (datos.tipo_descuento !== "Porcentaje" && datos.tipo_descuento !== "Monto fijo") {
    return { ok: false, mensaje: "El tipo de descuento no es valido" };
  }

  return { ok: true };
}

function siguienteEstado(estadoActual) {
  if (estadoActual === "Programada") return "Activa";
  if (estadoActual === "Activa") return "Finalizada";
  return null;
}

function estadoInicial(fechaInicio, fechaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = parseFecha(fechaInicio);
  const fin = parseFecha(fechaFin);

  if (fin < hoy) {
    return { ok: false, mensaje: "No se puede crear una promocion que ya vencio" };
  }

  if (inicio > hoy) return { ok: true, estado: "Programada" };
  return { ok: true, estado: "Activa" };
}

module.exports = {
  validarPromocion,
  siguienteEstado,
  estadoInicial,
};
