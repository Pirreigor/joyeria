const prisma = require("../utils/prisma");
const { hashPassword } = require("../utils/hash");
const { SUPER_ADMIN_EMAIL } = require("../utils/superAdmin");

const TALLER_INCLUDE = {
  etapas: { orderBy: { orden: "asc" } },
  usuarios: { select: { id: true, name: true, email: true }, orderBy: { name: "asc" } },
};

function normalizeEtapas(etapas) {
  if (!Array.isArray(etapas)) return null;
  const normalized = etapas
    .map((e) => ({ id: e?.id ? Number(e.id) : null, nombre: String(e?.nombre || "").trim() }))
    .filter((e) => e.nombre);
  return normalized;
}

async function listTalleres(req, res) {
  const [talleres, usuariosDisponibles] = await Promise.all([
    prisma.taller.findMany({ orderBy: { nombre: "asc" }, include: TALLER_INCLUDE }),
    prisma.usuario.findMany({
      where: { rol: { not: "CLIENTE" }, tallerId: null, email: { not: SUPER_ADMIN_EMAIL } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, rol: true },
    }),
  ]);
  return res.json({ talleres, usuariosDisponibles });
}

async function createTaller(req, res) {
  const { nombre, etapas } = req.body;
  const etapasNormalizadas = normalizeEtapas(etapas) || [];

  if (!nombre || !String(nombre).trim()) {
    return res.status(400).json({ message: "nombre es obligatorio" });
  }

  const taller = await prisma.taller.create({
    data: {
      nombre: String(nombre).trim(),
      etapas: {
        create: etapasNormalizadas.map((e, idx) => ({ nombre: e.nombre, orden: idx + 1 })),
      },
    },
    include: TALLER_INCLUDE,
  });

  return res.status(201).json({ taller });
}

async function updateTaller(req, res) {
  const { id } = req.params;
  const { nombre, activo, etapas } = req.body;

  const existing = await prisma.taller.findUnique({ where: { id: Number(id) }, include: { etapas: true } });
  if (!existing) {
    return res.status(404).json({ message: "Taller no encontrado" });
  }

  if (nombre !== undefined && !String(nombre).trim()) {
    return res.status(400).json({ message: "nombre no puede estar vacio" });
  }

  const etapasNormalizadas = etapas !== undefined ? normalizeEtapas(etapas) : null;
  if (etapas !== undefined && etapasNormalizadas === null) {
    return res.status(400).json({ message: "etapas debe ser un array" });
  }

  const taller = await prisma.$transaction(async (tx) => {
    await tx.taller.update({
      where: { id: Number(id) },
      data: {
        ...(nombre !== undefined ? { nombre: String(nombre).trim() } : {}),
        ...(activo !== undefined ? { activo: Boolean(activo) } : {}),
      },
    });

    if (etapasNormalizadas) {
      const keepIds = etapasNormalizadas.map((e) => e.id).filter(Boolean);
      await tx.etapaTaller.deleteMany({
        where: { tallerId: Number(id), id: { notIn: keepIds } },
      });

      for (let idx = 0; idx < etapasNormalizadas.length; idx++) {
        const e = etapasNormalizadas[idx];
        const existingEtapa = e.id ? existing.etapas.find((x) => x.id === e.id) : null;
        if (existingEtapa) {
          await tx.etapaTaller.update({ where: { id: existingEtapa.id }, data: { nombre: e.nombre, orden: idx + 1 } });
        } else {
          await tx.etapaTaller.create({ data: { tallerId: Number(id), nombre: e.nombre, orden: idx + 1 } });
        }
      }
    }

    return tx.taller.findUnique({ where: { id: Number(id) }, include: TALLER_INCLUDE });
  });

  return res.json({ taller });
}

async function deleteTaller(req, res) {
  const { id } = req.params;

  const existing = await prisma.taller.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Taller no encontrado" });
  }

  const pedidosActivos = await prisma.pedido.count({ where: { tallerId: Number(id), estado: "EN_TALLER" } });
  if (pedidosActivos > 0) {
    return res.status(409).json({ message: "Este taller tiene pedidos en proceso. Desactivalo en vez de eliminarlo." });
  }

  await prisma.taller.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

async function updateOrderTallerEtapa(req, res) {
  const { id } = req.params;
  const { etapaTallerId } = req.body;

  const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }
  if (pedido.estado !== "EN_TALLER") {
    return res.status(409).json({ message: "El pedido no esta en taller" });
  }

  const etapa = await prisma.etapaTaller.findUnique({ where: { id: Number(etapaTallerId) } });
  if (!etapa || etapa.tallerId !== pedido.tallerId) {
    return res.status(400).json({ message: "La etapa no pertenece al taller de este pedido" });
  }

  const fotos = Array.isArray(req.body.fotos) ? req.body.fotos.map((u) => String(u).trim()).filter(Boolean) : [];

  const order = await prisma.pedido.update({
    where: { id: Number(id) },
    data: {
      etapaTallerId: etapa.id,
      historialTaller: { create: { etapaNombre: etapa.nombre, fotos, usuarioId: req.user.id } },
    },
    include: {
      items: { include: { producto: true } },
      taller: true,
      etapaTaller: true,
      historialTaller: { orderBy: { createdAt: "asc" }, include: { usuario: { select: { name: true } } } },
    },
  });

  return res.json({ order });
}

async function asignarUsuarioTaller(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  const taller = await prisma.taller.findUnique({ where: { id: Number(id) } });
  if (!taller) {
    return res.status(404).json({ message: "Taller no encontrado" });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(userId) } });
  if (!usuario || usuario.rol === "CLIENTE" || usuario.email === SUPER_ADMIN_EMAIL) {
    return res.status(400).json({ message: "Ese usuario no puede asignarse a un taller" });
  }
  if (usuario.tallerId && usuario.tallerId !== taller.id) {
    return res.status(409).json({ message: "Ese usuario ya pertenece a otro taller" });
  }

  const actualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { rol: "TALLER", tallerId: taller.id, permisos: [] },
    select: { id: true, name: true, email: true },
  });

  return res.json({ usuario: actualizado });
}

async function quitarUsuarioTaller(req, res) {
  const { id, userId } = req.params;

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(userId) } });
  if (!usuario || usuario.rol !== "TALLER" || usuario.tallerId !== Number(id)) {
    return res.status(404).json({ message: "Acceso no encontrado en este taller" });
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { rol: "VENDEDOR", tallerId: null, permisos: [] },
  });

  return res.status(204).send();
}

module.exports = {
  asignarUsuarioTaller,
  quitarUsuarioTaller,
  listTalleres,
  createTaller,
  updateTaller,
  deleteTaller,
  updateOrderTallerEtapa,
};
