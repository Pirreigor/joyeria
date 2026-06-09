const prisma = require("../utils/prisma");

async function listProducts(req, res) {
  const { q, category, minPrice, maxPrice, recommended, sort } = req.query;

  const where = {
    active: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
    ...(recommended === "true" ? { recommended: true } : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "recommended"
          ? [{ recommended: "desc" }, { createdAt: "desc" }]
          : { createdAt: "desc" };

  const products = await prisma.producto.findMany({
    where,
    orderBy,
  });

  return res.json({ products });
}

async function getProductBySlug(req, res) {
  const { slug } = req.params;

  const product = await prisma.producto.findUnique({ where: { slug } });

  if (!product || !product.active) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  return res.json({ product });
}

module.exports = {
  listProducts,
  getProductBySlug,
};
