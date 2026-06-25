const prisma = require("../utils/prisma");
const { hashPassword } = require("../utils/hash");

const ROLES_VALIDOS = ["ADMINISTRADOR", "CLIENTE"];

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function listCategories(req, res) {
  const categories = await prisma.categoria.findMany({
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });

  return res.json({ categories });
}

async function createCategory(req, res) {
  const { name, slug, description, bannerImageUrl, active, showInMenu, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name es obligatorio" });
  }

  const finalSlug = slugify(slug || name);
  if (!finalSlug) {
    return res.status(400).json({ message: "slug invalido" });
  }

  if (parentId !== undefined && parentId !== null) {
    const parentExists = await prisma.categoria.findUnique({ where: { id: Number(parentId) } });
    if (!parentExists) {
      return res.status(400).json({ message: "Categoria padre no encontrada" });
    }
  }

  const category = await prisma.categoria.create({
    data: {
      name: String(name).trim(),
      slug: finalSlug,
      description: description || null,
      bannerImageUrl: bannerImageUrl || null,
      active: active === undefined ? true : Boolean(active),
      showInMenu: showInMenu === undefined ? true : Boolean(showInMenu),
      parentId: parentId ? Number(parentId) : null,
    },
    include: { children: true },
  });

  return res.status(201).json({ category });
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, slug, description, bannerImageUrl, active, showInMenu, parentId } = req.body;

  const existing = await prisma.categoria.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Categoria no encontrada" });
  }

  const finalSlug = slug !== undefined ? slugify(slug) : undefined;
  if (slug !== undefined && !finalSlug) {
    return res.status(400).json({ message: "slug invalido" });
  }

  if (parentId !== undefined && parentId !== null) {
    if (Number(parentId) === Number(id)) {
      return res.status(400).json({ message: "Una categoria no puede ser su propia padre" });
    }
    const parentExists = await prisma.categoria.findUnique({ where: { id: Number(parentId) } });
    if (!parentExists) {
      return res.status(400).json({ message: "Categoria padre no encontrada" });
    }
  }

  const category = await prisma.categoria.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(slug !== undefined ? { slug: finalSlug } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(bannerImageUrl !== undefined ? { bannerImageUrl } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(showInMenu !== undefined ? { showInMenu: Boolean(showInMenu) } : {}),
      ...(parentId !== undefined ? { parentId: parentId ? Number(parentId) : null } : {}),
    },
    include: { children: true },
  });

  return res.json({ category });
}

async function deleteCategory(req, res) {
  const { id } = req.params;

  const existing = await prisma.categoria.findUnique({
    where: { id: Number(id) },
    include: { children: true },
  });
  if (!existing) {
    return res.status(404).json({ message: "Categoria no encontrada" });
  }

  if (existing.children.length > 0) {
    return res.status(409).json({
      message: "No se puede eliminar una categoria que tiene subcategorias",
    });
  }

  const productsUsingCategory = await prisma.producto.count({
    where: { category: { equals: existing.name } },
  });

  if (productsUsingCategory > 0) {
    return res.status(409).json({
      message: "No se puede eliminar una categoria con productos asociados",
    });
  }

  await prisma.categoria.delete({ where: { id: Number(id) } });

  return res.status(204).send();
}

async function getStoreSettings(req, res) {
  let settings = await prisma.configTienda.findUnique({ where: { id: 1 } });

  if (!settings) {
    settings = await prisma.configTienda.create({
      data: { id: 1, brandName: "Don Joyero" },
    });
  }

  return res.json({ settings });
}

async function updateStoreSettings(req, res) {
  const { brandName, logoUrl, promoVideoUrl, promoVideoTitle } = req.body;

  if (brandName !== undefined && !String(brandName).trim()) {
    return res.status(400).json({ message: "brandName no puede estar vacio" });
  }

  const settings = await prisma.configTienda.upsert({
    where: { id: 1 },
    update: {
      ...(brandName !== undefined ? { brandName: String(brandName).trim() } : {}),
      ...(logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
      ...(promoVideoUrl !== undefined ? { promoVideoUrl: promoVideoUrl || null } : {}),
      ...(promoVideoTitle !== undefined ? { promoVideoTitle: promoVideoTitle || null } : {}),
    },
    create: {
      id: 1,
      brandName: String(brandName || "Don Joyero").trim(),
      logoUrl: logoUrl || null,
      promoVideoUrl: promoVideoUrl || null,
      promoVideoTitle: promoVideoTitle || null,
    },
  });

  return res.json({ settings });
}

async function listSlides(req, res) {
  const slides = await prisma.slide.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return res.json({ slides });
}

async function createSlide(req, res) {
  const { title, subtitle, imageUrl, ctaLabel, ctaUrl, displayOrder, active } = req.body;

  if (!title || !imageUrl || displayOrder === undefined) {
    return res.status(400).json({ message: "title, imageUrl y displayOrder son obligatorios" });
  }

  const slide = await prisma.slide.create({
    data: {
      title: String(title).trim(),
      subtitle: subtitle || null,
      imageUrl: String(imageUrl).trim(),
      ctaLabel: ctaLabel || null,
      ctaUrl: ctaUrl || null,
      displayOrder: Number(displayOrder),
      active: active === undefined ? true : Boolean(active),
    },
  });

  return res.status(201).json({ slide });
}

async function updateSlide(req, res) {
  const { id } = req.params;
  const { title, subtitle, imageUrl, ctaLabel, ctaUrl, displayOrder, active } = req.body;

  const existing = await prisma.slide.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Slide no encontrado" });
  }

  const newOrder = displayOrder !== undefined ? Number(displayOrder) : undefined;

  const slide = await prisma.$transaction(async (tx) => {
    if (newOrder !== undefined && newOrder !== existing.displayOrder) {
      const conflict = await tx.slide.findUnique({ where: { displayOrder: newOrder } });
      if (conflict) {
        await tx.slide.update({
          where: { id: conflict.id },
          data: { displayOrder: existing.displayOrder },
        });
      }
    }

    return tx.slide.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(imageUrl !== undefined ? { imageUrl: String(imageUrl).trim() } : {}),
        ...(ctaLabel !== undefined ? { ctaLabel } : {}),
        ...(ctaUrl !== undefined ? { ctaUrl } : {}),
        ...(newOrder !== undefined ? { displayOrder: newOrder } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
    });
  });

  return res.json({ slide });
}

async function deleteSlide(req, res) {
  const { id } = req.params;

  const existing = await prisma.slide.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Slide no encontrado" });
  }

  await prisma.slide.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

async function listFlyers(req, res) {
  const flyers = await prisma.flyer.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return res.json({ flyers });
}

async function createFlyer(req, res) {
  const { title, subtitle, imageUrl, linkUrl, displayOrder, active } = req.body;

  if (!title || !imageUrl || displayOrder === undefined) {
    return res.status(400).json({ message: "title, imageUrl y displayOrder son obligatorios" });
  }

  const flyer = await prisma.flyer.create({
    data: {
      title: String(title).trim(),
      subtitle: subtitle || null,
      imageUrl: String(imageUrl).trim(),
      linkUrl: linkUrl || null,
      displayOrder: Number(displayOrder),
      active: active === undefined ? true : Boolean(active),
    },
  });

  return res.status(201).json({ flyer });
}

async function updateFlyer(req, res) {
  const { id } = req.params;
  const { title, subtitle, imageUrl, linkUrl, displayOrder, active } = req.body;

  const existing = await prisma.flyer.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Flyer no encontrado" });
  }

  const newOrder = displayOrder !== undefined ? Number(displayOrder) : undefined;

  const flyer = await prisma.$transaction(async (tx) => {
    if (newOrder !== undefined && newOrder !== existing.displayOrder) {
      const conflict = await tx.flyer.findUnique({ where: { displayOrder: newOrder } });
      if (conflict) {
        await tx.flyer.update({
          where: { id: conflict.id },
          data: { displayOrder: existing.displayOrder },
        });
      }
    }

    return tx.flyer.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(imageUrl !== undefined ? { imageUrl: String(imageUrl).trim() } : {}),
        ...(linkUrl !== undefined ? { linkUrl } : {}),
        ...(newOrder !== undefined ? { displayOrder: newOrder } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
    });
  });

  return res.json({ flyer });
}

async function deleteFlyer(req, res) {
  const { id } = req.params;

  const existing = await prisma.flyer.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Flyer no encontrado" });
  }

  await prisma.flyer.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

async function createProduct(req, res) {
  const { name, slug, description, price, stock, imageUrl, imagenes, category, recommended, active, materiales, dimensiones, cuidados, grabado, videoUrl } = req.body;

  if (!name || !slug || price === undefined || !imageUrl) {
    return res.status(400).json({ message: "name, slug, price e imageUrl son obligatorios" });
  }

  if (category) {
    const categoryExists = await prisma.categoria.findFirst({
      where: {
        OR: [{ name: String(category).trim() }, { slug: slugify(category) }],
      },
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "La categoria no existe" });
    }
  }

  const product = await prisma.producto.create({
    data: {
      name,
      slug,
      description: description || "",
      price: Number(price),
      stock: Number(stock || 0),
      imageUrl: String(imageUrl).trim(),
      imagenes: Array.isArray(imagenes) ? imagenes.filter((u) => typeof u === "string" && u.trim()) : [],
      category: category || null,
      recommended: Boolean(recommended),
      active: active === undefined ? true : Boolean(active),
      materiales: materiales || null,
      dimensiones: dimensiones || null,
      cuidados: cuidados || null,
      grabado: Boolean(grabado),
      videoUrl: videoUrl || null,
    },
  });

  return res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, slug, description, price, stock, imageUrl, imagenes, category, recommended, active, materiales, dimensiones, cuidados, grabado, videoUrl } = req.body;

  const existing = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  if (category !== undefined && category !== null && String(category).trim() !== "") {
    const categoryExists = await prisma.categoria.findFirst({
      where: {
        OR: [{ name: String(category).trim() }, { slug: slugify(category) }],
      },
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "La categoria no existe" });
    }
  }

  const product = await prisma.producto.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
      ...(imageUrl !== undefined ? { imageUrl: String(imageUrl).trim() } : {}),
      ...(imagenes !== undefined ? { imagenes: Array.isArray(imagenes) ? imagenes.filter((u) => typeof u === "string" && u.trim()) : [] } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(recommended !== undefined ? { recommended: Boolean(recommended) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(materiales !== undefined ? { materiales: materiales || null } : {}),
      ...(dimensiones !== undefined ? { dimensiones: dimensiones || null } : {}),
      ...(cuidados !== undefined ? { cuidados: cuidados || null } : {}),
      ...(grabado !== undefined ? { grabado: Boolean(grabado) } : {}),
      ...(videoUrl !== undefined ? { videoUrl: videoUrl || null } : {}),
    },
  });

  return res.json({ product });
}

async function listProducts(req, res) {
  const products = await prisma.producto.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.json({ products });
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  const existing = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  const product = await prisma.producto.update({
    where: { id: Number(id) },
    data: { active: false },
  });

  return res.json({ product });
}

async function getDashboard(req, res) {
  const [usersCount, productsCount, categoriesCount, ordersCount, recentOrders, recentUsers] = await Promise.all([
    prisma.usuario.count(),
    prisma.producto.count({ where: { active: true } }),
    prisma.categoria.count({ where: { active: true } }),
    prisma.pedido.count(),
    prisma.pedido.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        usuario: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.usuario.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        rol: true,
        createdAt: true,
      },
    }),
  ]);

  return res.json({
    stats: {
      users: usersCount,
      products: productsCount,
      categories: categoriesCount,
      orders: ordersCount,
    },
    recentOrders,
    recentUsers,
  });
}

async function listUsers(req, res) {
  const users = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      permisos: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({ users });
}

async function createUser(req, res) {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email y password son obligatorios" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = role ? String(role).trim().toUpperCase() : "CLIENTE";

  if (!ROLES_VALIDOS.includes(normalizedRole)) {
    return res.status(400).json({ message: "Rol invalido" });
  }

  const existing = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ message: "El email ya esta en uso" });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.usuario.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      rol: normalizedRole,
      permisos: Array.isArray(permissions) ? permissions.filter((p) => typeof p === "string") : [],
    },
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      permisos: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(201).json({ user });
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, password, role, permissions } = req.body;

  const existing = await prisma.usuario.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const data = {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ message: "name no puede estar vacio" });
    }
    data.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: "email no puede estar vacio" });
    }

    const usedByOther = await prisma.usuario.findFirst({
      where: { email: normalizedEmail, id: { not: Number(id) } },
    });

    if (usedByOther) {
      return res.status(409).json({ message: "El email ya esta en uso" });
    }

    data.email = normalizedEmail;
  }

  if (role !== undefined) {
    const normalizedRole = String(role).trim().toUpperCase();
    if (!ROLES_VALIDOS.includes(normalizedRole)) {
      return res.status(400).json({ message: "Rol invalido" });
    }
    data.rol = normalizedRole;
  }

  if (password !== undefined && String(password).trim()) {
    data.passwordHash = await hashPassword(String(password));
  }

  if (permissions !== undefined) {
    data.permisos = Array.isArray(permissions) ? permissions.filter((p) => typeof p === "string") : [];
  }

  const user = await prisma.usuario.update({
    where: { id: Number(id) },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      permisos: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({ user });
}

async function deleteUser(req, res) {
  const { id } = req.params;

  if (req.user?.id === Number(id)) {
    return res.status(400).json({ message: "No puedes eliminar tu propio usuario" });
  }

  const existing = await prisma.usuario.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  await prisma.usuario.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

async function listOrders(req, res) {
  const orders = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usuario: {
        select: { id: true, name: true, email: true },
      },
      items: {
        include: { producto: true },
      },
    },
  });

  return res.json({ orders });
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const ESTADOS_VALIDOS = ["PREPARAR", "NUEVO", "PAGADO", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO", "CANCELADO"];
  if (!ESTADOS_VALIDOS.includes(status)) {
    return res.status(400).json({ message: "Estado invalido" });
  }

  if (status === "PAGADO") {
    return res.status(400).json({ message: "Para marcar como PAGADO use el endpoint de confirmacion de pago" });
  }

  const existing = await prisma.pedido.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }

  const order = await prisma.pedido.update({
    where: { id: Number(id) },
    data: { estado: status },
  });

  return res.json({ order });
}

async function confirmPayment(req, res) {
  const { id } = req.params;
  const { metodoPago, numeroComprobante, direccionEnvio } = req.body;

  if (!metodoPago || !numeroComprobante || !direccionEnvio) {
    return res.status(400).json({ message: "metodoPago, numeroComprobante y direccionEnvio son obligatorios" });
  }

  const METODOS_VALIDOS = ["Transferencia BCP", "YAPE", "Transferencia BN", "PLIN", "BBVA", "Interbank"];
  if (!METODOS_VALIDOS.includes(metodoPago)) {
    return res.status(400).json({ message: "Metodo de pago invalido" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "El comprobante de pago (imagen) es obligatorio" });
  }

  const existing = await prisma.pedido.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }

  const comprobanteUrl = `/uploads/comprobantes/${req.file.filename}`;

  const order = await prisma.pedido.update({
    where: { id: Number(id) },
    data: {
      estado: "PAGADO",
      metodoPago: String(metodoPago).trim(),
      numeroComprobante: String(numeroComprobante).trim(),
      comprobanteUrl,
      direccionEnvio: String(direccionEnvio).trim(),
    },
  });

  return res.json({ order });
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStoreSettings,
  updateStoreSettings,
  listSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  listFlyers,
  createFlyer,
  updateFlyer,
  deleteFlyer,
  createProduct,
  updateProduct,
  listProducts,
  deleteProduct,
  getDashboard,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listOrders,
  updateOrderStatus,
  confirmPayment,
};
