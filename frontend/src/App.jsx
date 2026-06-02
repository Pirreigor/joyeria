import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el catalogo.");
        }

        const data = await response.json();
        if (mounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Ocurrio un error inesperado.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return products;
    }

    return products.filter((product) => {
      const haystack = `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [products, query]);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Coleccion 2026</p>
        <h1>Joyeria Aura</h1>
        <p className="subtitle">
          Piezas disenadas para momentos importantes. Explora el catalogo conectado en vivo al backend.
        </p>
      </header>

      <section className="toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, categoria o descripcion"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span>{filteredProducts.length} productos</span>
      </section>

      {loading && <p className="status">Cargando catalogo...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="grid">
          {filteredProducts.map((product, index) => (
            <article className="card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
              <div className="cardTop">
                <span className="chip">{product.category || "Joyeria"}</span>
                <strong>${product.price.toFixed(2)}</strong>
              </div>
              <h2>{product.name}</h2>
              <p>{product.description || "Sin descripcion"}</p>
              <div className="cardFooter">
                <span>Stock: {product.stock}</span>
                <small>/{product.slug}</small>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
