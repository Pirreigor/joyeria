const prisma = require("../utils/prisma");

async function getDedicatoria(req, res) {
  const { token } = req.params;

  const dedicatoria = await prisma.dedicatoria.findUnique({
    where: { token },
    include: {
      itemPedido: {
        include: {
          producto: { select: { name: true, imageUrl: true } },
        },
      },
    },
  });

  if (!dedicatoria) {
    return res.status(404).json({ message: "Dedicatoria no encontrada" });
  }

  return res.json({
    dedicatoria: {
      producto: dedicatoria.itemPedido.producto,
      para: dedicatoria.para,
      mensaje: dedicatoria.mensaje,
      escrita: dedicatoria.escrita,
    },
  });
}

const ESTADOS_CON_DEDICATORIA = ["PAGADO", "LISTO_PARA_ENVIO", "ENVIADO", "ENTREGADO"];

async function buscarPedido(req, res) {
  const { pedidoId } = req.params;
  const { contacto } = req.query;

  if (!contacto || !String(contacto).trim()) {
    return res.status(400).json({ message: "Ingresa el email o telefono usado en la compra" });
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(pedidoId) },
    include: { usuario: { select: { email: true } } },
  });

  const contactoNorm = String(contacto).trim().toLowerCase();
  const candidatos = pedido
    ? [pedido.clienteEmail, pedido.clienteTelefono, pedido.usuario?.email].filter(Boolean).map((v) => v.trim().toLowerCase())
    : [];

  if (!pedido || !candidatos.includes(contactoNorm)) {
    return res.status(404).json({ message: "No encontramos un pedido con esos datos" });
  }

  if (!ESTADOS_CON_DEDICATORIA.includes(pedido.estado)) {
    return res.status(409).json({ message: "Tu pedido todavia no fue confirmado como pagado" });
  }

  const items = await prisma.itemPedido.findMany({
    where: { pedidoId: pedido.id },
    include: {
      producto: { select: { name: true, imageUrl: true } },
      dedicatorias: { orderBy: { id: "asc" } },
    },
  });

  const dedicatorias = items.flatMap((item) =>
    item.dedicatorias.map((d, index) => ({
      token: d.token,
      productoNombre: item.producto.name,
      productoImageUrl: item.producto.imageUrl,
      unidad: item.quantity > 1 ? `${index + 1}/${item.quantity}` : null,
      escrita: d.escrita,
      para: d.para,
      mensaje: d.mensaje,
    }))
  );

  return res.json({ pedidoId: pedido.id, dedicatorias });
}

async function submitDedicatoria(req, res) {
  const { token } = req.params;
  const { para, mensaje } = req.body;

  if (!para || !mensaje) {
    return res.status(400).json({ message: "para y mensaje son obligatorios" });
  }

  const dedicatoria = await prisma.dedicatoria.findUnique({ where: { token } });
  if (!dedicatoria) {
    return res.status(404).json({ message: "Dedicatoria no encontrada" });
  }

  if (dedicatoria.escrita) {
    return res.status(409).json({ message: "Esta dedicatoria ya fue escrita" });
  }

  const updated = await prisma.dedicatoria.update({
    where: { token },
    data: {
      para: String(para).trim(),
      mensaje: String(mensaje).trim(),
      escrita: true,
      writtenAt: new Date(),
    },
    include: {
      itemPedido: {
        include: {
          producto: { select: { name: true, imageUrl: true } },
        },
      },
    },
  });

  return res.json({
    dedicatoria: {
      producto: updated.itemPedido.producto,
      para: updated.para,
      mensaje: updated.mensaje,
      escrita: updated.escrita,
    },
  });
}

module.exports = {
  getDedicatoria,
  submitDedicatoria,
  buscarPedido,
};
