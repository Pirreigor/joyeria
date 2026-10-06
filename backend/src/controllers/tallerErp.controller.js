const prisma = require("../utils/prisma");
const { NOTA_PEDIDO_FIELDS, cambiosDeNota } = require("./admin.controller");

const ESTADOS_DEL_TALLER = ["EN_TALLER", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO"];

function esAdminPleno(user) {
  return user?.rol === "ADMINISTRADOR" && (user.permisos || []).length === 0;
}

async function talleresDelUsuario(user) {
  if (esAdminPleno(user)) return null;
  const usuario = await prisma.usuario.findUnique({ where: { id: user.id }, select: { talleres: { select: { id: true } } } });
  return (usuario?.talleres || []).map((t) => t.id);
}

async function pedidoDentroDelAmbito(pedidoId, user) {
  const pedido = await prisma.pedido.findUnique({ where: { id: Number(pedidoId) } });
  if (!pedido || !pedido.tallerId) return null;
  const ambito = await talleresDelUsuario(user);
  if (ambito && !ambito.includes(pedido.tallerId)) return null;
  return pedido;
}

async function listTallerPedidos(req, res) {
  const ambito = await talleresDelUsuario(req.user);
  const talleres = await prisma.taller.findMany({
    where: ambito ? { id: { in: ambito } } : {},
    orderBy: { nombre: "asc" },
    include: { etapas: { orderBy: { orden: "asc" } } },
  });
  const talleresIds = talleres.map((t) => t.id);

  const pedidos = await prisma.pedido.findMany({
    where: { tallerId: { in: talleresIds }, estado: { in: ESTADOS_DEL_TALLER } },
    orderBy: { tallerEnviadoAt: "desc" },
  });
  const ids = pedidos.map((p) => p.id);

  const [items, historiales, cambiosNota] = await Promise.all([
    prisma.itemPedido.findMany({
      where: { pedidoId: { in: ids } },
      include: { producto: { select: { name: true, imageUrl: true } } },
    }),
    prisma.pedidoEtapaTaller.findMany({
      where: { pedidoId: { in: ids } },
      orderBy: { createdAt: "asc" },
      include: { usuario: { select: { name: true } } },
    }),
    prisma.pedidoNotaCambio.findMany({
      where: { pedidoId: { in: ids } },
      orderBy: { createdAt: "asc" },
      include: { usuario: { select: { name: true } } },
    }),
  ]);

  const agrupar = (lista, key) => {
    const mapa = new Map();
    for (const x of lista) mapa.set(x[key], [...(mapa.get(x[key]) || []), x]);
    return mapa;
  };
  const itemsPorPedido = agrupar(items, "pedidoId");
  const historialPorPedido = agrupar(historiales, "pedidoId");
  const cambiosPorPedido = agrupar(cambiosNota, "pedidoId");
  const tallerPorId = new Map(talleres.map((t) => [t.id, t]));

  return res.json({
    talleres: talleres.map((t) => ({ id: t.id, nombre: t.nombre, activo: t.activo, etapas: t.etapas })),
    pedidos: pedidos.map((p) => {
      const taller = tallerPorId.get(p.tallerId);
      const etapa = taller?.etapas.find((e) => e.id === p.etapaTallerId) || null;
      return {
        id: p.id,
        estado: p.estado,
        clienteNombre: p.clienteNombre,
        createdAt: p.createdAt,
        tallerEnviadoAt: p.tallerEnviadoAt,
        tallerId: p.tallerId,
        taller: taller ? { id: taller.id, nombre: taller.nombre } : null,
        etapaTallerId: p.etapaTallerId,
        etapaTaller: etapa ? { id: etapa.id, nombre: etapa.nombre } : null,
        items: (itemsPorPedido.get(p.id) || []).map((i) => ({
          id: i.id,
          quantity: i.quantity,
          productoId: i.productoId,
          customNombre: i.customNombre,
          customFotoUrl: i.customFotoUrl,
          producto: i.producto ? { name: i.producto.name, imageUrl: i.producto.imageUrl } : null,
        })),
        historialTaller: (historialPorPedido.get(p.id) || []).map((h) => ({
          id: h.id,
          etapaNombre: h.etapaNombre,
          fotos: h.fotos,
          createdAt: h.createdAt,
          usuario: h.usuario ? { name: h.usuario.name } : null,
        })),
        notaFotos: p.notaFotos,
        notaCambios: (cambiosPorPedido.get(p.id) || []).map((c) => ({
          id: c.id,
          campo: c.campo,
          valorAnterior: c.valorAnterior,
          valorNuevo: c.valorNuevo,
          createdAt: c.createdAt,
          usuario: c.usuario ? { name: c.usuario.name } : null,
        })),
        ...Object.fromEntries(Object.entries(p).filter(([k]) => k.startsWith("nota") && k !== "notaFotos" && k !== "notaGuardadaAt")),
      };
    }),
  });
}

async function cambiarEtapaTaller(req, res) {
  const { etapaTallerId, fotos } = req.body;

  const pedido = await pedidoDentroDelAmbito(req.params.id, req.user);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado en tus talleres" });
  }
  if (pedido.estado !== "EN_TALLER") {
    return res.status(409).json({ message: "El pedido no esta en taller" });
  }

  const etapa = await prisma.etapaTaller.findUnique({ where: { id: Number(etapaTallerId) } });
  if (!etapa || etapa.tallerId !== pedido.tallerId) {
    return res.status(400).json({ message: "La etapa no pertenece al taller de este pedido" });
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
  const pedido = await pedidoDentroDelAmbito(req.params.id, req.user);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado en tus talleres" });
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

async function actualizarNotaTaller(req, res) {
  const pedido = await pedidoDentroDelAmbito(req.params.id, req.user);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado en tus talleres" });
  }
  if (pedido.estado !== "EN_TALLER") {
    return res.status(409).json({ message: "La nota solo se puede editar mientras el pedido esta en taller" });
  }

  const data = { notaGuardadaAt: new Date() };
  for (const field of NOTA_PEDIDO_FIELDS) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field] === null ? null : String(req.body[field]).trim();
    }
  }
  if (Array.isArray(req.body.notaFotos)) {
    data.notaFotos = req.body.notaFotos.map((url) => String(url).trim()).filter(Boolean);
  }

  const cambios = cambiosDeNota(pedido, data);
  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { ...data, notaCambios: { create: cambios.map((c) => ({ ...c, usuarioId: req.user.id })) } },
  });
  return res.json({ ok: true });
}

module.exports = { listTallerPedidos, cambiarEtapaTaller, marcarListoTaller, actualizarNotaTaller };
