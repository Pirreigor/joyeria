const prisma = require("../utils/prisma");

const ESTADOS_DEL_TALLER = ["EN_TALLER", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO"];

async function requireTallerUser(req, res, next) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: {
      taller: { select: { id: true, nombre: true, etapas: { orderBy: { orden: "asc" }, select: { id: true, nombre: true } } } },
    },
  });
  if (!usuario?.taller) {
    return res.status(403).json({ message: "Tu usuario no esta asignado a un taller" });
  }
  req.taller = usuario.taller;
  req.tallerId = usuario.taller.id;
  return next();
}

async function getPedidoDelTaller(pedidoId, tallerId) {
  const pedido = await prisma.pedido.findUnique({ where: { id: Number(pedidoId) } });
  if (!pedido || pedido.tallerId !== tallerId) return null;
  return pedido;
}

async function listPedidosTaller(req, res) {
  const pedidos = await prisma.pedido.findMany({
    where: { tallerId: req.taller.id, estado: { in: ESTADOS_DEL_TALLER } },
    orderBy: { tallerEnviadoAt: "desc" },
  });
  const ids = pedidos.map((p) => p.id);

  const [items, historiales] = await Promise.all([
    prisma.itemPedido.findMany({ where: { pedidoId: { in: ids } }, include: { producto: { select: { name: true } } } }),
    prisma.pedidoEtapaTaller.findMany({
      where: { pedidoId: { in: ids } },
      orderBy: { createdAt: "asc" },
      include: { usuario: { select: { name: true } } },
    }),
  ]);

  const itemsPorPedido = new Map();
  for (const item of items) {
    itemsPorPedido.set(item.pedidoId, [...(itemsPorPedido.get(item.pedidoId) || []), item]);
  }
  const historialPorPedido = new Map();
  for (const h of historiales) {
    historialPorPedido.set(h.pedidoId, [...(historialPorPedido.get(h.pedidoId) || []), h]);
  }
  const etapaPorId = new Map(req.taller.etapas.map((e) => [e.id, e]));

  return res.json({
    taller: req.taller,
    pedidos: pedidos.map((p) => ({
      id: p.id,
      estado: p.estado,
      clienteNombre: p.clienteNombre,
      tallerEnviadoAt: p.tallerEnviadoAt,
      etapaTallerId: p.etapaTallerId,
      etapaTaller: etapaPorId.get(p.etapaTallerId) || null,
      items: (itemsPorPedido.get(p.id) || []).map((i) => ({
        id: i.id,
        quantity: i.quantity,
        descripcion: i.producto?.name || i.customNombre || `Producto #${i.productoId}`,
      })),
      historial: (historialPorPedido.get(p.id) || []).map((h) => ({
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

  const etapa = req.taller.etapas.find((e) => e.id === Number(etapaTallerId));
  if (!etapa) {
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
