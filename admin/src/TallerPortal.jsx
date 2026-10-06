import { useEffect, useState } from "react";

const NOTA_LABELS = {
  notaNumero: "Numero de nota",
  notaAsesor: "Asesor",
  notaNumeroProforma: "Proforma",
  notaJoya: "Joya",
  notaMetal: "Metal",
  notaColor: "Color",
  notaPiedraCentral: "Piedra central",
  notaPiedraCentralTamano: "Tamano piedra central",
  notaPiedraLateral: "Piedra lateral",
  notaPiedraLateralTamano: "Tamano piedra lateral",
  notaCorteCentral: "Corte central",
  notaCorteLateral: "Corte lateral",
  notaTallaV: "Talla V",
  notaTallaD: "Talla D",
  notaAnchoV: "Ancho V",
  notaAnchoD: "Ancho D",
  notaGrabadoV: "Grabado V",
  notaGrabadoD: "Grabado D",
  notaPesoTotal: "Peso total",
  notaPrioridadFechaEntrega: "Prioridad / fecha de entrega",
  notaFechaEnviadaTallerIda: "Enviada a taller (ida)",
  notaFechaEnviadaTallerRegreso: "Regreso de taller",
  notaDescripcion: "Descripcion",
};

const ESTADO_LABELS = {
  EN_TALLER: "En taller",
  LISTO_PARA_ENVIO: "Listo para envio",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
};

function cdnImg(url, width) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

function TallerHistorialLista({ historial }) {
  if (!historial?.length) return <small className="subtle">Sin movimientos registrados</small>;
  return (
    <ol className="tallerHistorial">
      {historial.map((h) => (
        <li key={h.id}>
          <strong>{h.etapaNombre}</strong>
          <small>{new Date(h.createdAt).toLocaleString()}{h.usuario ? ` — ${h.usuario}` : ""}</small>
          {h.fotos?.length > 0 && (
            <div className="tallerHistorialFotos">
              {h.fotos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={cdnImg(url, 120)} alt="" className="imagePreviewThumb" />
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function NotaDePedido({ nota, fotos }) {
  const campos = Object.entries(NOTA_LABELS).filter(([key]) => nota?.[key]);
  if (campos.length === 0 && !fotos?.length) return <small className="subtle">La nota de pedido aun no tiene datos</small>;
  return (
    <div className="tallerNota">
      {campos.map(([key, label]) => (
        <small key={key}><strong>{label}:</strong> {nota[key]}</small>
      ))}
      {fotos?.length > 0 && (
        <div className="tallerHistorialFotos">
          {fotos.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img src={cdnImg(url, 120)} alt="" className="imagePreviewThumb" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TallerPortal({ apiUrl, token, user, onLogout }) {
  const [taller, setTaller] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [vista, setVista] = useState("proceso");
  const [etapaFiltro, setEtapaFiltro] = useState(null);
  const [pendientes, setPendientes] = useState({});
  const [guardando, setGuardando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function api(path, options = {}) {
    const response = await fetch(`${apiUrl}/api/taller${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Ocurrio un error inesperado");
    return data;
  }

  async function cargar() {
    setError("");
    try {
      const data = await api("/pedidos");
      setTaller(data.taller);
      setPedidos(data.pedidos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const activos = pedidos.filter((p) => p.estado === "EN_TALLER");
  const terminados = pedidos.filter((p) => p.estado !== "EN_TALLER");
  const visibles = (vista === "proceso" ? activos : terminados).filter(
    (p) => vista !== "proceso" || etapaFiltro === null || p.etapaTallerId === etapaFiltro
  );

  function setPendiente(orderId, patch) {
    setPendientes((prev) => ({ ...prev, [orderId]: { ...prev[orderId], ...patch } }));
  }

  async function guardarEtapa(pedido, etapaOverride) {
    const pending = pendientes[pedido.id] || {};
    const etapaTallerId = Number(etapaOverride ?? pending.etapaId ?? pedido.etapaTallerId);
    const files = pending.files || [];
    if (etapaTallerId === pedido.etapaTallerId && files.length === 0) return;

    setError("");
    setGuardando(pedido.id);
    try {
      const fotos = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const data = await api("/upload-image", { method: "POST", body: formData });
        fotos.push(data.url);
      }
      await api(`/pedidos/${pedido.id}/etapa`, {
        method: "PATCH",
        body: JSON.stringify({ etapaTallerId, fotos }),
      });
      setPendientes((prev) => {
        const next = { ...prev };
        delete next[pedido.id];
        return next;
      });
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(null);
    }
  }

  async function marcarListo(pedido) {
    if (!window.confirm(`Marcar el pedido #${pedido.id} como listo para envio?`)) return;
    setError("");
    try {
      await api(`/pedidos/${pedido.id}/listo`, { method: "PATCH" });
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <header className="topBar panel">
        <div className="topBarLeft">
          <div>
            <p className="eyebrow">Taller</p>
            <h1>{taller?.nombre || "Pedidos de taller"}</h1>
          </div>
        </div>
        <div className="topBarRight">
          <div className="userMeta">
            <strong>{user?.name || "Taller"}</strong>
            <small>{user?.email || ""}</small>
          </div>
          <button className="ghost" onClick={onLogout}>Cerrar sesion</button>
        </div>
      </header>

      <section className="panel">
        <div className="orderStageBar">
          <button type="button" className={vista === "proceso" ? "stageChip active" : "stageChip"} onClick={() => { setVista("proceso"); setEtapaFiltro(null); }}>
            En proceso<span className="stageChipCount">{activos.length}</span>
          </button>
          <button type="button" className={vista === "terminados" ? "stageChip active" : "stageChip"} onClick={() => setVista("terminados")}>
            Terminados<span className="stageChipCount">{terminados.length}</span>
          </button>
        </div>

        {vista === "proceso" && taller && (
          <div className="orderStageBar">
            <button type="button" className={etapaFiltro === null ? "stageChip active" : "stageChip"} onClick={() => setEtapaFiltro(null)}>
              Todas<span className="stageChipCount">{activos.length}</span>
            </button>
            {taller.etapas.map((etapa) => (
              <button
                type="button"
                key={etapa.id}
                className={etapaFiltro === etapa.id ? "stageChip active" : "stageChip"}
                onClick={() => setEtapaFiltro(etapa.id)}
              >
                {etapa.nombre}<span className="stageChipCount">{activos.filter((p) => p.etapaTallerId === etapa.id).length}</span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {cargando && <p className="subtle">Cargando pedidos...</p>}
        {!cargando && visibles.length === 0 && (
          <p className="subtle">{vista === "proceso" ? "No hay pedidos en esta fase." : "Todavia no hay pedidos terminados."}</p>
        )}

        {visibles.map((pedido) => {
          const pending = pendientes[pedido.id] || {};
          const files = pending.files || [];
          const siguiente = taller.etapas[taller.etapas.findIndex((e) => e.id === pedido.etapaTallerId) + 1];
          const enProceso = pedido.estado === "EN_TALLER";
          return (
            <article key={pedido.id} className="card tallerCard">
              <div className="card-info">
                <div className="orderHeader">
                  <strong>Pedido #{pedido.id}</strong>
                  <span className={`orderBadge ${pedido.estado.toLowerCase()}`}>{ESTADO_LABELS[pedido.estado] || pedido.estado}</span>
                </div>
                <small>Cliente: {pedido.clienteNombre || "—"}</small>
                <ul className="orderItems">
                  {pedido.items.map((item) => (
                    <li key={item.id}>{item.quantity}x {item.descripcion}</li>
                  ))}
                </ul>
                <details>
                  <summary>Nota de pedido</summary>
                  <NotaDePedido nota={pedido.nota} fotos={pedido.notaFotos} />
                </details>
                <TallerHistorialLista historial={pedido.historial} />
              </div>

              {enProceso && (
                <div className="tallerPedidoAcciones">
                  <small className="subtle">Etapa actual: {pedido.etapaTaller?.nombre || "—"}</small>
                  <label htmlFor={`fotos-${pedido.id}`}>Fotos de la etapa (opcional)</label>
                  <input
                    id={`fotos-${pedido.id}`}
                    key={`fotos-${pedido.id}-${files.length}`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => setPendiente(pedido.id, { files: Array.from(e.target.files || []) })}
                  />
                  {siguiente ? (
                    <button type="button" disabled={guardando === pedido.id} onClick={() => guardarEtapa(pedido, siguiente.id)}>
                      {guardando === pedido.id ? "Guardando..." : `Pasar a ${siguiente.nombre}`}
                    </button>
                  ) : (
                    <button type="button" onClick={() => marcarListo(pedido)}>Marcar listo para envio</button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
