import { useEffect, useState } from "react";
import { validarFormulario } from "./validarFormulario";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const formVacio = {
  nombre: "",
  producto_id: "",
  tipo_descuento: "Porcentaje",
  valor: "",
  fecha_inicio: "",
  fecha_fin: "",
};

function formatoFecha(valor) {
  if (!valor) return "";
  return String(valor).slice(0, 10);
}

export default function App() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resumen, setResumen] = useState({
    Programada: 0,
    Activa: 0,
    Finalizada: 0,
    vigentes_hoy: 0,
  });
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function cargarTodo() {
    try {
      const [p, pr, r] = await Promise.all([
        fetch(API + "/promociones"),
        fetch(API + "/productos"),
        fetch(API + "/resumen"),
      ]);
      setPromociones(await p.json());
      setProductos(await pr.json());
      setResumen(await r.json());
    } catch (err) {
      console.log(err);
      setError("No se pudo cargar la informacion. Revisa si el backend esta prendido.");
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  function cambiarCampo(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setOk("");

    const errorForm = validarFormulario(form);
    if (errorForm) {
      setError(errorForm);
      return;
    }

    const payload = {
      ...form,
      producto_id: Number(form.producto_id),
      valor: Number(form.valor),
    };

    const url = editandoId ? API + "/promociones/" + editandoId : API + "/promociones";
    const metodo = editandoId ? "PUT" : "POST";

    const resp = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setError(data.error || "No se pudo guardar");
      return;
    }

    setOk(editandoId ? "Promocion actualizada" : "Promocion creada");
    setForm(formVacio);
    setEditandoId(null);
    cargarTodo();
  }

  function editar(promo) {
    if (promo.estado === "Finalizada") {
      setError("Una promocion finalizada no se puede modificar");
      return;
    }

    setError("");
    setEditandoId(promo.id);
    setForm({
      nombre: promo.nombre,
      producto_id: String(promo.producto_id),
      tipo_descuento: promo.tipo_descuento,
      valor: String(promo.valor),
      fecha_inicio: formatoFecha(promo.fecha_inicio),
      fecha_fin: formatoFecha(promo.fecha_fin),
    });
  }

  async function cambiarEstado(id) {
    setError("");
    const resp = await fetch(API + "/promociones/" + id + "/estado", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setError(data.error || "No se pudo cambiar el estado");
      return;
    }
    cargarTodo();
  }

  async function eliminar(id) {
    if (!window.confirm("Seguro que quieres eliminar esta promocion?")) return;
    setError("");
    const resp = await fetch(API + "/promociones/" + id, { method: "DELETE" });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      setError(data.error || "No se pudo eliminar");
      return;
    }
    cargarTodo();
  }

  return (
    <div className="pagina">
      <h1>Gestion de promociones</h1>
      <p className="subtitulo">Registro sencillo para controlar vigencia y estado</p>

      <section className="resumen">
        <div className="tarjeta">
          <span>Programadas</span>
          <strong>{resumen.Programada}</strong>
        </div>
        <div className="tarjeta">
          <span>Activas</span>
          <strong>{resumen.Activa}</strong>
        </div>
        <div className="tarjeta">
          <span>Finalizadas</span>
          <strong>{resumen.Finalizada}</strong>
        </div>
        <div className="tarjeta vigente">
          <span>Vigentes hoy</span>
          <strong>{resumen.vigentes_hoy}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>{editandoId ? "Editar promocion" : "Nueva promocion"}</h2>
        {error && <p className="error">{error}</p>}
        {ok && <p className="ok">{ok}</p>}

        <form onSubmit={guardar}>
          <label>
            Nombre
            <input
              value={form.nombre}
              onChange={(e) => cambiarCampo("nombre", e.target.value)}
              placeholder="Ej: Descuento de temporada"
            />
          </label>

          <label>
            Producto o categoria
            <select
              value={form.producto_id}
              onChange={(e) => cambiarCampo("producto_id", e.target.value)}
            >
              <option value="">Selecciona...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.tipo})
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de descuento
            <select
              value={form.tipo_descuento}
              onChange={(e) => cambiarCampo("tipo_descuento", e.target.value)}
            >
              <option value="Porcentaje">Porcentaje</option>
              <option value="Monto fijo">Monto fijo</option>
            </select>
          </label>

          <label>
            Valor
            <input
              type="number"
              value={form.valor}
              onChange={(e) => cambiarCampo("valor", e.target.value)}
            />
          </label>

          <label>
            Fecha inicio
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => cambiarCampo("fecha_inicio", e.target.value)}
            />
          </label>

          <label>
            Fecha fin
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(e) => cambiarCampo("fecha_fin", e.target.value)}
            />
          </label>

          <div className="acciones">
            <button type="submit">{editandoId ? "Guardar cambios" : "Crear"}</button>
            {editandoId && (
              <button
                type="button"
                className="secundario"
                onClick={() => {
                  setEditandoId(null);
                  setForm(formVacio);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Listado</h2>
        {promociones.length === 0 && <p>Todavia no hay promociones.</p>}
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Producto / categoria</th>
              <th>Descuento</th>
              <th>Vigencia</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {promociones.map((promo) => (
              <tr key={promo.id}>
                <td>{promo.nombre}</td>
                <td>
                  {promo.producto_nombre}
                  <small> {promo.producto_tipo}</small>
                </td>
                <td>
                  {promo.tipo_descuento === "Porcentaje"
                    ? promo.valor + "%"
                    : "$" + promo.valor}
                </td>
                <td>
                  {formatoFecha(promo.fecha_inicio)} a {formatoFecha(promo.fecha_fin)}
                </td>
                <td>{promo.estado}</td>
                <td className="botones">
                  {promo.estado !== "Finalizada" && (
                    <button type="button" onClick={() => editar(promo)}>
                      Editar
                    </button>
                  )}
                  {promo.estado === "Programada" && (
                    <button type="button" onClick={() => cambiarEstado(promo.id)}>
                      Activar
                    </button>
                  )}
                  {promo.estado === "Activa" && (
                    <button type="button" onClick={() => cambiarEstado(promo.id)}>
                      Finalizar
                    </button>
                  )}
                  {promo.estado === "Programada" && (
                    <button type="button" className="peligro" onClick={() => eliminar(promo.id)}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
