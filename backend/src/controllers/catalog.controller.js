const prisma = require("../utils/prisma");

function makeCatalogCrud(delegate, { entityName, extraFields = [] } = {}) {
  function pickExtra(body) {
    const data = {};
    for (const field of extraFields) {
      if (body[field.name] !== undefined) {
        data[field.name] = field.type === "boolean" ? Boolean(body[field.name]) : body[field.name];
      }
    }
    return data;
  }

  async function list(req, res) {
    const items = await delegate.findMany({ orderBy: { name: "asc" } });
    return res.json({ items });
  }

  async function create(req, res) {
    const { name, code, active } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "name y code son obligatorios" });
    }

    const item = await delegate.create({
      data: {
        name: String(name).trim(),
        code: String(code).trim().toUpperCase(),
        active: active === undefined ? true : Boolean(active),
        ...pickExtra(req.body),
      },
    });

    return res.status(201).json({ item });
  }

  async function update(req, res) {
    const { id } = req.params;
    const { name, code, active } = req.body;

    const existing = await delegate.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ message: `${entityName} no encontrado` });
    }

    const item = await delegate.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(code !== undefined ? { code: String(code).trim().toUpperCase() } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
        ...pickExtra(req.body),
      },
    });

    return res.json({ item });
  }

  async function remove(req, res) {
    const { id } = req.params;

    const existing = await delegate.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ message: `${entityName} no encontrado` });
    }

    await delegate.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  }

  return { list, create, update, remove };
}

const tiposPieza = makeCatalogCrud(prisma.tipoPieza, { entityName: "Tipo de pieza" });
const materiales = makeCatalogCrud(prisma.material, {
  entityName: "Material",
  extraFields: [{ name: "requiereQuilate", type: "boolean" }],
});
const gemas = makeCatalogCrud(prisma.gema, { entityName: "Gema" });
const origenesGema = makeCatalogCrud(prisma.origenGema, { entityName: "Origen de gema" });

async function findProductBySku(req, res) {
  const { sku } = req.params;

  const product = await prisma.producto.findUnique({ where: { sku } });
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  return res.json({ product });
}

module.exports = {
  listTiposPieza: tiposPieza.list,
  createTipoPieza: tiposPieza.create,
  updateTipoPieza: tiposPieza.update,
  deleteTipoPieza: tiposPieza.remove,

  listMateriales: materiales.list,
  createMaterial: materiales.create,
  updateMaterial: materiales.update,
  deleteMaterial: materiales.remove,

  listGemas: gemas.list,
  createGema: gemas.create,
  updateGema: gemas.update,
  deleteGema: gemas.remove,

  listOrigenesGema: origenesGema.list,
  createOrigenGema: origenesGema.create,
  updateOrigenGema: origenesGema.update,
  deleteOrigenGema: origenesGema.remove,

  findProductBySku,
};
