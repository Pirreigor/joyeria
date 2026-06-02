import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    if (!token.trim()) {
      setError("Pega un token admin para consultar pedidos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar pedidos. Revisa el token.");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Error inesperado");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setOrders([]);
    setError("");
  }, [token]);

  return (
    <main className="page">
      <section className="panel">
        <h1>Joyeria Admin</h1>
        <p>Panel inicial para consultar pedidos del backend.</p>

        <label htmlFor="token">Token JWT de admin</label>
        <textarea
          id="token"
          rows={4}
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Pega aqui el token obtenido en /api/auth/login"
        />

        <button onClick={loadOrders} disabled={loading}>
          {loading ? "Cargando..." : "Cargar pedidos"}
        </button>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="results">
        <h2>Pedidos ({orders.length})</h2>
        {orders.length === 0 ? (
          <p>No hay pedidos para mostrar.</p>
        ) : (
          <div className="list">
            {orders.map((order) => (
              <article key={order.id} className="card">
                <strong>Pedido #{order.id}</strong>
                <span>Estado: {order.status}</span>
                <span>Total: ${Number(order.total).toFixed(2)}</span>
                <span>Cliente: {order.user?.email || "N/A"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
