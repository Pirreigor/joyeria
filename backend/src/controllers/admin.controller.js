const prisma = require("../utils/prisma");

async function createProduct(req, res) {
  const { name, slug, description, price, stock, imageUrl, category, active } = req.body;

  if (!name || !slug || price === undefined) {
    return res.status(400).json({ message: "name, slug y price son obligatorios" });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || "",
      price: Number(price),
      stock: Number(stock || 0),
      imageUrl: imageUrl || null,
      category: category || null,
      active: active === undefined ? true : Boolean(active),
    },
  });

  return res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, slug, description, price, stock, imageUrl, category, active } = req.body;

  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    },
  });

  return res.json({ product });
}

async function listOrders(req, res) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return res.json({ orders });
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["NEW", "PAID", "SHIPPED", "DELIVERED", "CANCELED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado invalido" });
  }

  const existing = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status },
  });

  return res.json({ order });
}

module.exports = {
  createProduct,
  updateProduct,
  listOrders,
  updateOrderStatus,
};
