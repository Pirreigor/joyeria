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
};
