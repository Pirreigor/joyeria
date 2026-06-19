import { useEffect, useMemo, useState } from "react";
import joyeritoImg from "../asset/joyerito-sin fondo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CART_KEY = "shop_cart";
const TOKEN_KEY = "shop_token";
const USER_KEY = "shop_user";
const PAGE_SIZE = 24;
const PLACEHOLDER = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80";

const initialAuthForm = { name: "", email: "", password: "" };

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [settings, setSettings] = useState({
    brandName: "Don Joyero",
    logoUrl: "",
    promoVideoUrl: "",
    promoVideoTitle: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [sortBy, setSortBy] = useState("recommended");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductVideo, setShowProductVideo] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [page, setPage] = useState(1);
  const [modalGalleryIndex, setModalGalleryIndex] = useState(0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ nombre: "", email: "", telefono: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    let mounted = true;

    async function loadStore() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse, slidesResponse, flyersResponse, settingsResponse] = await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/store/categories`),
          fetch(`${API_URL}/api/store/slides`),
          fetch(`${API_URL}/api/store/flyers`),
          fetch(`${API_URL}/api/store/settings`),
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok || !slidesResponse.ok || !flyersResponse.ok || !settingsResponse.ok) {
          throw new Error("No se pudo cargar la tienda.");
        }

        const [productsData, categoriesData, slidesData, flyersData, settingsData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          slidesResponse.json(),
          flyersResponse.json(),
          settingsResponse.json(),
        ]);

        if (mounted) {
          setProducts(productsData.products || []);
          setCategories(categoriesData.categories || []);
          setSlides(slidesData.slides || []);
          setFlyers(flyersData.flyers || []);
          setSettings(settingsData.settings || settings);
          setActiveSlide(0);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message || "Ocurrio un error inesperado.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStore();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  // Auto-abrir producto desde URL ?p=ID
  useEffect(() => {
    if (products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("p");
    if (pid) {
      const found = products.find((p) => String(p.id) === pid);
      if (found) {
        setSelectedProduct(found);
        setShowProductVideo(false);
      }
    }
  }, [products]);

  function openProduct(product) {
    setSelectedProduct(product);
    setShowProductVideo(false);
    setModalGalleryIndex(0);
    const url = new URL(window.location.href);
    url.searchParams.set("p", product.id);
    window.history.replaceState({}, "", url.toString());
  }

  function closeProduct() {
    setSelectedProduct(null);
    setShowProductVideo(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("p");
    window.history.replaceState({}, "", url.toString());
  }

  async function shareProduct(product, event) {
    event.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set("p", product.id);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira esta pieza de ${settings.brandName || "Don Joyero"}: ${product.name}`,
          url: shareUrl,
        });
      } catch {
        // cancelado por el usuario
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {
        // fallback: seleccionar texto
        window.prompt("Copia este enlace:", shareUrl);
      }
    }
  }

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;

    let list = products.filter((product) => {
      const categorySlug = slugify(product.category || "sin-categoria");
      const matchCategory = selectedCategory === "todas" || selectedCategory === categorySlug;
      const haystack = `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      const matchSearch = !normalized || haystack.includes(normalized);
      const matchRecommended = !recommendedOnly || Boolean(product.recommended);
      const matchMin = min === null || Number(product.price) >= min;
      const matchMax = max === null || Number(product.price) <= max;

      return matchCategory && matchSearch && matchRecommended && matchMin && matchMax;
    });

    if (sortBy === "price_asc") {
      list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_desc") {
      list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      list = [...list].sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)));
    }

    return list;
  }, [products, query, selectedCategory, recommendedOnly, priceMin, priceMax, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCategory, sortBy, recommendedOnly, priceMin, priceMax]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const menuTree = useMemo(
    () =>
      categories.map((category) => {
        const subcategories = products
          .filter((product) => slugify(product.category || "") === category.slug)
          .map((product) => product.name)
          .slice(0, 4);

        return {
          ...category,
          subcategories,
        };
      }),
    [categories, products]
  );

  const activeSubcategories = useMemo(() => {
    if (selectedCategory === "todas") {
      return [];
    }

    const found = menuTree.find((category) => category.slug === selectedCategory);
    return found?.subcategories || [];
  }, [menuTree, selectedCategory]);

  const selectedCategoryData = useMemo(() => {
    if (selectedCategory === "todas") {
      return null;
    }

    return categories.find((category) => category.slug === selectedCategory) || null;
  }, [categories, selectedCategory]);

  const categoryHighlights = useMemo(() => {
    if (!selectedCategoryData) {
      return [];
    }

    return products
      .filter((product) => slugify(product.category || "") === selectedCategoryData.slug)
      .slice(0, 4)
      .map((product) => product.name);
  }, [products, selectedCategoryData]);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const currentSlide = slides[activeSlide] || null;
  const inCategoryView = selectedCategory !== "todas";
  const isHomeView = selectedCategory === "todas";
  const embedPromoVideoUrl = useMemo(() => getEmbedVideoUrl(settings.promoVideoUrl), [settings.promoVideoUrl]);

  function openAuth(mode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthForm(initialAuthForm);
    setAuthOpen(true);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload = {
      email: authForm.email.trim(),
      password: authForm.password,
      ...(authMode === "register" ? { name: authForm.name.trim() } : {}),
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "No se pudo completar la autenticacion");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthOpen(false);
    } catch (requestError) {
      setAuthError(requestError.message || "No se pudo completar la autenticacion");
    } finally {
      setAuthLoading(false);
    }
  }

  function addToCart(product) {
    setCartItems((previous) => {
      const found = previous.find((item) => item.id === product.id);
      if (found) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, Math.max(product.stock, 1)) }
            : item
        );
      }

      return [
        ...previous,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: Number(product.stock || 0),
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  }

  function updateQuantity(productId, nextQuantity) {
    setCartItems((previous) => {
      const safeQuantity = Number(nextQuantity);
      if (safeQuantity <= 0) {
        return previous.filter((item) => item.id !== productId);
      }

      return previous.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(safeQuantity, Math.max(item.stock, 1)) } : item
      );
    });
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: checkoutForm.nombre.trim(),
          email: checkoutForm.email.trim(),
          telefono: checkoutForm.telefono.trim(),
          items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear el pedido");
      }

      const orderId = data.order?.id;
      const resumen = cartItems.map((item) => `${item.quantity}x ${item.name}`).join(", ");
      const mensaje = `Hola! Soy ${checkoutForm.nombre.trim()}. Acabo de realizar el pedido #${orderId} por $${cartTotal.toFixed(2)}. Detalle: ${resumen}. Mi telefono: ${checkoutForm.telefono.trim()}`;
      const whatsappUrl = `https://wa.me/51941445104?text=${encodeURIComponent(mensaje)}`;

      setCartItems([]);
      setCheckoutOpen(false);
      setCheckoutForm({ nombre: "", email: "", telefono: "" });
      setCartOpen(false);

      window.open(whatsappUrl, "_blank");
    } catch (requestError) {
      setCheckoutError(requestError.message || "Error al procesar el pedido");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="topHeader">
        <a href="#" className="brand" onClick={() => setSelectedCategory("todas") }>
          <div className="brandCenter">
            {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="logo" /> : <span className="logoFallback">DJ</span>}
            <span>{settings.brandName || "Don Joyero"}</span>
          </div>
        </a>

        <div className="headerActions">
          <div className="searchBox">
            <input
              type="text"
              placeholder="Buscar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {user ? (
            <button type="button" className="ghostBtn" onClick={logout}>
              {user.name ? `Salir (${user.name})` : "Cerrar sesion"}
            </button>
          ) : (
            <button type="button" className="ghostBtn" onClick={() => openAuth("login")}>
              Ingresar
            </button>
          )}

          <button
            type="button"
            className="cartBtn icon"
            onClick={() => setCartOpen((prev) => !prev)}
            aria-label={`Abrir carrito con ${cartCount} productos`}
            title="Abrir carrito"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.2 10.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7" />
              <circle cx="10" cy="19" r="1.4" />
              <circle cx="17" cy="19" r="1.4" />
            </svg>
            <span>{cartCount}</span>
          </button>
        </div>

        <nav className="categoryRibbon">
          <div className="categoryScroll">
            <button
              type="button"
              className={selectedCategory === "todas" ? "menuItem active" : "menuItem"}
              onClick={() => setSelectedCategory("todas")}
            >
              Inicio
            </button>

            {menuTree.map((category) => (
              <button
                type="button"
                key={category.id}
                className={selectedCategory === category.slug ? "menuItem active" : "menuItem"}
                onClick={() => {
                  setSelectedCategory(category.slug);
                  document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {activeSubcategories.length > 0 && (
            <div className="subcategoryRow">
              {activeSubcategories.map((sub) => (
                <span key={`sub-${sub}`}>{sub}</span>
              ))}
            </div>
          )}
        </nav>
      </header>

      {cartOpen && (
        <aside className="cartPanel">
          <div className="cartHead">
            <h3>Tu carrito</h3>
            <button type="button" className="ghostBtn" onClick={() => setCartOpen(false)}>
              Cerrar
            </button>
          </div>

          {cartItems.length === 0 ? (
            <p>Tu carrito esta vacio.</p>
          ) : (
            <div className="cartItems">
              {cartItems.map((item) => (
                <article className="cartItem" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>${item.price.toFixed(2)}</span>
                  <div className="qtyRow">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="cartTotal">Total: ${cartTotal.toFixed(2)}</p>

          {cartItems.length > 0 && !checkoutOpen && (
            <button type="button" className="ctaBtn checkoutBtn" onClick={() => { setCheckoutOpen(true); setCheckoutError(""); }}>
              Pagar pedido
            </button>
          )}

          {checkoutOpen && (
            <form className="checkoutForm" onSubmit={handleCheckout}>
              <h4>Datos para tu pedido</h4>

              <label htmlFor="checkout-nombre">Nombre completo</label>
              <input
                id="checkout-nombre"
                type="text"
                placeholder="Tu nombre"
                value={checkoutForm.nombre}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />

              <label htmlFor="checkout-email">Correo electronico</label>
              <input
                id="checkout-email"
                type="email"
                placeholder="tu@email.com"
                value={checkoutForm.email}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />

              <label htmlFor="checkout-telefono">Telefono / WhatsApp</label>
              <input
                id="checkout-telefono"
                type="tel"
                placeholder="+51 999 999 999"
                value={checkoutForm.telefono}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, telefono: e.target.value }))}
                required
              />

              {checkoutError && <p className="error">{checkoutError}</p>}

              <button type="submit" className="ctaBtn" disabled={checkoutLoading}>
                {checkoutLoading ? "Procesando..." : "Confirmar y enviar por WhatsApp"}
              </button>
              <button type="button" className="ghostBtn" onClick={() => setCheckoutOpen(false)}>
                Cancelar
              </button>
            </form>
          )}
        </aside>
      )}

      <section className={isHomeView ? "slider homeHero" : "slider"} aria-label="Promociones">
        {selectedCategoryData ? (
          <>
            <img
              src={selectedCategoryData.bannerImageUrl || currentSlide?.imageUrl}
              alt={selectedCategoryData.name}
            />
            <div className="overlay compact">
              <p className="eyebrow">Coleccion</p>
              <h1>{selectedCategoryData.name}</h1>
            </div>
          </>
        ) : currentSlide ? (
          <>
            <img src={currentSlide.imageUrl} alt={currentSlide.title} />
            <div className={isHomeView ? "overlay home" : "overlay"}>
              <p className="eyebrow">{settings.brandName || "Don Joyero"}</p>
              <h1>{isHomeView ? (currentSlide.title || "Coleccion principal") : currentSlide.title}</h1>
              <p>{currentSlide.subtitle || "Colecciones especiales para cada momento."}</p>
              <div className="heroCtas">
                {currentSlide.ctaUrl && (
                  <a href={currentSlide.ctaUrl} className="ctaBtn">
                    {currentSlide.ctaLabel || "Ver coleccion"}
                  </a>
                )}
                <button
                  type="button"
                  className="ghostBtn"
                  onClick={() => document.getElementById("contactanos")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Contactanos
                </button>
              </div>
            </div>
            {slides.length > 1 && (
              <div className="dots">
                {slides.map((slide, index) => (
                  <button
                    type="button"
                    key={slide.id}
                    className={index === activeSlide ? "dot active" : "dot"}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Ir al slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="overlay fallback">
            <h1>{settings.brandName || "Don Joyero"}</h1>
            <p>Configura los slides desde el panel admin.</p>
          </div>
        )}
      </section>

      {inCategoryView ? (
        <section className="categoryMeta">
          <p className="breadcrumb">INICIO / {selectedCategoryData?.name?.toUpperCase() || "CATEGORIA"}</p>
          <p className="categoryDescription">
            {selectedCategoryData?.description || "Descubre piezas destacadas de esta categoria."}
          </p>
          <p className="availability">Disponibles: {filteredProducts.length} productos</p>

          {categoryHighlights.length > 0 && (
            <div className="highlights">
              {categoryHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}

          <section className="filtersBar categoryOnly">
            <label>
              Orden
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="recommended">Recomendados</option>
                <option value="price_asc">Precio menor a mayor</option>
                <option value="price_desc">Precio mayor a menor</option>
              </select>
            </label>
            <label>
              Min $
              <input type="number" min="0" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} />
            </label>
            <label>
              Max $
              <input type="number" min="0" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} />
            </label>
            <label className="checkInline">
              <input
                type="checkbox"
                checked={recommendedOnly}
                onChange={(event) => setRecommendedOnly(event.target.checked)}
              />
              Solo recomendados
            </label>
          </section>
        </section>
      ) : (
        <section className="filtersBar">
          <p className="filterHint">Selecciona una categoria para usar filtros avanzados.</p>
        </section>
      )}

      <section className="catalogHeader" id="catalogo">
        <h2>Catalogo</h2>
        <span>{filteredProducts.length} productos</span>
      </section>

      {loading && <p className="status">Cargando catalogo...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="grid">
            {pagedProducts.map((product, index) => (
              <article className="card" key={product.id} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="cardImgWrap">
                  <img
                    className="cardImg"
                    src={product.imageUrl || PLACEHOLDER}
                    alt={product.name}
                    loading="lazy"
                  />
                  <div className="cardOverlay">
                    <button type="button" className="ctaBtn" onClick={() => openProduct(product)}>
                      Ver detalles
                    </button>
                    <button type="button" className="cardOverlayGhost" onClick={() => addToCart(product)}>
                      + Carrito
                    </button>
                  </div>
                  {product.recommended && <span className="badgeRec">Destacado</span>}
                  <button
                    type="button"
                    className="cardShareBtn"
                    aria-label="Compartir producto"
                    onClick={(e) => shareProduct(product, e)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                </div>
                <div className="cardBody">
                  <span className="pill">{product.category || "Joyeria"}</span>
                  <h3 className="cardName">{product.name}</h3>
                  <strong className="cardPrice">${Number(product.price).toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </section>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Paginas del catalogo">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => { setPage((p) => p - 1); document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); }}
                aria-label="Pagina anterior"
              >
                ‹
              </button>

              {buildPageNums(totalPages, page).map((item, i) =>
                item === "…" ? (
                  <span key={`ellipsis-${i}`} className="paginationEllipsis">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={item === page ? "active" : ""}
                    onClick={() => { setPage(item); document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); }}
                    aria-current={item === page ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => { setPage((p) => p + 1); document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); }}
                aria-label="Pagina siguiente"
              >
                ›
              </button>
            </nav>
          )}
        </>
      )}

      {flyers.length > 0 && (
        <section className="flyersSection" aria-label="Flyers promocionales">
          <div className="flyersRail">
            {flyers.map((flyer) => {
              const Wrapper = flyer.linkUrl ? "a" : "article";
              const wrapperProps = flyer.linkUrl
                ? { href: flyer.linkUrl, className: "flyerCard" }
                : { className: "flyerCard" };

              return (
                <Wrapper key={flyer.id} {...wrapperProps}>
                  <img src={flyer.imageUrl} alt={flyer.title} />
                  <div className="flyerOverlay">
                    <h3>{flyer.title}</h3>
                    {flyer.subtitle && <p>{flyer.subtitle}</p>}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </section>
      )}

      <section className="contactSection" id="contactanos">
        <div className="contactInfo">
          <p className="eyebrow dark">Don Joyero Boutique</p>
          <h2>Contactanos</h2>
          <p>
            Te ayudamos a elegir la pieza ideal para cada momento. Agenda atencion personalizada,
            cotizaciones especiales y recomendaciones para regalos.
          </p>
          <div className="contactList">
            <a href="tel:+593999999999">Telefono: +593 999 999 999</a>
            <a href="mailto:ventas@donjoyero.com">Email: ventas@donjoyero.com</a>
            <a href="https://wa.me/593999999999" target="_blank" rel="noreferrer">
              WhatsApp directo
            </a>
          </div>
        </div>

        <form className="contactForm" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="contact-name">Nombre</label>
          <input id="contact-name" type="text" placeholder="Tu nombre" />

          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" placeholder="tu@email.com" />

          <label htmlFor="contact-message">Mensaje</label>
          <textarea id="contact-message" rows={4} placeholder="Cuentalos que estas buscando" />

          <button type="submit" className="ctaBtn">Solicitar asesoria</button>
        </form>
      </section>

      {selectedProduct && (() => {
        const galleryImages = [selectedProduct.imageUrl, ...(selectedProduct.imagenes || [])].filter(Boolean);
        const currentImg = galleryImages[modalGalleryIndex] || galleryImages[0] || PLACEHOLDER;
        const hasDetails = selectedProduct.materiales || selectedProduct.dimensiones || selectedProduct.cuidados;
        const productVideoUrl = getEmbedVideoUrl(selectedProduct.videoUrl || "") || embedPromoVideoUrl;

        return (
          <div className="modalBackdrop" onClick={closeProduct}>
            <section className="productModal" onClick={(event) => event.stopPropagation()}>
              <div className="productHead">
                <h3>{selectedProduct.name}</h3>
                <div className="productHeadActions">
                  <button
                    type="button"
                    className="shareBtn"
                    aria-label="Compartir producto"
                    onClick={(e) => shareProduct(selectedProduct, e)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Compartir
                  </button>
                  <button type="button" className="ghostBtn" onClick={closeProduct}>
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="modalGallery">
                <div className="modalMedia">
                  <img className="productModalImage" src={currentImg} alt={selectedProduct.name} />

                  {productVideoUrl && !showProductVideo && (
                    <button type="button" className="modalPlayOverlay" onClick={() => setShowProductVideo(true)}>
                      <span className="playBadge" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="presentation">
                          <circle cx="12" cy="12" r="11" />
                          <polygon points="10,8.5 17,12 10,15.5" />
                        </svg>
                      </span>
                      <span>{selectedProduct.videoUrl ? "Ver video del producto" : (settings.promoVideoTitle || "Ver video promocional")}</span>
                    </button>
                  )}

                  {productVideoUrl && showProductVideo && (
                    <div className="modalVideoOverlay">
                      <iframe
                        src={appendAutoplay(productVideoUrl)}
                        title={selectedProduct.videoUrl ? "Video del producto" : (settings.promoVideoTitle || "Video promocional")}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="thumbStrip">
                    {galleryImages.map((img, i) => (
                      <button
                        key={img}
                        type="button"
                        className={`thumbBtn${i === modalGalleryIndex ? " active" : ""}`}
                        onClick={() => { setModalGalleryIndex(i); setShowProductVideo(false); }}
                        aria-label={`Imagen ${i + 1}`}
                      >
                        <img src={img} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="modalInfo">
                <div className="modalMeta">
                  <span className="pill">{selectedProduct.category || "Joyeria"}</span>
                  <strong className="modalPrice">${Number(selectedProduct.price).toFixed(2)}</strong>
                  {selectedProduct.grabado && (
                    <span className="grabadoBadge">
                      <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      Grabado disponible
                    </span>
                  )}
                </div>

                <p className="modalDescription">{selectedProduct.description || "Sin descripcion"}</p>

                {hasDetails && (
                  <dl className="productDetails">
                    {selectedProduct.materiales && (
                      <div className="detailRow">
                        <dt>Materiales</dt>
                        <dd>{selectedProduct.materiales}</dd>
                      </div>
                    )}
                    {selectedProduct.dimensiones && (
                      <div className="detailRow">
                        <dt>Dimensiones</dt>
                        <dd>{selectedProduct.dimensiones}</dd>
                      </div>
                    )}
                    {selectedProduct.cuidados && (
                      <div className="detailRow">
                        <dt>Cuidados</dt>
                        <dd>{selectedProduct.cuidados}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {(selectedProduct.videoUrl || settings.promoVideoUrl) && !productVideoUrl && (
                  <div className="videoMeta">
                    <strong>{selectedProduct.videoUrl ? "Video del producto" : (settings.promoVideoTitle || "Video promocional")}</strong>
                    <a className="ctaBtn" href={selectedProduct.videoUrl || settings.promoVideoUrl} target="_blank" rel="noreferrer">
                      Ver video
                    </a>
                  </div>
                )}

                <div className="modalActions">
                  <button type="button" className="ctaBtn" onClick={() => addToCart(selectedProduct)}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </section>
          </div>
        );
      })()}

      {shareToast && (
        <div className="shareToast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
          Enlace copiado al portapapeles
        </div>
      )}

      <a
        href="https://wa.me/51941445104"
        target="_blank"
        rel="noreferrer"
        className="whatsappFloat"
        aria-label="Contactar por WhatsApp"
      >
        <img src={joyeritoImg} alt="WhatsApp" />
      </a>

      {authOpen && (
        <div className="modalBackdrop" onClick={() => setAuthOpen(false)}>
          <section className="authModal" onClick={(event) => event.stopPropagation()}>
            <h3>{authMode === "login" ? "Ingresar" : "Crear cuenta"}</h3>

            <form onSubmit={handleAuthSubmit} className="authForm">
              {authMode === "register" && (
                <>
                  <label htmlFor="name">Nombre</label>
                  <input
                    id="name"
                    type="text"
                    value={authForm.name}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </>
              )}

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />

              <button type="submit" disabled={authLoading}>
                {authLoading ? "Enviando..." : authMode === "login" ? "Ingresar" : "Registrarme"}
              </button>
            </form>

            <button
              type="button"
              className="linkBtn"
              onClick={() => setAuthMode((prev) => (prev === "login" ? "register" : "login"))}
            >
              {authMode === "login" ? "No tienes cuenta? Registrate" : "Ya tienes cuenta? Ingresar"}
            </button>

            {authError && <p className="error">{authError}</p>}
          </section>
        </div>
      )}
    </div>
  );
}

function getEmbedVideoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (parsed.hostname.includes("tiktok.com")) {
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      return match?.[1] ? `https://www.tiktok.com/embed/v2/${match[1]}` : "";
    }

    return "";
  } catch {
    return "";
  }
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function appendAutoplay(url) {
  if (!url) {
    return "";
  }

  return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

function buildPageNums(total, current) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}
