const prisma = require("../utils/prisma");

const ESTADOS_DEL_TALLER = ["EN_TALLER", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO"];

async function requireTallerUser(req, res, next) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: { tallerId: true } });
  if (!usuario?.tallerId) {
    return res.status(403).json({ message: "Tu usuario no esta asignado a un taller" });
  }
  req.tallerId = usuario.tallerId;
  return next();
}

async function getPedidoDelTaller(pedidoId, tallerId) {
  const pedido = await prisma.pedido.findUnique({ where: { id: Number(pedidoId) } });
  if (!pedido || pedido.tallerId !== tallerId) return null;
  return pedido;
}

async function listPedidosTaller(req, res) {
  const taller = await prisma.taller.findUnique({
    where: { id: req.tallerId },
    include: { etapas: { orderBy: { orden: "asc" } } },
  });

  const pedidos = await prisma.pedido.findMany({
    where: { tallerId: req.tallerId, estado: { in: ESTADOS_DEL_TALLER } },
    orderBy: { tallerEnviadoAt: "desc" },
    include: {
      etapaTaller: true,
      items: { include: { producto: { select: { name: true } } } },
      historialTaller: { orderBy: { createdAt: "asc" }, include: { usuario: { select: { name: true } } } },
    },
  });

  return res.json({
    taller: { id: taller.id, nombre: taller.nombre, etapas: taller.etapas },
    pedidos: pedidos.map((p) => ({
      id: p.id,
      estado: p.estado,
      clienteNombre: p.clienteNombre,
      tallerEnviadoAt: p.tallerEnviadoAt,
      etapaTallerId: p.etapaTallerId,
      etapaTaller: p.etapaTaller ? { id: p.etapaTaller.id, nombre: p.etapaTaller.nombre } : null,
      items: p.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        descripcion: i.producto?.name || i.customNombre || `Producto #${i.productoId}`,
      })),
      historial: p.historialTaller.map((h) => ({
        id: h.id,
        etapaNombre: h.etapaNombre,
        fotos: h.fotos,
        createdAt: h.createdAt,
        usuario: h.usuario?.name || null,
      })),
      nota: Object.fromEntries(
        Object.entries(p).filter(([k]) => k.startsWith("nota") && k !== "notaFotos" && k !== "notaGuardadaAt")
      ),
      notaFotos: p.notaFotos,
    })),
  });
}

async function cambiarEtapaTaller(req, res) {
  const { etapaTallerId, fotos } = req.body;

  const pedido = await getPedidoDelTaller(req.params.id, req.tallerId);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado en tu taller" });
  }
  if (pedido.estado !== "EN_TALLER") {
    return res.status(409).json({ message: "El pedido no esta en taller" });
  }

  const etapa = await prisma.etapaTaller.findUnique({ where: { id: Number(etapaTallerId) } });
  if (!etapa || etapa.tallerId !== req.tallerId) {
    return res.status(400).json({ message: "La etapa no pertenece a tu taller" });
  }

  const urls = Array.isArray(fotos) ? fotos.map((u) => String(u).trim()).filter(Boolean) : [];

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: {
      etapaTallerId: etapa.id,
      historialTaller: { create: { etapaNombre: etapa.nombre, fotos: urls, usuarioId: req.user.id } },
    },
  });

  return res.json({ ok: true });
}

async function marcarListoTaller(req, res) {
  const pedido = await getPedidoDelTaller(req.params.id, req.tallerId);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado en tu taller" });
  }
  if (pedido.estado !== "EN_TALLER") {
    return res.status(409).json({ message: "El pedido no esta en taller" });
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: {
      estado: "LISTO_PARA_ENVIO",
      historialTaller: { create: { etapaNombre: "Terminado en taller", usuarioId: req.user.id } },
    },
  });

  return res.json({ ok: true });
}

module.exports = {
  requireTallerUser,
  listPedidosTaller,
  cambiarEtapaTaller,
  marcarListoTaller,
};
