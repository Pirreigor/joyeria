import { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "https://donjoyero.com";
const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";
const LIST_PAGE_SIZE = 12;

const initialForm = {
  id: null,
  name: "",
  slug: "",
  description: "",
  bannerImageUrl: "",
  active: true,
  showInMenu: true,
  parentId: "",
};

const initialSlideForm = {
  id: null,
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  displayOrder: 1,
  active: true,
};

const initialFlyerForm = {
  id: null,
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  displayOrder: 1,
  active: true,
};

const initialSettingsForm = {
  brandName: "Don Joyero",
  logoUrl: "",
  promoVideoUrl: "",
  promoVideoTitle: "",
};

const initialProductForm = {
  id: null,
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  imagenesRaw: "",
  category: "",
  recommended: false,
  active: true,
  materiales: "",
  dimensiones: "",
  cuidados: "",
  grabado: false,
  videoUrl: "",
  tipoPiezaId: "",
  materialId: "",
  quilates: "",
  gemaId: "",
  origenGemaId: "",
  quilatajeGema: "",
  sku: "",
};

const initialUserForm = {
  id: null,
  name: "",
  email: "",
  password: "",
  rol: "CLIENTE",
  permisos: [],
};

const initialInviteForm = {
  name: "",
  email: "",
  rol: "CLIENTE",
  permisos: [],
};

const CATALOG_ENDPOINTS = {
  tipoPieza: { path: "tipos-pieza", label: "Tipo de pieza" },
  material: { path: "materiales", label: "Material" },
  gema: { path: "gemas", label: "Gema" },
  origenGema: { path: "origenes-gema", label: "Origen de gema" },
};

const initialCatalogForm = {
  type: "tipoPieza",
  id: null,
  name: "",
  code: "",
  requiereQuilate: true,
  active: true,
};

const ALL_PERMISSIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "Usuarios" },
  { key: "clientes", label: "Clientes" },
  { key: "categories", label: "Categorias" },
  { key: "products", label: "Productos" },
  { key: "atributos", label: "Atributos" },
  { key: "slides", label: "Slides" },
  { key: "flyers", label: "Flyers" },
  { key: "orders", label: "Pedidos" },
  { key: "despacho", label: "Despacho" },
  { key: "envios", label: "Envios" },
  { key: "settings", label: "Branding" },
];

const STAFF_MENU = [
  {
    key: "operaciones",
    label: "Operaciones",
    items: [
      { key: "dashboard", label: "Dashboard", short: "DB" },
      { key: "users", label: "Usuarios", short: "US" },
      { key: "clientes", label: "Clientes", short: "CL" },
    ],
  },
  {
    key: "catalogo",
    label: "Catalogo",
    items: [
      { key: "categories", label: "Categorias", short: "CA" },
      { key: "products", label: "Productos", short: "PR" },
      { key: "atributos", label: "Atributos", short: "AT" },
    ],
  },
  {
    key: "contenido",
    label: "Contenido",
    items: [
      { key: "slides", label: "Slider", short: "SL" },
      { key: "flyers", label: "Flyers", short: "FL" },
    ],
  },
  {
    key: "ventas",
    label: "Ventas",
    items: [
      { key: "orders", label: "Pedidos", short: "PE" },
      { key: "despacho", label: "Despacho", short: "DE" },
      { key: "envios", label: "Envios", short: "EN" },
    ],
  },
  {
    key: "sistema",
    label: "Sistema",
    items: [{ key: "settings", label: "Branding", short: "BR" }],
  },
];

const MENU_BY_ROLE = {
  ADMINISTRADOR: STAFF_MENU,
  VENDEDOR: STAFF_MENU,
};

const ORDER_LOCKED_STATES = ["PAGADO", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO", "CANCELADO"];

const TAB_LIST_TITLES = {
  dashboard: "Resumen general",
  users: "Listado usuarios",
  clientes: "Listado clientes",
  categories: "Listado categorias",
  products: "Listado productos",
  slides: "Listado slides",
  flyers: "Listado flyers",
  orders: "Listado pedidos",
  despacho: "Pedidos listos para despacho",
  envios: "Pedidos listos para envio",
  settings: "Preview branding",
  atributos: "Atributos del catalogo",
};

function MenuIcon({ tabKey }) {
  if (tabKey === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zM3 21h8v-6H3v6zm10-8h8V3h-8v10z" />
      </svg>
    );
  }

  if (tabKey === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 2c-3 0-6 1.5-6 3.5V21h12v-2.5c0-2-3-3.5-6-3.5zm-8 0c-2.5 0-5 1.1-5 2.7V21h5v-2.5a4.6 4.6 0 0 1 1.7-3.4A8.5 8.5 0 0 0 8 15z" />
      </svg>
    );
  }

  if (tabKey === "clientes") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.7 0 8 1.3 8 4v3H4v-3c0-2.7 5.3-4 8-4zm0-2a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
      </svg>
    );
  }

  if (tabKey === "categories") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5h18v4H3V5zm0 5h18v4H3v-4zm0 5h18v4H3v-4z" />
      </svg>
    );
  }

  if (tabKey === "products") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 7l6-3 6 3v10l-6 3-6-3V7zm6-1.2L8.2 7.7 12 9.6l3.8-1.9L12 5.8z" />
      </svg>
    );
  }

  if (tabKey === "slides") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 1.5 3.5 4.2 2.5-2.8 4 5.1H7V8.5z" />
      </svg>
    );
  }

  if (tabKey === "flyers") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 6h20v12H2V6zm2 2v8h16V8H4zm2 1h5v6H6V9zm6 0h6v2h-6V9zm0 3h6v2h-6v-2z" />
      </svg>
    );
  }

  if (tabKey === "orders") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z" />
      </svg>
    );
  }

  if (tabKey === "despacho" || tabKey === "envios") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm2.1-7.2-.9.9a3.1 3.1 0 0 0-1.2 2.3h-2a4.5 4.5 0 0 1 1.5-3.2l1.2-1.1a1.7 1.7 0 1 0-2.9-1.2H8.8a3.7 3.7 0 1 1 6.3 2.5z" />
    </svg>
  );
}

function DedicationQrLabel({ url, label }) {
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (!url || !qrCanvasRef.current) return;
    QRCode.toCanvas(qrCanvasRef.current, url, { width: 140, margin: 1 }).catch(() => {});
  }, [url]);

  function downloadCanvas() {
    if (!qrCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `dedicatoria-${label || "qr"}.png`;
    link.href = qrCanvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="barcodePreview">
      <canvas ref={qrCanvasRef} />
      <div className="barcodeActions">
        <button type="button" className="ghost" onClick={downloadCanvas}>Descargar QR</button>
        <button type="button" className="ghost" onClick={() => navigator.clipboard?.writeText(url)}>Copiar link</button>
      </div>
    </div>
  );
}

function ProductBarcodeLabel({ sku, name, price }) {
  const barcodeRef = useRef(null);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (!sku) return;

    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, sku, { format: "CODE128", width: 2, height: 50, displayValue: true, fontSize: 14 });
      } catch (error) {
        // sku con caracteres no soportados por Code128 (raro, ya que se genera con letras/numeros/guiones)
      }
    }

    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, sku, { width: 110, margin: 1 }).catch(() => {});
    }
  }, [sku]);

  function downloadCanvas(canvas, filename) {
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (!sku) return null;

  return (
    <div className="barcodeSection">
      <div className="barcodePreview printLabel">
        <p className="printLabelName">{name}</p>
        {price ? <p className="printLabelPrice">S/ {Number(price).toFixed(2)}</p> : null}
        <div className="barcodeCodes">
          <canvas ref={barcodeRef} />
          <canvas ref={qrCanvasRef} />
        </div>
        <p className="printLabelSku">{sku}</p>
      </div>
      <div className="barcodeActions">
        <button type="button" className="ghost" onClick={() => window.print()}>Imprimir etiqueta</button>
        <button type="button" className="ghost" onClick={() => downloadCanvas(barcodeRef.current, `${sku}-barras.png`)}>Descargar barras</button>
        <button type="button" className="ghost" onClick={() => downloadCanvas(qrCanvasRef.current, `${sku}-qr.png`)}>Descargar QR</button>
      </div>
    </div>
  );
}

function roleLabel(rol) {
  if (rol === "ADMINISTRADOR") return "Admin";
  if (rol === "VENDEDOR") return "Vendedor";
  return "Cliente";
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

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("admin@joyeria.local");
  const [password, setPassword] = useState("Admin12345");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [categories, setCategories] = useState([]);
  const [tiposPieza, setTiposPieza] = useState([]);
  const [materialesCatalogo, setMaterialesCatalogo] = useState([]);
  const [gemas, setGemas] = useState([]);
  const [origenesGema, setOrigenesGema] = useState([]);
  const [dashboard, setDashboard] = useState({
    stats: { users: 0, products: 0, categories: 0, orders: 0 },
    recentOrders: [],
    recentUsers: [],
  });
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState("todos");
  const [manualOrderOpen, setManualOrderOpen] = useState(false);
  const [manualOrderForm, setManualOrderForm] = useState({ nombre: "", email: "", telefono: "", items: [] });
  const [manualOrderSaving, setManualOrderSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSearchCat, setProductSearchCat] = useState("todas");
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ metodoPago: "", numeroComprobante: "", direccionEnvio: "", comprobante: null });
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [shippingModal, setShippingModal] = useState(null);
  const [shippingForm, setShippingForm] = useState({ courierEnvio: "", numeroGuia: "" });
  const [shippingSaving, setShippingSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState(initialSettingsForm);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries((MENU_BY_ROLE.ADMINISTRADOR || []).map((s) => [s.key, true]))
  );

  const [form, setForm] = useState(initialForm);
  const [slideForm, setSlideForm] = useState(initialSlideForm);
  const [flyerForm, setFlyerForm] = useState(initialFlyerForm);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [inviteForm, setInviteForm] = useState(initialInviteForm);
  const [inviting, setInviting] = useState(false);
  const [invitationActionId, setInvitationActionId] = useState(null);

  const [barcodeViewProduct, setBarcodeViewProduct] = useState(null);
  const [dedicationOrder, setDedicationOrder] = useState(null);
  const [dedicationList, setDedicationList] = useState([]);
  const [dedicationLoading, setDedicationLoading] = useState(false);

  const [catalogForm, setCatalogForm] = useState(initialCatalogForm);
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [catalogDeletingId, setCatalogDeletingId] = useState(null);

  const [inviteToken, setInviteToken] = useState(() => new URLSearchParams(window.location.search).get("invite"));
  const [inviteInfo, setInviteInfo] = useState(null);
  const [inviteInfoLoading, setInviteInfoLoading] = useState(Boolean(inviteToken));
  const [inviteInfoError, setInviteInfoError] = useState("");
  const [acceptPassword, setAcceptPassword] = useState("");
  const [acceptConfirm, setAcceptConfirm] = useState("");
  const [acceptSaving, setAcceptSaving] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importImages, setImportImages] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [formModal, setFormModal] = useState("");
  const [listSearch, setListSearch] = useState("");
  const [listSort, setListSort] = useState("newest");
  const [listPage, setListPage] = useState(1);

  const isEditing = useMemo(() => form.id !== null, [form.id]);
  const isEditingSlide = useMemo(() => slideForm.id !== null, [slideForm.id]);
  const isEditingFlyer = useMemo(() => flyerForm.id !== null, [flyerForm.id]);
  const isEditingProduct = useMemo(() => productForm.id !== null, [productForm.id]);
  const isEditingUser = useMemo(() => userForm.id !== null, [userForm.id]);
  const role = user?.rol || "ADMINISTRADOR";
  const roleMenuSections = useMemo(() => {
    const sections = MENU_BY_ROLE[role] || [];
    const perms = user?.permisos || [];
    if (role === "ADMINISTRADOR" && !perms.length) return sections;
    return sections
      .map((s) => ({ ...s, items: s.items.filter((i) => perms.includes(i.key)) }))
      .filter((s) => s.items.length > 0);
  }, [role, user]);
  const roleMenu = useMemo(
    () => roleMenuSections.flatMap((section) => section.items || []),
    [roleMenuSections]
  );

  const filteredList = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    let items = [];

    if (activeTab === "users") {
      items = users.filter((u) => !q || `${u.name} ${u.email} ${u.rol}`.toLowerCase().includes(q));
      if (listSort === "newest") items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else if (listSort === "oldest") items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else if (listSort === "name_asc") items.sort((a, b) => a.name.localeCompare(b.name));
      else if (listSort === "name_desc") items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (activeTab === "categories") {
      let flat = categories.filter((c) => !c.parentId).flatMap((c) => [c, ...(c.children || []).map((s) => ({ ...s, _parent: c.name }))]);
      items = flat.filter((c) => !q || `${c.name} ${c.slug} ${c.description || ""}`.toLowerCase().includes(q));
      if (listSort === "name_asc") items.sort((a, b) => a.name.localeCompare(b.name));
      else if (listSort === "name_desc") items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (activeTab === "products") {
      items = products.filter((p) => !q || `${p.name} ${p.category || ""} ${p.slug} ${p.sku || ""}`.toLowerCase().includes(q));
      if (listSort === "newest") items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else if (listSort === "oldest") items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else if (listSort === "name_asc") items.sort((a, b) => a.name.localeCompare(b.name));
      else if (listSort === "name_desc") items.sort((a, b) => b.name.localeCompare(a.name));
      else if (listSort === "price_asc") items.sort((a, b) => a.price - b.price);
      else if (listSort === "price_desc") items.sort((a, b) => b.price - a.price);
      else if (listSort === "stock_asc") items.sort((a, b) => a.stock - b.stock);
    } else if (activeTab === "slides") {
      items = slides.filter((s) => !q || `${s.title} ${s.subtitle || ""}`.toLowerCase().includes(q));
      if (listSort === "order") items.sort((a, b) => a.displayOrder - b.displayOrder);
      else if (listSort === "name_asc") items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeTab === "flyers") {
      items = flyers.filter((f) => !q || `${f.title} ${f.subtitle || ""}`.toLowerCase().includes(q));
      if (listSort === "order") items.sort((a, b) => a.displayOrder - b.displayOrder);
      else if (listSort === "name_asc") items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeTab === "orders" || activeTab === "despacho" || activeTab === "envios") {
      let base = activeTab === "despacho" ? orders.filter((o) => o.estado === "PAGADO")
        : activeTab === "envios" ? orders.filter((o) => o.estado === "LISTO_PARA_ENVIO")
        : orders.filter((o) => ordersFilter === "todos" ? true : ordersFilter === "preparar" ? o.estado === "PREPARAR" : o.estado === "PAGADO");
      items = base.filter((o) => !q || `${o.id} ${o.clienteNombre || ""} ${o.clienteEmail || ""} ${o.usuario?.name || ""} ${o.usuario?.email || ""}`.toLowerCase().includes(q));
      if (listSort === "newest") items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else if (listSort === "oldest") items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else if (listSort === "total_desc") items.sort((a, b) => b.total - a.total);
      else if (listSort === "total_asc") items.sort((a, b) => a.total - b.total);
    } else if (activeTab === "clientes") {
      const map = new Map();
      for (const o of orders) {
        const key = o.usuarioId ? `u-${o.usuarioId}` : `c-${(o.clienteEmail || o.clienteTelefono || o.clienteNombre || "?").toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, {
            key,
            nombre: o.clienteNombre || o.usuario?.name || "Cliente",
            email: o.clienteEmail || o.usuario?.email || "",
            telefono: o.clienteTelefono || "",
            pedidos: [],
          });
        }
        map.get(key).pedidos.push(o);
      }
      for (const cliente of map.values()) {
        cliente.pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        cliente.ultimoPedido = cliente.pedidos[0]?.createdAt;
      }
      items = Array.from(map.values()).filter((c) => !q || `${c.nombre} ${c.email} ${c.telefono}`.toLowerCase().includes(q));
      if (listSort === "newest") items.sort((a, b) => new Date(b.ultimoPedido) - new Date(a.ultimoPedido));
      else if (listSort === "oldest") items.sort((a, b) => new Date(a.ultimoPedido) - new Date(b.ultimoPedido));
      else if (listSort === "name_desc") items.sort((a, b) => b.nombre.localeCompare(a.nombre));
      else items.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return items;
  }, [activeTab, users, categories, products, slides, flyers, orders, ordersFilter, listSearch, listSort]);

  const listTotalPages = Math.ceil(filteredList.length / LIST_PAGE_SIZE);
  const pagedList = filteredList.slice((listPage - 1) * LIST_PAGE_SIZE, listPage * LIST_PAGE_SIZE);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setDashboard({
        stats: { users: 0, products: 0, categories: 0, orders: 0 },
        recentOrders: [],
        recentUsers: [],
      });
      setUsers([]);
      setCategories([]);
      setProducts([]);
      setSlides([]);
      setFlyers([]);
      return;
    }

    loadData();
  }, [token]);

  useEffect(() => {
    if (!roleMenu.length) {
      return;
    }

    const hasAccess = roleMenu.some((item) => item.key === activeTab);
    if (!hasAccess) {
      setActiveTab(roleMenu[0].key);
    }
  }, [roleMenu, activeTab]);

  useEffect(() => {
    setListSearch("");
    setListSort("newest");
    setListPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (!inviteToken) return;

    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/invitations/${inviteToken}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "No se pudo validar la invitacion");
        }
        setInviteInfo(data.invitation);
      } catch (error) {
        setInviteInfoError(error.message || "No se pudo validar la invitacion");
      } finally {
        setInviteInfoLoading(false);
      }
    })();
  }, [inviteToken]);

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Ocurrio un error inesperado");
    }

    return data;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!["ADMINISTRADOR", "VENDEDOR"].includes(data.user?.rol)) {
        throw new Error("Tu usuario no tiene permisos para acceder al panel");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setPassword("");
    } catch (error) {
      setAuthError(error.message || "No se pudo iniciar sesion");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleAcceptInvitation(event) {
    event.preventDefault();
    setAcceptError("");

    if (!acceptPassword || acceptPassword !== acceptConfirm) {
      setAcceptError("Las contrasenas no coinciden");
      return;
    }

    setAcceptSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/accept-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken, password: acceptPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "No se pudo completar el registro");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      window.history.replaceState({}, "", window.location.pathname);
      setInviteToken(null);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      setAcceptError(error.message || "No se pudo completar el registro");
    } finally {
      setAcceptSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
    setDashboard({
      stats: { users: 0, products: 0, categories: 0, orders: 0 },
      recentOrders: [],
      recentUsers: [],
    });
    setUsers([]);
    setInvitations([]);
    setCategories([]);
    setProducts([]);
    setFlyers([]);
    setOrders([]);
    setForm(initialForm);
    setSlideForm(initialSlideForm);
    setFlyerForm(initialFlyerForm);
    setProductForm(initialProductForm);
    setUserForm(initialUserForm);
    setInviteForm(initialInviteForm);
    setAuthError("");
    setListError("");
  }

  async function loadData() {
    setListLoading(true);
    setListError("");

    const perms = user?.permisos || [];
    const can = (key) => (user?.rol === "ADMINISTRADOR" && perms.length === 0) || perms.includes(key);

    const dashboardFallback = { stats: { users: 0, products: 0, categories: 0, orders: 0 }, recentOrders: [], recentUsers: [] };
    const fetchOrFallback = (allowed, path, fallback) =>
      allowed ? request(path).catch(() => fallback) : Promise.resolve(fallback);

    try {
      const needsAttrCatalogs = can("atributos");
      const [dashboardData, usersData, invitationsData, categoriesData, productsData, slidesData, flyersData, ordersData, settingsData, tiposPiezaData, materialesData, gemasData, origenesGemaData] = await Promise.all([
        fetchOrFallback(can("dashboard"), "/api/admin/dashboard", dashboardFallback),
        fetchOrFallback(can("users"), "/api/admin/users", { users: [] }),
        fetchOrFallback(can("users"), "/api/admin/invitations", { invitations: [] }),
        fetchOrFallback(can("categories"), "/api/admin/categories", { categories: [] }),
        fetchOrFallback(can("products"), "/api/admin/products", { products: [] }),
        fetchOrFallback(can("slides"), "/api/admin/slides", { slides: [] }),
        fetchOrFallback(can("flyers"), "/api/admin/flyers", { flyers: [] }),
        fetchOrFallback(can("orders") || can("despacho") || can("clientes") || can("envios"), "/api/admin/orders", { orders: [] }),
        fetchOrFallback(can("settings"), "/api/admin/settings", null),
        fetchOrFallback(needsAttrCatalogs, "/api/admin/tipos-pieza", { items: [] }),
        fetchOrFallback(needsAttrCatalogs, "/api/admin/materiales", { items: [] }),
        fetchOrFallback(needsAttrCatalogs, "/api/admin/gemas", { items: [] }),
        fetchOrFallback(needsAttrCatalogs, "/api/admin/origenes-gema", { items: [] }),
      ]);
      setDashboard({
        stats: dashboardData?.stats || { users: 0, products: 0, categories: 0, orders: 0 },
        recentOrders: dashboardData?.recentOrders || [],
        recentUsers: dashboardData?.recentUsers || [],
      });
      setUsers(usersData.users || []);
      setInvitations(invitationsData.invitations || []);
      setCategories(categoriesData.categories || []);
      setProducts(productsData.products || []);
      setSlides(slidesData.slides || []);
      setFlyers(flyersData.flyers || []);
      setOrders(ordersData.orders || []);
      setSettingsForm({
        brandName: settingsData?.settings?.brandName || "Don Joyero",
        logoUrl: settingsData?.settings?.logoUrl || "",
        promoVideoUrl: settingsData?.settings?.promoVideoUrl || "",
        promoVideoTitle: settingsData?.settings?.promoVideoTitle || "",
      });
      setTiposPieza(tiposPiezaData.items || []);
      setMaterialesCatalogo(materialesData.items || []);
      setGemas(gemasData.items || []);
      setOrigenesGema(origenesGemaData.items || []);
    } catch (error) {
      setListError(error.message || "No se pudieron cargar datos del panel");
    } finally {
      setListLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setFormModal("");
  }

  function resetSlideForm() {
    setSlideForm(initialSlideForm);
    setFormModal("");
  }

  function resetFlyerForm() {
    setFlyerForm(initialFlyerForm);
    setFormModal("");
  }

  function resetProductForm() {
    setProductForm(initialProductForm);
    setFormModal("");
  }

  function resetUserForm() {
    setUserForm(initialUserForm);
    setFormModal("");
  }

  function resetInviteForm() {
    setInviteForm(initialInviteForm);
    setFormModal("");
  }

  function startEdit(category) {
    setForm({
      id: category.id,
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      bannerImageUrl: category.bannerImageUrl || "",
      active: Boolean(category.active),
      showInMenu: category.showInMenu === undefined ? true : Boolean(category.showInMenu),
      parentId: category.parentId ? String(category.parentId) : "",
    });
    setFormModal("category");
  }

  function startEditSlide(slide) {
    setSlideForm({
      id: slide.id,
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl || "",
      ctaLabel: slide.ctaLabel || "",
      ctaUrl: slide.ctaUrl || "",
      displayOrder: Number(slide.displayOrder || 1),
      active: Boolean(slide.active),
    });
    setFormModal("slide");
  }

  function startEditFlyer(flyer) {
    setFlyerForm({
      id: flyer.id,
      title: flyer.title || "",
      subtitle: flyer.subtitle || "",
      imageUrl: flyer.imageUrl || "",
      linkUrl: flyer.linkUrl || "",
      displayOrder: Number(flyer.displayOrder || 1),
      active: Boolean(flyer.active),
    });
    setFormModal("flyer");
  }

  function startEditProduct(product) {
    setProductForm({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      imageUrl: product.imageUrl || "",
      imagenesRaw: (product.imagenes || []).join(", "),
      category: product.category || "",
      recommended: Boolean(product.recommended),
      active: Boolean(product.active),
      materiales: product.materiales || "",
      dimensiones: product.dimensiones || "",
      cuidados: product.cuidados || "",
      grabado: Boolean(product.grabado),
      videoUrl: product.videoUrl || "",
      tipoPiezaId: product.tipoPiezaId ? String(product.tipoPiezaId) : "",
      materialId: product.materialId ? String(product.materialId) : "",
      quilates: product.quilates ? String(product.quilates) : "",
      gemaId: product.gemaId ? String(product.gemaId) : "",
      origenGemaId: product.origenGemaId ? String(product.origenGemaId) : "",
      quilatajeGema: product.quilatajeGema != null ? String(product.quilatajeGema) : "",
      sku: product.sku || "",
    });
    setFormModal("product");
  }

  function startEditUser(nextUser) {
    setUserForm({
      id: nextUser.id,
      name: nextUser.name || "",
      email: nextUser.email || "",
      password: "",
      rol: nextUser.rol || "CLIENTE",
      permisos: nextUser.permisos || [],
    });
    setFormModal("user");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setListError("");

    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      description: form.description.trim() || null,
      bannerImageUrl: form.bannerImageUrl.trim() || null,
      active: Boolean(form.active),
      showInMenu: Boolean(form.showInMenu),
      parentId: form.parentId ? Number(form.parentId) : null,
    };

    try {
      if (!payload.name) {
        throw new Error("El nombre es obligatorio");
      }

      if (!payload.slug) {
        throw new Error("El slug es obligatorio");
      }

      if (isEditing) {
        await request(`/api/admin/categories/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await request("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar la categoria");
    } finally {
      setSaving(false);
    }
  }

  async function handleSlideSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setListError("");

    const payload = {
      title: slideForm.title.trim(),
      subtitle: slideForm.subtitle.trim() || null,
      imageUrl: slideForm.imageUrl.trim(),
      ctaLabel: slideForm.ctaLabel.trim() || null,
      ctaUrl: slideForm.ctaUrl.trim() || null,
      displayOrder: Number(slideForm.displayOrder),
      active: Boolean(slideForm.active),
    };

    try {
      if (!payload.title || !payload.imageUrl || Number.isNaN(payload.displayOrder)) {
        throw new Error("title, imageUrl y displayOrder son obligatorios");
      }

      if (isEditingSlide) {
        await request(`/api/admin/slides/${slideForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await request("/api/admin/slides", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetSlideForm();
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar el slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setListError("");

    const payload = {
      brandName: settingsForm.brandName.trim(),
      logoUrl: settingsForm.logoUrl.trim() || null,
      promoVideoUrl: settingsForm.promoVideoUrl.trim() || null,
      promoVideoTitle: settingsForm.promoVideoTitle.trim() || null,
    };

    try {
      if (!payload.brandName) {
        throw new Error("El nombre de marca es obligatorio");
      }

      await request("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar configuracion");
    } finally {
      setSaving(false);
    }
  }

  async function handleFlyerSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setListError("");

    const payload = {
      title: flyerForm.title.trim(),
      subtitle: flyerForm.subtitle.trim() || null,
      imageUrl: flyerForm.imageUrl.trim(),
      linkUrl: flyerForm.linkUrl.trim() || null,
      displayOrder: Number(flyerForm.displayOrder),
      active: Boolean(flyerForm.active),
    };

    try {
      if (!payload.title || !payload.imageUrl || Number.isNaN(payload.displayOrder)) {
        throw new Error("title, imageUrl y displayOrder son obligatorios");
      }

      if (isEditingFlyer) {
        await request(`/api/admin/flyers/${flyerForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await request("/api/admin/flyers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetFlyerForm();
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar el flyer");
    } finally {
      setSaving(false);
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setListError("");

    const imagenes = productForm.imagenesRaw
      ? productForm.imagenesRaw.split(",").map((u) => u.trim()).filter(Boolean)
      : [];

    const payload = {
      name: productForm.name.trim(),
      slug: (productForm.slug || slugify(productForm.name)).trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock || 0),
      imageUrl: productForm.imageUrl.trim(),
      imagenes,
      category: productForm.category || null,
      recommended: Boolean(productForm.recommended),
      active: Boolean(productForm.active),
      materiales: productForm.materiales.trim() || null,
      dimensiones: productForm.dimensiones.trim() || null,
      cuidados: productForm.cuidados.trim() || null,
      grabado: Boolean(productForm.grabado),
      videoUrl: productForm.videoUrl.trim() || null,
      tipoPiezaId: productForm.tipoPiezaId || null,
      materialId: productForm.materialId || null,
      quilates: productForm.quilates ? Number(productForm.quilates) : null,
      gemaId: productForm.gemaId || null,
      origenGemaId: productForm.origenGemaId || null,
      quilatajeGema: productForm.quilatajeGema ? Number(productForm.quilatajeGema) : null,
      sku: productForm.sku.trim() || undefined,
    };

    try {
      if (!payload.name || !payload.slug || Number.isNaN(payload.price) || !payload.imageUrl) {
        throw new Error("name, slug, price e imageUrl son obligatorios");
      }

      let data;
      if (isEditingProduct) {
        data = await request(`/api/admin/products/${productForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        data = await request("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setProductForm((p) => ({ ...p, id: data.product.id, sku: data.product.sku || "" }));
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerateSku() {
    const confirmed = window.confirm("Esto va a reemplazar el codigo actual por uno nuevo. Si ya imprimiste una etiqueta con el codigo viejo, dejara de coincidir. Continuar?");
    if (!confirmed) return;

    setSaving(true);
    setListError("");

    try {
      const data = await request(`/api/admin/products/${productForm.id}`, {
        method: "PATCH",
        body: JSON.stringify({ regenerateSku: true }),
      });
      setProductForm((p) => ({ ...p, sku: data.product.sku || "" }));
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo regenerar el codigo");
    } finally {
      setSaving(false);
    }
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setListError("");

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      role: userForm.rol,
      permissions: ["ADMINISTRADOR", "VENDEDOR"].includes(userForm.rol) ? userForm.permisos : [],
    };

    try {
      if (!payload.name || !payload.email) {
        throw new Error("name y email son obligatorios");
      }

      if (!isEditingUser && !payload.password) {
        throw new Error("password es obligatorio para crear usuario");
      }

      if (isEditingUser) {
        await request(`/api/admin/users/${userForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await request("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetUserForm();
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar el usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleInviteSubmit(event) {
    event.preventDefault();
    setInviting(true);
    setListError("");

    try {
      if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
        throw new Error("name y email son obligatorios");
      }

      await request("/api/admin/invitations", {
        method: "POST",
        body: JSON.stringify({
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          role: inviteForm.rol,
          permissions: ["ADMINISTRADOR", "VENDEDOR"].includes(inviteForm.rol) ? inviteForm.permisos : [],
        }),
      });

      resetInviteForm();
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo enviar la invitacion");
    } finally {
      setInviting(false);
    }
  }

  async function handleRevokeInvitation(invitation) {
    const confirmed = window.confirm(`Revocar la invitacion a "${invitation.email}"?`);
    if (!confirmed) return;

    setInvitationActionId(invitation.id);
    setListError("");

    try {
      await request(`/api/admin/invitations/${invitation.id}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo revocar la invitacion");
    } finally {
      setInvitationActionId(null);
    }
  }

  async function handleResendInvitation(invitation) {
    setInvitationActionId(invitation.id);
    setListError("");

    try {
      await request(`/api/admin/invitations/${invitation.id}/resend`, { method: "POST" });
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo reenviar la invitacion");
    } finally {
      setInvitationActionId(null);
    }
  }

  function resetCatalogForm() {
    setCatalogForm(initialCatalogForm);
    setFormModal("");
  }

  function startEditCatalog(type, item) {
    setCatalogForm({
      type,
      id: item.id,
      name: item.name,
      code: item.code,
      requiereQuilate: item.requiereQuilate === undefined ? true : Boolean(item.requiereQuilate),
      active: Boolean(item.active),
    });
  }

  async function handleCatalogSubmit(event) {
    event.preventDefault();
    setCatalogSaving(true);
    setListError("");

    const { path } = CATALOG_ENDPOINTS[catalogForm.type];
    const payload = {
      name: catalogForm.name.trim(),
      code: catalogForm.code.trim(),
      active: catalogForm.active,
      ...(catalogForm.type === "material" ? { requiereQuilate: catalogForm.requiereQuilate } : {}),
    };

    try {
      if (!payload.name || !payload.code) {
        throw new Error("name y code son obligatorios");
      }

      if (catalogForm.id) {
        await request(`/api/admin/${path}/${catalogForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await request(`/api/admin/${path}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetCatalogForm();
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo guardar el atributo");
    } finally {
      setCatalogSaving(false);
    }
  }

  async function handleCatalogDelete(type, item) {
    const confirmed = window.confirm(`Eliminar "${item.name}"?`);
    if (!confirmed) return;

    setCatalogDeletingId(item.id);
    setListError("");

    try {
      await request(`/api/admin/${CATALOG_ENDPOINTS[type].path}/${item.id}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo eliminar el atributo");
    } finally {
      setCatalogDeletingId(null);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Eliminar categoria "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setListError("");

    try {
      await request(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (form.id === category.id) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo eliminar la categoria");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteSlide(slide) {
    const confirmed = window.confirm(`Eliminar slide "${slide.title}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(slide.id);
    setListError("");

    try {
      await request(`/api/admin/slides/${slide.id}`, {
        method: "DELETE",
      });

      if (slideForm.id === slide.id) {
        resetSlideForm();
      }

      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo eliminar el slide");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteFlyer(flyer) {
    const confirmed = window.confirm(`Eliminar flyer "${flyer.title}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(flyer.id);
    setListError("");

    try {
      await request(`/api/admin/flyers/${flyer.id}`, {
        method: "DELETE",
      });

      if (flyerForm.id === flyer.id) {
        resetFlyerForm();
      }

      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo eliminar el flyer");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(`Desactivar producto "${product.name}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setListError("");

    try {
      await request(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (productForm.id === product.id) {
        resetProductForm();
      }

      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo desactivar el producto");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleImageUpload(event, target = "imageUrl") {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (productForm.category) formData.append("category", productForm.category);
      const response = await fetch(`${API_URL}/api/admin/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al subir imagen");
      if (target === "imageUrl") {
        setProductForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else if (target === "gallery") {
        setProductForm((prev) => ({
          ...prev,
          imagenesRaw: prev.imagenesRaw ? prev.imagenesRaw + ", " + data.url : data.url,
        }));
      }
    } catch (error) {
      setListError(error.message || "Error al subir imagen");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      const response = await fetch(`${API_URL}/api/admin/products/export-template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Error al descargar plantilla");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla_productos.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setListError(error.message);
    }
  }

  async function handleImportProducts() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    setListError("");
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      for (const img of importImages) {
        formData.append("images", img);
      }
      const response = await fetch(`${API_URL}/api/admin/products/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al importar");
      setImportResult(data);
      setImportFile(null);
      setImportImages([]);
      await loadData();
    } catch (error) {
      setListError(error.message || "Error al importar productos");
    } finally {
      setImporting(false);
    }
  }

  function openPaymentModal(orderId) {
    setPaymentModal(orderId);
    setPaymentForm({ metodoPago: "", numeroComprobante: "", direccionEnvio: "", comprobante: null });
  }

  function openShippingModal(orderId) {
    setShippingModal(orderId);
    setShippingForm({ courierEnvio: "", numeroGuia: "" });
  }

  async function handleShippingSubmit(event) {
    event.preventDefault();
    setShippingSaving(true);
    setListError("");

    try {
      await request(`/api/admin/orders/${shippingModal}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ENVIADO", ...shippingForm }),
      });
      setShippingModal(null);
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo marcar el pedido como enviado");
    } finally {
      setShippingSaving(false);
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    setListError("");
    try {
      await request(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo actualizar el estado del pedido");
    }
  }

  async function openDedicationView(order) {
    setDedicationOrder(order);
    setDedicationLoading(true);
    setDedicationList([]);

    try {
      const data = await request(`/api/admin/orders/${order.id}/dedicatorias`);
      setDedicationList(data.dedicatorias || []);
    } catch (error) {
      setListError(error.message || "No se pudieron cargar las dedicatorias");
    } finally {
      setDedicationLoading(false);
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();
    setPaymentSaving(true);
    setListError("");

    try {
      const fd = new FormData();
      fd.append("metodoPago", paymentForm.metodoPago);
      fd.append("numeroComprobante", paymentForm.numeroComprobante);
      fd.append("direccionEnvio", paymentForm.direccionEnvio);
      fd.append("comprobante", paymentForm.comprobante);

      const response = await fetch(`${API_URL}/api/admin/orders/${paymentModal}/confirm-payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "No se pudo confirmar el pago");
      }

      setPaymentModal(null);
      await loadData();
    } catch (error) {
      setListError(error.message || "Error al confirmar pago");
    } finally {
      setPaymentSaving(false);
    }
  }

  function addManualOrderItem(productId) {
    const product = products.find((p) => p.id === Number(productId));
    if (!product) return;
    setManualOrderForm((prev) => {
      const existing = prev.items.find((i) => i.productId === product.id);
      if (existing) {
        return { ...prev, items: prev.items.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { ...prev, items: [...prev.items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }] };
    });
  }

  function removeManualOrderItem(productId) {
    setManualOrderForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }));
  }

  async function handleManualOrderSubmit(event) {
    event.preventDefault();
    setManualOrderSaving(true);
    setListError("");

    try {
      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: manualOrderForm.nombre.trim(),
          email: manualOrderForm.email.trim(),
          telefono: manualOrderForm.telefono.trim(),
          items: manualOrderForm.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear el pedido");
      }

      setFormModal("");
      setManualOrderForm({ nombre: "", email: "", telefono: "", items: [] });
      await loadData();
    } catch (error) {
      setListError(error.message || "Error al crear pedido manual");
    } finally {
      setManualOrderSaving(false);
    }
  }

  async function handleDeleteUser(nextUser) {
    const confirmed = window.confirm(`Eliminar usuario "${nextUser.email}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(nextUser.id);
    setListError("");

    try {
      await request(`/api/admin/users/${nextUser.id}`, {
        method: "DELETE",
      });

      if (userForm.id === nextUser.id) {
        resetUserForm();
      }

      await loadData();
    } catch (error) {
      setListError(error.message || "No se pudo eliminar el usuario");
    } finally {
      setDeletingId(null);
    }
  }

  if (inviteToken) {
    return (
      <main className="authPage">
        <section className="authCard">
          <p className="eyebrow">Don Joyero</p>
          <h1>Completa tu registro</h1>

          {inviteInfoLoading && <p>Validando invitacion...</p>}

          {!inviteInfoLoading && inviteInfoError && (
            <p className="error">{inviteInfoError}</p>
          )}

          {!inviteInfoLoading && !inviteInfoError && inviteInfo && (
            <>
              <p>Fuiste invitado como <strong>{inviteInfo.name}</strong> ({roleLabel(inviteInfo.rol)}) con el email {inviteInfo.email}.</p>

              <form onSubmit={handleAcceptInvitation} className="authForm">
                {acceptError && <p className="error">{acceptError}</p>}

                <label htmlFor="accept-password">Elegi tu contrasena</label>
                <input
                  id="accept-password"
                  type="password"
                  value={acceptPassword}
                  onChange={(event) => setAcceptPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <label htmlFor="accept-confirm">Confirma tu contrasena</label>
                <input
                  id="accept-confirm"
                  type="password"
                  value={acceptConfirm}
                  onChange={(event) => setAcceptConfirm(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button type="submit" disabled={acceptSaving}>
                  {acceptSaving ? "Guardando..." : "Crear mi cuenta"}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="authPage">
        <section className="authCard">
          <p className="eyebrow">Don Joyero</p>
          <h1>Admin</h1>
          <p>Inicia sesion para gestionar categorias del catalogo.</p>

          <form onSubmit={handleLogin} className="authForm">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {authError && <p className="error">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topBar panel">
        <div className="topBarLeft">
          <button
            type="button"
            className="ghost menuToggle"
            onClick={() => setMenuCollapsed((prev) => !prev)}
            aria-label={menuCollapsed ? "Expandir menu" : "Contraer menu"}
            title={menuCollapsed ? "Expandir menu" : "Contraer menu"}
          >
            {menuCollapsed ? "☰" : "✕"}
          </button>
          <div>
            <p className="eyebrow">Panel administrativo</p>
            <h1>Ecommerce Admin</h1>
          </div>
        </div>

        <div className="topBarRight">
          <div className="statusBadge" aria-label="Estado conectado">
            <span className="statusDot" />
            Conectado
          </div>
          <div className="userMeta">
            <strong>{user?.name || "Admin"}</strong>
            <small>{user?.email || "admin"}</small>
          </div>
          <button className="ghost" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className={menuCollapsed ? "workspace menuCollapsed" : "workspace"}>
        <aside className="panel sidebarPanel">
          <p className="eyebrow">Menu</p>
          <nav className="maintMenu" aria-label="Menu de mantenimiento">
            {roleMenuSections.map((section) => {
              const isOpen = openSections[section.key] ?? true;
              return (
                <section key={section.key} className="menuGroup">
                  {!menuCollapsed && (
                    <button
                      type="button"
                      className="menuGroupHeader"
                      onClick={() => setOpenSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                      aria-expanded={isOpen}
                    >
                      <span className="menuGroupTitle">{section.label}</span>
                      <span className={`sectionChevron ${isOpen ? "open" : ""}`} aria-hidden="true">›</span>
                    </button>
                  )}
                  {(menuCollapsed || isOpen) && (
                    <div className="submenuList">
                      {section.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className={activeTab === item.key ? "menuEntry active" : "menuEntry"}
                          onClick={() => setActiveTab(item.key)}
                          title={item.label}
                        >
                          <span className="menuEntryContent">
                            <span className="menuIcon" aria-hidden="true">
                              <MenuIcon tabKey={item.key} />
                            </span>
                            <span className="menuEntryLabel">
                              {menuCollapsed ? item.short || item.label.slice(0, 2).toUpperCase() : item.label}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </nav>
        </aside>

        <section className="contentArea">
        {activeTab === "dashboard" && (
          <article className="panel">
            <h2>Dashboard</h2>
            <div className="statsGrid">
              <article className="statCard">
                <span className="eyebrow">Usuarios</span>
                <strong>{dashboard.stats.users}</strong>
              </article>
              <article className="statCard">
                <span className="eyebrow">Productos</span>
                <strong>{dashboard.stats.products}</strong>
              </article>
              <article className="statCard">
                <span className="eyebrow">Categorias</span>
                <strong>{dashboard.stats.categories}</strong>
              </article>
              <article className="statCard">
                <span className="eyebrow">Pedidos</span>
                <strong>{dashboard.stats.orders}</strong>
              </article>
            </div>

            <div className="dashboardBlocks">
              <section className="miniPanel">
                <h3>Usuarios recientes</h3>
                {dashboard.recentUsers.length === 0 ? (
                  <p className="subtle">No hay usuarios recientes.</p>
                ) : (
                  dashboard.recentUsers.map((recentUser) => (
                    <div key={recentUser.id} className="miniRow">
                      <strong>{recentUser.name}</strong>
                      <small>{recentUser.email}</small>
                    </div>
                  ))
                )}
              </section>

              <section className="miniPanel">
                <h3>Pedidos recientes</h3>
                {dashboard.recentOrders.length === 0 ? (
                  <p className="subtle">No hay pedidos registrados.</p>
                ) : (
                  dashboard.recentOrders.map((order) => (
                    <div key={order.id} className="miniRow">
                      <strong>Pedido #{order.id}</strong>
                      <small>
                        {order.user?.name || order.user?.email || "Cliente"} | {order.status} | ${Number(order.total || 0).toFixed(2)}
                      </small>
                    </div>
                  ))
                )}
              </section>
            </div>
          </article>
        )}

        {activeTab === "settings" && (
          <article className="panel">
            <h2>Branding y video</h2>
            <form onSubmit={handleSettingsSubmit} className="categoryForm">
              <label htmlFor="brandName">Nombre de marca</label>
              <input id="brandName" type="text" value={settingsForm.brandName} onChange={(event) => setSettingsForm((prev) => ({ ...prev, brandName: event.target.value }))} required />
              <label htmlFor="logoUrl">URL del logo</label>
              <input id="logoUrl" type="url" value={settingsForm.logoUrl} onChange={(event) => setSettingsForm((prev) => ({ ...prev, logoUrl: event.target.value }))} />
              <label htmlFor="promoVideoUrl">URL video promocional (YouTube/TikTok)</label>
              <input id="promoVideoUrl" type="url" value={settingsForm.promoVideoUrl} onChange={(event) => setSettingsForm((prev) => ({ ...prev, promoVideoUrl: event.target.value }))} />
              <label htmlFor="promoVideoTitle">Titulo del video</label>
              <input id="promoVideoTitle" type="text" value={settingsForm.promoVideoTitle} onChange={(event) => setSettingsForm((prev) => ({ ...prev, promoVideoTitle: event.target.value }))} />
              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar branding"}</button>
              </div>
            </form>
          </article>
        )}

        <article className="panel">
          <div className="listHeader">
            <h2>{TAB_LIST_TITLES[activeTab] || "Vista"}</h2>
            <div className="actions">
              {activeTab === "users" && <button onClick={() => { resetUserForm(); setFormModal("user"); }}>+ Nuevo usuario</button>}
              {activeTab === "users" && <button type="button" className="ghost" onClick={() => { resetInviteForm(); setFormModal("invite"); }}>+ Invitar usuario</button>}
              {activeTab === "categories" && <button onClick={() => { resetForm(); setFormModal("category"); }}>+ Nueva categoria</button>}
              {activeTab === "products" && (
                <>
                  <button onClick={() => { resetProductForm(); setFormModal("product"); }}>+ Nuevo producto</button>
                  <button className="ghost" onClick={() => setFormModal("import")}>Importar Excel</button>
                </>
              )}
              {activeTab === "slides" && <button onClick={() => { resetSlideForm(); setFormModal("slide"); }}>+ Nuevo slide</button>}
              {activeTab === "flyers" && <button onClick={() => { resetFlyerForm(); setFormModal("flyer"); }}>+ Nuevo flyer</button>}
              {activeTab === "orders" && <button onClick={() => { setManualOrderForm({ nombre: "", email: "", telefono: "", items: [] }); setFormModal("manualOrder"); }}>+ Pedido manual</button>}
              <button className="ghost" onClick={loadData} disabled={listLoading}>{listLoading ? "Actualizando..." : "Recargar"}</button>
            </div>
          </div>

          {activeTab === "orders" && (
            <div className="orderFilterBar">
              <button type="button" className={ordersFilter === "todos" ? "filterBtn active" : "filterBtn"} onClick={() => { setOrdersFilter("todos"); setListPage(1); }}>Todos</button>
              <button type="button" className={ordersFilter === "preparar" ? "filterBtn active" : "filterBtn"} onClick={() => { setOrdersFilter("preparar"); setListPage(1); }}>Preparar</button>
              <button type="button" className={ordersFilter === "pagado" ? "filterBtn active" : "filterBtn"} onClick={() => { setOrdersFilter("pagado"); setListPage(1); }}>Pagados</button>
            </div>
          )}

          {!["dashboard", "settings", "atributos"].includes(activeTab) && (
            <div className="listToolbar">
              <input
                type="text"
                className="listSearchInput"
                placeholder="Buscar..."
                value={listSearch}
                onChange={(e) => { setListSearch(e.target.value); setListPage(1); }}
              />
              <select className="listSortSelect" value={listSort} onChange={(e) => { setListSort(e.target.value); setListPage(1); }}>
                {(activeTab === "users" || activeTab === "products" || activeTab === "orders" || activeTab === "despacho" || activeTab === "envios" || activeTab === "clientes") && <option value="newest">Mas recientes</option>}
                {(activeTab === "users" || activeTab === "products" || activeTab === "orders" || activeTab === "despacho" || activeTab === "envios" || activeTab === "clientes") && <option value="oldest">Mas antiguos</option>}
                {(activeTab === "users" || activeTab === "categories" || activeTab === "products" || activeTab === "clientes") && <option value="name_asc">Nombre A-Z</option>}
                {(activeTab === "users" || activeTab === "categories" || activeTab === "products" || activeTab === "clientes") && <option value="name_desc">Nombre Z-A</option>}
                {activeTab === "products" && <option value="price_asc">Precio menor</option>}
                {activeTab === "products" && <option value="price_desc">Precio mayor</option>}
                {activeTab === "products" && <option value="stock_asc">Menor stock</option>}
                {(activeTab === "slides" || activeTab === "flyers") && <option value="order">Por orden</option>}
                {(activeTab === "slides" || activeTab === "flyers") && <option value="name_asc">Nombre A-Z</option>}
                {(activeTab === "orders" || activeTab === "despacho" || activeTab === "envios") && <option value="total_desc">Mayor total</option>}
                {(activeTab === "orders" || activeTab === "despacho" || activeTab === "envios") && <option value="total_asc">Menor total</option>}
              </select>
              <span className="listCount">{filteredList.length} resultado{filteredList.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {listError && <p className="error">{listError}</p>}

          <div className="list">
            {activeTab === "dashboard" && (
              <article className="card">
                <div className="card-info">
                  <strong>Accesos rapidos</strong>
                  <small>Crea usuarios, organiza categorias y administra el catalogo.</small>
                </div>
                <div className="actions">
                  <button type="button" className="ghost" onClick={() => setActiveTab("users")}>Usuarios</button>
                  <button type="button" className="ghost" onClick={() => setActiveTab("products")}>Productos</button>
                </div>
              </article>
            )}

            {activeTab === "settings" && (
              <article className="card">
                <div className="card-info">
                  <strong>{settingsForm.brandName || "Don Joyero"}</strong>
                  <small>Logo: {settingsForm.logoUrl || "Sin logo"} — Video: {settingsForm.promoVideoUrl || "Sin video"}</small>
                </div>
              </article>
            )}

            {activeTab === "atributos" && [
              { type: "tipoPieza", title: "Tipos de pieza", items: tiposPieza },
              { type: "material", title: "Materiales", items: materialesCatalogo },
              { type: "gema", title: "Gemas", items: gemas },
              { type: "origenGema", title: "Origenes de gema", items: origenesGema },
            ].map((section) => (
              <div key={section.type} style={{ marginBottom: 24 }}>
                <div className="listHeader" style={{ marginTop: 0 }}>
                  <h3 style={{ margin: 0 }}>{section.title}</h3>
                  <button type="button" className="ghost" onClick={() => { setCatalogForm({ ...initialCatalogForm, type: section.type }); setFormModal("catalog"); }}>
                    + Agregar
                  </button>
                </div>
                {section.items.length === 0 && <p className="empty">Sin registros todavia.</p>}
                {section.items.map((item) => (
                  <article key={item.id} className="card">
                    <div className="card-info">
                      <strong>{item.name}</strong>
                      <small>Codigo: {item.code}{section.type === "material" ? ` — ${item.requiereQuilate ? "usa quilates" : "no usa quilates"}` : ""}</small>
                    </div>
                    <div className="card-badges">
                      <span className={`badge ${item.active ? "on" : "off"}`}>{item.active ? "Activo" : "Inactivo"}</span>
                    </div>
                    <div className="actions">
                      <button type="button" className="ghost" onClick={() => { startEditCatalog(section.type, item); setFormModal("catalog"); }}>Editar</button>
                      <button type="button" className="danger" onClick={() => handleCatalogDelete(section.type, item)} disabled={catalogDeletingId === item.id}>
                        {catalogDeletingId === item.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ))}

            {activeTab === "users" && pagedList.map((u) => (
              <article key={u.id} className="card">
                <div className="card-info">
                  <strong>{u.name}</strong>
                  <small>{u.email} — Creado: {new Date(u.createdAt).toLocaleDateString()}</small>
                  {["ADMINISTRADOR", "VENDEDOR"].includes(u.rol) && (
                    <small>
                      {u.permisos?.length > 0
                        ? `Permisos: ${u.permisos.join(", ")}`
                        : u.rol === "ADMINISTRADOR" ? "Acceso total" : "Sin acceso a secciones"}
                    </small>
                  )}
                </div>
                <div className="card-badges">
                  <span className={`badge ${u.rol === "CLIENTE" ? "off" : "on"}`}>{roleLabel(u.rol)}</span>
                </div>
                <div className="actions">
                  <button type="button" className="ghost" onClick={() => startEditUser(u)}>Editar</button>
                  <button type="button" className="danger" onClick={() => handleDeleteUser(u)} disabled={deletingId === u.id}>{deletingId === u.id ? "..." : "Eliminar"}</button>
                </div>
              </article>
            ))}

            {activeTab === "users" && invitations.length > 0 && (
              <>
                <h3 className="listSubheading">Invitaciones pendientes</h3>
                {invitations.map((inv) => {
                  const expired = new Date(inv.expiresAt) < new Date();
                  return (
                    <article key={inv.id} className="card">
                      <div className="card-info">
                        <strong>{inv.name}</strong>
                        <small>{inv.email} — Expira: {new Date(inv.expiresAt).toLocaleDateString()}</small>
                      </div>
                      <div className="card-badges">
                        <span className={`badge ${expired ? "off" : "on"}`}>{expired ? "Expirada" : "Pendiente"}</span>
                        <span className={`badge ${inv.rol === "CLIENTE" ? "off" : "on"}`}>{roleLabel(inv.rol)}</span>
                      </div>
                      <div className="actions">
                        <button type="button" className="ghost" onClick={() => handleResendInvitation(inv)} disabled={invitationActionId === inv.id}>
                          {invitationActionId === inv.id ? "..." : "Reenviar"}
                        </button>
                        <button type="button" className="danger" onClick={() => handleRevokeInvitation(inv)} disabled={invitationActionId === inv.id}>
                          {invitationActionId === inv.id ? "..." : "Revocar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </>
            )}

            {activeTab === "categories" && pagedList.map((c) => (
              <article key={c.id} className={c._parent ? "card card-sub" : "card"}>
                <div className="card-info">
                  <strong>{c._parent ? `↳ ${c.name}` : c.name}</strong>
                  <small>/{c.slug} {c._parent ? `— Padre: ${c._parent}` : c.description ? `— ${c.description}` : ""}</small>
                  {!c._parent && c.children?.length > 0 && <small>Subcategorias: {c.children.map((s) => s.name).join(", ")}</small>}
                </div>
                <div className="card-badges">
                  <span className={`badge ${c.active ? "on" : "off"}`}>{c.active ? "Activa" : "Inactiva"}</span>
                  <span className={`badge ${c.showInMenu ? "on" : "off"}`}>{c.showInMenu ? "Menu" : "Oculta"}</span>
                </div>
                <div className="actions">
                  <button type="button" className="ghost" onClick={() => startEdit(c)}>Editar</button>
                  <button type="button" className="danger" onClick={() => handleDelete(c)} disabled={deletingId === c.id}>{deletingId === c.id ? "..." : "Eliminar"}</button>
                </div>
              </article>
            ))}

            {activeTab === "products" && pagedList.map((p) => (
              <article key={p.id} className="card">
                {p.imageUrl && <img className="card-thumb" src={p.imageUrl} alt="" />}
                <div className="card-info">
                  <strong>{p.name}</strong>
                  <small>{p.category || "Sin categoria"} — ${Number(p.price || 0).toFixed(2)} — Stock: {p.stock}</small>
                  {p.sku && <small>SKU: {p.sku}</small>}
                  {p.createdBy && <small>Registrado por: {p.createdBy.name}</small>}
                </div>
                <div className="card-badges">
                  <span className={`badge ${p.active ? "on" : "off"}`}>{p.active ? "Activo" : "Inactivo"}</span>
                  {p.recommended && <span className="badge on">Destacado</span>}
                </div>
                <div className="actions">
                  {p.sku ? (
                    <button type="button" className="ghost" onClick={() => setBarcodeViewProduct(p)}>Codigo</button>
                  ) : (
                    <button type="button" className="ghost" onClick={() => startEditProduct(p)}>Generar codigo</button>
                  )}
                  <button type="button" className="ghost" onClick={() => startEditProduct(p)}>Editar</button>
                  <button type="button" className="danger" onClick={() => handleDeleteProduct(p)} disabled={deletingId === p.id}>{deletingId === p.id ? "..." : "Desactivar"}</button>
                </div>
              </article>
            ))}

            {activeTab === "slides" && pagedList.map((s) => (
              <article key={s.id} className="card">
                <img className="card-thumb" src={s.imageUrl} alt="" />
                <div className="card-info">
                  <strong>{s.title}</strong>
                  <small>{s.subtitle || "Sin subtitulo"} — Orden: {s.displayOrder}</small>
                </div>
                <div className="card-badges">
                  <span className={`badge ${s.active ? "on" : "off"}`}>{s.active ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="actions">
                  <button type="button" className="ghost" onClick={() => startEditSlide(s)}>Editar</button>
                  <button type="button" className="danger" onClick={() => handleDeleteSlide(s)} disabled={deletingId === s.id}>{deletingId === s.id ? "..." : "Eliminar"}</button>
                </div>
              </article>
            ))}

            {activeTab === "flyers" && pagedList.map((f) => (
              <article key={f.id} className="card">
                <img className="card-thumb" src={f.imageUrl} alt="" />
                <div className="card-info">
                  <strong>{f.title}</strong>
                  <small>{f.subtitle || "Sin subtitulo"} — Orden: {f.displayOrder}</small>
                  {f.linkUrl && <small>Destino: {f.linkUrl}</small>}
                </div>
                <div className="card-badges">
                  <span className={`badge ${f.active ? "on" : "off"}`}>{f.active ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="actions">
                  <button type="button" className="ghost" onClick={() => startEditFlyer(f)}>Editar</button>
                  <button type="button" className="danger" onClick={() => handleDeleteFlyer(f)} disabled={deletingId === f.id}>{deletingId === f.id ? "..." : "Eliminar"}</button>
                </div>
              </article>
            ))}

            {(activeTab === "orders" || activeTab === "despacho" || activeTab === "envios") && pagedList.map((order) => (
              <article className="card card-vertical" key={order.id}>
                <div className="card-info">
                  <div className="orderHeader">
                    <strong>Pedido #{order.id}</strong>
                    <span className={`orderBadge ${order.estado.toLowerCase()}`}>{order.estado}</span>
                  </div>
                  <small>{order.clienteNombre || order.usuario?.name || "Cliente"} — {order.clienteEmail || order.usuario?.email || ""}{order.clienteTelefono ? ` — Tel: ${order.clienteTelefono}` : ""}</small>
                  <small>Total: ${Number(order.total || 0).toFixed(2)} — {new Date(order.createdAt).toLocaleString()}</small>
                  {order.metodoPago && <small>Pago: {order.metodoPago}{order.numeroComprobante ? ` — #${order.numeroComprobante}` : ""}</small>}
                  {order.direccionEnvio && <small>Direccion: {order.direccionEnvio}</small>}
                  {order.courierEnvio && <small>Courier: {order.courierEnvio}{order.numeroGuia ? ` — Guia #${order.numeroGuia}` : ""}</small>}
                  {order.confirmedBy && <small>Pago confirmado por: {order.confirmedBy.name}</small>}
                  {order.dispatchedBy && <small>Despachado por: {order.dispatchedBy.name}</small>}
                  {order.comprobanteUrl && <a href={`${API_URL}${order.comprobanteUrl}`} target="_blank" rel="noreferrer" className="imageLink">Ver comprobante</a>}
                </div>
                {order.items?.length > 0 && (
                  <ul className="orderItems">
                    {order.items.map((item) => <li key={item.id}>{item.quantity}x {item.producto?.name || `Producto #${item.productoId}`} — ${Number(item.unitPrice).toFixed(2)}</li>)}
                  </ul>
                )}
                <div className="actions">
                  {["PAGADO", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO"].includes(order.estado) && (
                    <button type="button" className="ghost" onClick={() => openDedicationView(order)}>Dedicatorias</button>
                  )}
                  {activeTab === "despacho" ? (
                    <button type="button" onClick={() => handleUpdateOrderStatus(order.id, "LISTO_PARA_ENVIO")}>Marcar Listo para Envio</button>
                  ) : activeTab === "envios" ? (
                    <button type="button" onClick={() => openShippingModal(order.id)}>Marcar Enviado</button>
                  ) : !ORDER_LOCKED_STATES.includes(order.estado) ? (
                    <button type="button" onClick={() => openPaymentModal(order.id)}>Pagar</button>
                  ) : null}
                </div>
              </article>
            ))}

            {activeTab === "clientes" && pagedList.map((cliente) => (
              <article className="card card-vertical" key={cliente.key}>
                <div className="card-info">
                  <strong>{cliente.nombre}</strong>
                  <small>{cliente.email}{cliente.telefono ? ` — Tel: ${cliente.telefono}` : ""}</small>
                  <small>{cliente.pedidos.length} pedido{cliente.pedidos.length !== 1 ? "s" : ""}</small>
                </div>
                <ul className="clienteOrdersList">
                  {cliente.pedidos.map((pedido) => (
                    <li key={pedido.id} className="clienteOrderItem">
                      <div className="clienteOrderHeader">
                        <span>Pedido #{pedido.id} — {new Date(pedido.createdAt).toLocaleDateString()}</span>
                        <span className={`orderBadge ${pedido.estado.toLowerCase()}`}>{pedido.estado}</span>
                      </div>
                      {pedido.dedicatoriaEscrita ? (
                        <div className="clienteDedicatoria">
                          <small>De: {pedido.dedicatoriaDe} — Para: {pedido.dedicatoriaPara}</small>
                          <small className="clienteDedicatoriaMensaje">"{pedido.dedicatoriaMensaje}"</small>
                          {pedido.dedicatoriaToken && (
                            <div className="clienteDedicatoriaLink">
                              <a href={`${FRONTEND_URL}/dedicatoria/ver/${pedido.dedicatoriaToken}`} target="_blank" rel="noreferrer" className="imageLink">Ver dedicatoria</a>
                              <button type="button" className="ghost" onClick={() => navigator.clipboard?.writeText(`${FRONTEND_URL}/dedicatoria/ver/${pedido.dedicatoriaToken}`)}>Copiar link</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <small className="clienteSinDedicatoria">Sin dedicatoria todavia</small>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}

            {!listLoading && filteredList.length === 0 && !["dashboard", "settings", "atributos"].includes(activeTab) && (
              <p style={{ padding: "16px", textAlign: "center", color: "var(--muted)" }}>
                {listSearch ? "Sin resultados para la busqueda." : "No hay elementos."}
              </p>
            )}
          </div>

          {listTotalPages > 1 && (
            <nav className="listPagination">
              <button type="button" className="ghost" disabled={listPage === 1} onClick={() => setListPage((p) => p - 1)}>‹ Anterior</button>
              <span className="listPageInfo">Pagina {listPage} de {listTotalPages}</span>
              <button type="button" className="ghost" disabled={listPage === listTotalPages} onClick={() => setListPage((p) => p + 1)}>Siguiente ›</button>
            </nav>
          )}
        </article>
        </section>
      </section>

      {formModal === "user" && (
        <div className="modalOverlay" onClick={resetUserForm}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditingUser ? "Editar usuario" : "Nuevo usuario"}</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleUserSubmit} className="categoryForm">
              <label htmlFor="user-name">Nombre</label>
              <input id="user-name" type="text" value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} required />
              <label htmlFor="user-email">Email</label>
              <input id="user-email" type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} required />
              <label htmlFor="user-password">{isEditingUser ? "Nueva password (opcional)" : "Password"}</label>
              <input id="user-password" type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} />
              <label htmlFor="user-role">Rol</label>
              <select id="user-role" value={userForm.rol} onChange={(e) => setUserForm((p) => ({ ...p, rol: e.target.value }))}>
                <option value="CLIENTE">Cliente</option>
                <option value="VENDEDOR">Vendedor</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
              {["ADMINISTRADOR", "VENDEDOR"].includes(userForm.rol) && (
                <>
                  <label>
                    Permisos ({userForm.rol === "ADMINISTRADOR" ? "sin seleccion = acceso total" : "sin seleccion = sin acceso a ninguna seccion"})
                  </label>
                  <div className="permissionsGrid">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label key={perm.key} className="inlineCheck">
                        <input type="checkbox" checked={userForm.permisos.includes(perm.key)} onChange={(e) => setUserForm((p) => ({ ...p, permisos: e.target.checked ? [...p.permisos, perm.key] : p.permisos.filter((k) => k !== perm.key) }))} />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : isEditingUser ? "Actualizar" : "Crear usuario"}</button>
                <button type="button" className="ghost" onClick={resetUserForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formModal === "invite" && (
        <div className="modalOverlay" onClick={resetInviteForm}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Invitar usuario</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleInviteSubmit} className="categoryForm">
              <label htmlFor="invite-name">Nombre</label>
              <input id="invite-name" type="text" value={inviteForm.name} onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))} required />
              <label htmlFor="invite-email">Email</label>
              <input id="invite-email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} required />
              <label htmlFor="invite-role">Rol</label>
              <select id="invite-role" value={inviteForm.rol} onChange={(e) => setInviteForm((p) => ({ ...p, rol: e.target.value }))}>
                <option value="CLIENTE">Cliente</option>
                <option value="VENDEDOR">Vendedor</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
              {["ADMINISTRADOR", "VENDEDOR"].includes(inviteForm.rol) && (
                <>
                  <label>
                    Permisos ({inviteForm.rol === "ADMINISTRADOR" ? "sin seleccion = acceso total" : "sin seleccion = sin acceso a ninguna seccion"})
                  </label>
                  <div className="permissionsGrid">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label key={perm.key} className="inlineCheck">
                        <input type="checkbox" checked={inviteForm.permisos.includes(perm.key)} onChange={(e) => setInviteForm((p) => ({ ...p, permisos: e.target.checked ? [...p.permisos, perm.key] : p.permisos.filter((k) => k !== perm.key) }))} />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="actions">
                <button type="submit" disabled={inviting}>{inviting ? "Enviando..." : "Enviar invitacion"}</button>
                <button type="button" className="ghost" onClick={resetInviteForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formModal === "catalog" && (
        <div className="modalOverlay" onClick={resetCatalogForm}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{catalogForm.id ? "Editar" : "Agregar"} — {CATALOG_ENDPOINTS[catalogForm.type].label}</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleCatalogSubmit} className="categoryForm">
              <label htmlFor="catalog-name">Nombre</label>
              <input id="catalog-name" type="text" value={catalogForm.name} onChange={(e) => setCatalogForm((p) => ({ ...p, name: e.target.value }))} required />
              <label htmlFor="catalog-code">Codigo (para el SKU)</label>
              <input id="catalog-code" type="text" placeholder="Ej: AN, OR, D, L" value={catalogForm.code} onChange={(e) => setCatalogForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required />
              {catalogForm.type === "material" && (
                <label className="inlineCheck" htmlFor="catalog-requiere-quilate">
                  <input id="catalog-requiere-quilate" type="checkbox" checked={catalogForm.requiereQuilate} onChange={(e) => setCatalogForm((p) => ({ ...p, requiereQuilate: e.target.checked }))} />
                  Usa quilates (ej. Oro, Platino)
                </label>
              )}
              <label className="inlineCheck" htmlFor="catalog-active">
                <input id="catalog-active" type="checkbox" checked={catalogForm.active} onChange={(e) => setCatalogForm((p) => ({ ...p, active: e.target.checked }))} />
                Activo
              </label>
              <div className="actions">
                <button type="submit" disabled={catalogSaving}>{catalogSaving ? "Guardando..." : catalogForm.id ? "Actualizar" : "Crear"}</button>
                <button type="button" className="ghost" onClick={resetCatalogForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formModal === "category" && (
        <div className="modalOverlay" onClick={resetForm}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditing ? "Editar categoria" : "Nueva categoria"}</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleSubmit} className="categoryForm">
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: p.id ? p.slug : slugify(e.target.value) }))} required />
              <label htmlFor="slug">Slug</label>
              <input id="slug" type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} required />
              <label htmlFor="description">Descripcion</label>
              <textarea id="description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              <label htmlFor="bannerImageUrl">URL imagen categoria</label>
              <input id="bannerImageUrl" type="url" value={form.bannerImageUrl} onChange={(e) => setForm((p) => ({ ...p, bannerImageUrl: e.target.value }))} />
              <label htmlFor="parentId">Categoria padre</label>
              <select id="parentId" value={form.parentId} onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}>
                <option value="">Ninguna (categoria principal)</option>
                {categories.filter((c) => !c.parentId && c.id !== form.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="inlineCheck" htmlFor="active"><input id="active" type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} /> Activa</label>
              <label className="inlineCheck" htmlFor="showInMenu"><input id="showInMenu" type="checkbox" checked={form.showInMenu} onChange={(e) => setForm((p) => ({ ...p, showInMenu: e.target.checked }))} /> Mostrar en menu</label>
              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}</button>
                <button type="button" className="ghost" onClick={resetForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {barcodeViewProduct && (
        <div className="modalOverlay" onClick={() => setBarcodeViewProduct(null)}>
          <div className="modalContent modalContentWide" onClick={(e) => e.stopPropagation()}>
            <h2>Codigo de {barcodeViewProduct.name}</h2>
            <ProductBarcodeLabel sku={barcodeViewProduct.sku} name={barcodeViewProduct.name} price={barcodeViewProduct.price} />
            <div className="actions">
              <button type="button" className="ghost" onClick={() => setBarcodeViewProduct(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {dedicationOrder && (
        <div className="modalOverlay" onClick={() => setDedicationOrder(null)}>
          <div className="modalContent modalContentWide" onClick={(e) => e.stopPropagation()}>
            <h2>Dedicatorias del pedido #{dedicationOrder.id}</h2>
            {listError && <p className="error">{listError}</p>}
            {dedicationLoading && <p>Cargando...</p>}
            {!dedicationLoading && dedicationList.length === 0 && <p className="empty">Sin dedicatorias para este pedido.</p>}
            {!dedicationLoading && dedicationList.map((d) => (
              <div key={d.id} className="formSection">
                <div className="formSectionTitle">
                  <p className="eyebrow">{d.productoNombre}{d.unidad ? ` — unidad ${d.unidad}` : ""}</p>
                  <span className={`badge ${d.escrita ? "on" : "off"}`}>{d.escrita ? "Escrita" : "Pendiente"}</span>
                </div>
                <DedicationQrLabel url={d.url} label={`${dedicationOrder.id}-${d.id}`} />
                {d.escrita && (
                  <p className="formSectionHint">Para: {d.para} — "{d.mensaje}"</p>
                )}
              </div>
            ))}
            <div className="actions">
              <button type="button" className="ghost" onClick={() => setDedicationOrder(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {formModal === "product" && (
        <div className="modalOverlay" onClick={resetProductForm}>
          <div className="modalContent modalContentWide" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditingProduct ? "Editar producto" : "Nuevo producto"}</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleProductSubmit} className="categoryForm">
              <div className="formSection">
                <div className="formSectionTitle"><p className="eyebrow">Informacion basica</p></div>
                <div className="formGrid2">
                  <div className="formField">
                    <label htmlFor="product-name">Nombre</label>
                    <input id="product-name" type="text" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value, slug: p.id ? p.slug : slugify(e.target.value) }))} required />
                  </div>
                  <div className="formField">
                    <label htmlFor="product-slug">Slug</label>
                    <input id="product-slug" type="text" value={productForm.slug} onChange={(e) => setProductForm((p) => ({ ...p, slug: slugify(e.target.value) }))} required />
                  </div>
                </div>
                <div className="formField">
                  <label htmlFor="product-description">Descripcion</label>
                  <textarea id="product-description" rows={3} value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="formField">
                  <label htmlFor="product-category">Categoria</label>
                  <select id="product-category" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}>
                    <option value="">Sin categoria</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="formSection">
                <div className="formSectionTitle"><p className="eyebrow">Imagenes</p></div>
                <div className="formField">
                  <label htmlFor="product-image">Imagen principal</label>
                  <div className="imageUploadRow">
                    <input id="product-image" type="url" placeholder="URL o sube una imagen" value={productForm.imageUrl} onChange={(e) => setProductForm((p) => ({ ...p, imageUrl: e.target.value }))} style={{ flex: 1 }} required />
                    <label className="uploadBtn">
                      {uploadingImage ? "Subiendo..." : "Subir"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "imageUrl")} disabled={uploadingImage} />
                    </label>
                  </div>
                  {productForm.imageUrl && <img src={productForm.imageUrl} alt="preview" className="imagePreviewThumb" />}
                </div>
                <div className="formField">
                  <label htmlFor="product-imagenes">Galeria</label>
                  <div className="imageUploadRow">
                    <textarea id="product-imagenes" rows={2} placeholder="URLs separadas por coma" value={productForm.imagenesRaw} onChange={(e) => setProductForm((p) => ({ ...p, imagenesRaw: e.target.value }))} style={{ flex: 1 }} />
                    <label className="uploadBtn" style={{ alignSelf: "flex-start" }}>
                      {uploadingImage ? "Subiendo..." : "+ Imagen"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "gallery")} disabled={uploadingImage} />
                    </label>
                  </div>
                  {productForm.imagenesRaw && (
                    <div className="imagePreviewGrid">
                      {productForm.imagenesRaw.split(",").map((u) => u.trim()).filter(Boolean).map((url, idx, arr) => (
                        <div className="imagePreviewItem" key={`${url}-${idx}`}>
                          <img src={url} alt="" className="imagePreviewThumb" />
                          <button
                            type="button"
                            className="imagePreviewRemove"
                            aria-label="Quitar imagen"
                            onClick={() => setProductForm((p) => ({ ...p, imagenesRaw: arr.filter((_, i) => i !== idx).join(", ") }))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="formSection">
                <div className="formSectionTitle"><p className="eyebrow">Precio e inventario</p></div>
                <div className="formGrid2">
                  <div className="formField">
                    <label htmlFor="product-price">Precio</label>
                    <input id="product-price" type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
                  </div>
                  <div className="formField">
                    <label htmlFor="product-stock">Stock</label>
                    <input id="product-stock" type="number" min="0" step="1" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="formSection">
                <div className="formSectionTitle"><p className="eyebrow">Atributos y codigo (SKU)</p></div>
                <p className="formSectionHint">Elegi los atributos y el codigo se arma solo. Se usa para el codigo de barras y el QR.</p>
                <div className="formGrid2">
                  <div className="formField">
                    <label htmlFor="product-tipoPieza">Tipo de pieza</label>
                    <select id="product-tipoPieza" value={productForm.tipoPiezaId} onChange={(e) => setProductForm((p) => ({ ...p, tipoPiezaId: e.target.value }))}>
                      <option value="">Sin definir</option>
                      {tiposPieza.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                    </select>
                  </div>
                  <div className="formField">
                    <label htmlFor="product-material">Material</label>
                    <select id="product-material" value={productForm.materialId} onChange={(e) => setProductForm((p) => ({ ...p, materialId: e.target.value }))}>
                      <option value="">Sin definir</option>
                      {materialesCatalogo.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                    </select>
                  </div>
                </div>
                {materialesCatalogo.find((m) => String(m.id) === productForm.materialId)?.requiereQuilate && (
                  <div className="formField">
                    <label htmlFor="product-quilates">Quilates</label>
                    <input id="product-quilates" type="number" min="0" step="1" placeholder="Ej: 18" value={productForm.quilates} onChange={(e) => setProductForm((p) => ({ ...p, quilates: e.target.value }))} />
                  </div>
                )}
                <div className="formGrid2">
                  <div className="formField">
                    <label htmlFor="product-gema">Gema</label>
                    <select id="product-gema" value={productForm.gemaId} onChange={(e) => setProductForm((p) => ({ ...p, gemaId: e.target.value }))}>
                      <option value="">Ninguna</option>
                      {gemas.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.code})</option>)}
                    </select>
                  </div>
                  {productForm.gemaId && (
                    <div className="formField">
                      <label htmlFor="product-origenGema">Origen de la gema</label>
                      <select id="product-origenGema" value={productForm.origenGemaId} onChange={(e) => setProductForm((p) => ({ ...p, origenGemaId: e.target.value }))}>
                        <option value="">Sin definir</option>
                        {origenesGema.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {productForm.gemaId && (
                  <div className="formField">
                    <label htmlFor="product-quilatajeGema">Quilataje de la gema (ct)</label>
                    <input id="product-quilatajeGema" type="number" min="0" step="0.01" placeholder="Ej: 1.30" value={productForm.quilatajeGema} onChange={(e) => setProductForm((p) => ({ ...p, quilatajeGema: e.target.value }))} />
                  </div>
                )}
                <div className="formField">
                  <label htmlFor="product-sku">SKU / codigo</label>
                  <div className="imageUploadRow">
                    <input
                      id="product-sku"
                      type="text"
                      placeholder="Se genera solo al guardar"
                      value={productForm.sku}
                      onChange={(e) => setProductForm((p) => ({ ...p, sku: e.target.value.toUpperCase() }))}
                      style={{ flex: 1 }}
                      disabled={isEditingProduct}
                    />
                    {isEditingProduct && (
                      <button type="button" className="ghost" onClick={handleRegenerateSku} disabled={saving}>Regenerar codigo</button>
                    )}
                  </div>
                  {isEditingProduct && <p className="formSectionHint">El codigo es unico y no se edita a mano. Usa "Regenerar codigo" si necesitas uno nuevo.</p>}
                </div>
                <ProductBarcodeLabel sku={productForm.sku} name={productForm.name} price={productForm.price} />
              </div>

              <div className="formSection">
                <div className="formSectionTitle"><p className="eyebrow">Detalles adicionales</p></div>
                <div className="formGrid2">
                  <div className="formField">
                    <label htmlFor="product-materiales">Materiales</label>
                    <input id="product-materiales" type="text" placeholder="Ej: Plata 925" value={productForm.materiales} onChange={(e) => setProductForm((p) => ({ ...p, materiales: e.target.value }))} />
                  </div>
                  <div className="formField">
                    <label htmlFor="product-dimensiones">Dimensiones</label>
                    <input id="product-dimensiones" type="text" placeholder="Ej: Largo 45 cm" value={productForm.dimensiones} onChange={(e) => setProductForm((p) => ({ ...p, dimensiones: e.target.value }))} />
                  </div>
                </div>
                <div className="formField">
                  <label htmlFor="product-cuidados">Cuidados</label>
                  <textarea id="product-cuidados" rows={2} placeholder="Instrucciones de cuidado" value={productForm.cuidados} onChange={(e) => setProductForm((p) => ({ ...p, cuidados: e.target.value }))} />
                </div>
                <div className="formField">
                  <label htmlFor="product-videoUrl">Video (YouTube/TikTok)</label>
                  <input id="product-videoUrl" type="text" value={productForm.videoUrl} onChange={(e) => setProductForm((p) => ({ ...p, videoUrl: e.target.value }))} />
                </div>
              </div>

              <div className="formSection">
                <div className="formSectionTitle"><p className="eyebrow">Visibilidad</p></div>
                <div className="toggleRow">
                  <label className={`toggleChip ${productForm.grabado ? "active" : ""}`} htmlFor="product-grabado">
                    <input id="product-grabado" type="checkbox" checked={productForm.grabado} onChange={(e) => setProductForm((p) => ({ ...p, grabado: e.target.checked }))} /> Grabado
                  </label>
                  <label className={`toggleChip ${productForm.recommended ? "active" : ""}`} htmlFor="product-recommended">
                    <input id="product-recommended" type="checkbox" checked={productForm.recommended} onChange={(e) => setProductForm((p) => ({ ...p, recommended: e.target.checked }))} /> Recomendado
                  </label>
                  <label className={`toggleChip ${productForm.active ? "active" : ""}`} htmlFor="product-active">
                    <input id="product-active" type="checkbox" checked={productForm.active} onChange={(e) => setProductForm((p) => ({ ...p, active: e.target.checked }))} /> Activo
                  </label>
                </div>
              </div>

              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : isEditingProduct ? "Actualizar" : "Crear"}</button>
                <button type="button" className="ghost" onClick={resetProductForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formModal === "import" && (
        <div className="modalOverlay" onClick={() => setFormModal("")}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Importar productos desde Excel</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "4px 0 16px" }}>
              Descarga la plantilla, llena los datos y sube el Excel junto con las imagenes.
            </p>
            <div className="categoryForm">
              <button type="button" className="ghost" onClick={handleDownloadTemplate}>Descargar plantilla Excel</button>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Archivo Excel (.xlsx)
                <input type="file" accept=".xlsx,.xls" style={{ display: "block", marginTop: 4 }} onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Imagenes (opcional, selecciona varias)
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "block", marginTop: 4 }} onChange={(e) => setImportImages(Array.from(e.target.files || []))} />
              </label>
              {importImages.length > 0 && <small style={{ color: "#666" }}>{importImages.length} imagen(es): {importImages.map((f) => f.name).join(", ")}</small>}
              <div className="actions">
                <button type="button" onClick={handleImportProducts} disabled={!importFile || importing}>{importing ? "Importando..." : "Importar productos"}</button>
                <button type="button" className="ghost" onClick={() => setFormModal("")}>Cerrar</button>
              </div>
              {importResult && (
                <div style={{ padding: 12, borderRadius: 8, background: importResult.errors?.length ? "#fff3cd" : "#d4edda", fontSize: 13 }}>
                  <strong>{importResult.message}</strong>
                  {importResult.errors?.length > 0 && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                      {importResult.errors.map((err, i) => <li key={i}>Fila {err.row}: {err.error}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {formModal === "slide" && (
        <div className="modalOverlay" onClick={resetSlideForm}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditingSlide ? "Editar slide" : "Nuevo slide"}</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleSlideSubmit} className="categoryForm">
              <label htmlFor="slide-title">Titulo</label>
              <input id="slide-title" type="text" value={slideForm.title} onChange={(e) => setSlideForm((p) => ({ ...p, title: e.target.value }))} required />
              <label htmlFor="slide-subtitle">Subtitulo</label>
              <input id="slide-subtitle" type="text" value={slideForm.subtitle} onChange={(e) => setSlideForm((p) => ({ ...p, subtitle: e.target.value }))} />
              <label htmlFor="slide-image">URL imagen</label>
              <input id="slide-image" type="url" value={slideForm.imageUrl} onChange={(e) => setSlideForm((p) => ({ ...p, imageUrl: e.target.value }))} required />
              <label htmlFor="slide-cta-label">Texto CTA</label>
              <input id="slide-cta-label" type="text" value={slideForm.ctaLabel} onChange={(e) => setSlideForm((p) => ({ ...p, ctaLabel: e.target.value }))} />
              <label htmlFor="slide-cta-url">URL CTA</label>
              <input id="slide-cta-url" type="text" value={slideForm.ctaUrl} onChange={(e) => setSlideForm((p) => ({ ...p, ctaUrl: e.target.value }))} />
              <label htmlFor="slide-order">Orden</label>
              <input id="slide-order" type="number" min={1} value={slideForm.displayOrder} onChange={(e) => setSlideForm((p) => ({ ...p, displayOrder: Number(e.target.value || 1) }))} required />
              <label className="inlineCheck" htmlFor="slide-active"><input id="slide-active" type="checkbox" checked={slideForm.active} onChange={(e) => setSlideForm((p) => ({ ...p, active: e.target.checked }))} /> Activo</label>
              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : isEditingSlide ? "Actualizar" : "Crear"}</button>
                <button type="button" className="ghost" onClick={resetSlideForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formModal === "flyer" && (
        <div className="modalOverlay" onClick={resetFlyerForm}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditingFlyer ? "Editar flyer" : "Nuevo flyer"}</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleFlyerSubmit} className="categoryForm">
              <label htmlFor="flyer-title">Titulo</label>
              <input id="flyer-title" type="text" value={flyerForm.title} onChange={(e) => setFlyerForm((p) => ({ ...p, title: e.target.value }))} required />
              <label htmlFor="flyer-subtitle">Subtitulo</label>
              <input id="flyer-subtitle" type="text" value={flyerForm.subtitle} onChange={(e) => setFlyerForm((p) => ({ ...p, subtitle: e.target.value }))} />
              <label htmlFor="flyer-image">URL imagen</label>
              <input id="flyer-image" type="url" value={flyerForm.imageUrl} onChange={(e) => setFlyerForm((p) => ({ ...p, imageUrl: e.target.value }))} required />
              <label htmlFor="flyer-link">URL destino (opcional)</label>
              <input id="flyer-link" type="text" value={flyerForm.linkUrl} onChange={(e) => setFlyerForm((p) => ({ ...p, linkUrl: e.target.value }))} />
              <label htmlFor="flyer-order">Orden</label>
              <input id="flyer-order" type="number" min={1} value={flyerForm.displayOrder} onChange={(e) => setFlyerForm((p) => ({ ...p, displayOrder: Number(e.target.value || 1) }))} required />
              <label className="inlineCheck" htmlFor="flyer-active"><input id="flyer-active" type="checkbox" checked={flyerForm.active} onChange={(e) => setFlyerForm((p) => ({ ...p, active: e.target.checked }))} /> Activo</label>
              <div className="actions">
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : isEditingFlyer ? "Actualizar" : "Crear"}</button>
                <button type="button" className="ghost" onClick={resetFlyerForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formModal === "manualOrder" && (
        <div className="modalOverlay" onClick={() => { setFormModal(""); setManualOrderForm({ nombre: "", email: "", telefono: "", items: [] }); }}>
          <div className="modalContent modalContentWide" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo pedido manual</h2>
            {listError && <p className="error">{listError}</p>}
            <form onSubmit={handleManualOrderSubmit} className="categoryForm">
              <label htmlFor="mo-nombre">Nombre del cliente</label>
              <input id="mo-nombre" type="text" value={manualOrderForm.nombre} onChange={(e) => setManualOrderForm((p) => ({ ...p, nombre: e.target.value }))} required />
              <label htmlFor="mo-email">Email</label>
              <input id="mo-email" type="email" value={manualOrderForm.email} onChange={(e) => setManualOrderForm((p) => ({ ...p, email: e.target.value }))} required />
              <label htmlFor="mo-telefono">Telefono</label>
              <input id="mo-telefono" type="tel" value={manualOrderForm.telefono} onChange={(e) => setManualOrderForm((p) => ({ ...p, telefono: e.target.value }))} required />
              <label>Buscar producto</label>
              <div className="productPicker">
                <div className="productPickerFilters">
                  <select value={productSearchCat} onChange={(e) => setProductSearchCat(e.target.value)}>
                    <option value="todas">Todas las categorias</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <input type="text" placeholder="Buscar por nombre..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                </div>
                {productSearch.length >= 2 || productSearchCat !== "todas" ? (
                  <ul className="productPickerResults">
                    {products.filter((p) => p.active).filter((p) => productSearchCat === "todas" || p.category === productSearchCat).filter((p) => !productSearch || productSearch.length < 2 || p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 20).map((p) => (
                      <li key={p.id}><button type="button" onClick={() => { addManualOrderItem(p.id); setProductSearch(""); }}><span>{p.name}</span><small>{p.category || "Sin categoria"} — ${Number(p.price).toFixed(2)}</small></button></li>
                    ))}
                    {products.filter((p) => p.active).filter((p) => productSearchCat === "todas" || p.category === productSearchCat).filter((p) => !productSearch || productSearch.length < 2 || p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && <li className="noResults">Sin resultados</li>}
                  </ul>
                ) : (
                  <p className="subtle pickerHint">Escribe al menos 2 letras o selecciona una categoria</p>
                )}
              </div>
              {manualOrderForm.items.length > 0 && (
                <ul className="manualOrderItems">
                  {manualOrderForm.items.map((item) => (
                    <li key={item.productId}>
                      <span>{item.quantity}x {item.name} — ${(item.price * item.quantity).toFixed(2)}</span>
                      <button type="button" className="ghost" onClick={() => removeManualOrderItem(item.productId)}>x</button>
                    </li>
                  ))}
                  <li className="manualOrderTotal"><strong>Total: ${manualOrderForm.items.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)}</strong></li>
                </ul>
              )}
              <div className="actions">
                <button type="submit" disabled={manualOrderSaving || manualOrderForm.items.length === 0}>{manualOrderSaving ? "Creando..." : "Crear pedido"}</button>
                <button type="button" className="ghost" onClick={() => { setFormModal(""); setManualOrderForm({ nombre: "", email: "", telefono: "", items: [] }); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentModal !== null && (
        <div className="modalOverlay" onClick={() => setPaymentModal(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmar pago — Pedido #{paymentModal}</h2>
            <form onSubmit={handlePaymentSubmit} className="categoryForm">
              <label htmlFor="pm-metodo">Metodo de pago</label>
              <select
                id="pm-metodo"
                value={paymentForm.metodoPago}
                onChange={(e) => setPaymentForm((p) => ({ ...p, metodoPago: e.target.value }))}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Transferencia BCP">Transferencia BCP</option>
                <option value="YAPE">YAPE</option>
                <option value="Transferencia BN">Transferencia BN</option>
                <option value="PLIN">PLIN</option>
                <option value="BBVA">BBVA</option>
                <option value="Interbank">Interbank</option>
              </select>

              <label htmlFor="pm-numero">Numero de comprobante</label>
              <input
                id="pm-numero"
                type="text"
                value={paymentForm.numeroComprobante}
                onChange={(e) => setPaymentForm((p) => ({ ...p, numeroComprobante: e.target.value }))}
                required
              />

              <label htmlFor="pm-comprobante">Comprobante de pago (imagen)</label>
              <input
                id="pm-comprobante"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPaymentForm((p) => ({ ...p, comprobante: e.target.files[0] || null }))}
                required
              />

              <label htmlFor="pm-direccion">Direccion de envio</label>
              <textarea
                id="pm-direccion"
                rows={3}
                value={paymentForm.direccionEnvio}
                onChange={(e) => setPaymentForm((p) => ({ ...p, direccionEnvio: e.target.value }))}
                required
              />

              <div className="actions">
                <button type="submit" disabled={paymentSaving}>
                  {paymentSaving ? "Confirmando..." : "Confirmar pago"}
                </button>
                <button type="button" className="ghost" onClick={() => setPaymentModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {shippingModal !== null && (
        <div className="modalOverlay" onClick={() => setShippingModal(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Marcar enviado — Pedido #{shippingModal}</h2>
            <form onSubmit={handleShippingSubmit} className="categoryForm">
              {listError && <p className="error">{listError}</p>}
              <label htmlFor="sm-courier">Courier</label>
              <input
                id="sm-courier"
                type="text"
                value={shippingForm.courierEnvio}
                onChange={(e) => setShippingForm((p) => ({ ...p, courierEnvio: e.target.value }))}
                required
              />

              <label htmlFor="sm-guia">Numero de guia</label>
              <input
                id="sm-guia"
                type="text"
                value={shippingForm.numeroGuia}
                onChange={(e) => setShippingForm((p) => ({ ...p, numeroGuia: e.target.value }))}
                required
              />

              <div className="actions">
                <button type="submit" disabled={shippingSaving}>
                  {shippingSaving ? "Guardando..." : "Marcar enviado"}
                </button>
                <button type="button" className="ghost" onClick={() => setShippingModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
