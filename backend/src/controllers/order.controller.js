const prisma = require("../utils/prisma");

async function createOrder(req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items debe ser un array con al menos un elemento" });
  }

  const normalizedItems = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
  }));

  if (normalizedItems.some((item) => !item.productId || !item.quantity || item.quantity < 1)) {
    return res.status(400).json({ message: "Cada item requiere productId y quantity valido" });
  }

  const order = await prisma.$transaction(async (tx) => {
    let total = 0;
    const orderItemsData = [];

    for (const item of normalizedItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });

      if (!product || !product.active) {
        const error = new Error(`Producto ${item.productId} no disponible`);
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < item.quantity) {
        const error = new Error(`Stock insuficiente para ${product.name}`);
        error.statusCode = 400;
        throw error;
      }

      total += Number(product.price) * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    const createdOrder = await tx.order.create({
      data: {
        userId: req.user.id,
        total,
        status: "NEW",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return createdOrder;
  });

  return res.status(201).json({ order });
}

async function listMyOrders(req, res) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return res.json({ orders });
}

module.exports = {
  createOrder,
  listMyOrders,
};
