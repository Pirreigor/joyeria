function buildBaseCode({ tipoPieza, material, quilates, gema, origenGema, quilatajeGema }) {
  const parts = [tipoPieza.code, material.code];

  if (material.requiereQuilate && quilates) {
    parts.push(String(quilates));
  }

  if (gema) {
    parts.push(gema.code);
    if (origenGema) parts.push(origenGema.code);
    if (quilatajeGema != null) {
      parts.push(String(Math.round(quilatajeGema * 100)).padStart(3, "0"));
    }
  }

  return parts.join("-");
}

async function generateUniqueSku(prisma, baseCode, excludeId) {
  const candidates = await prisma.producto.findMany({
    where: {
      sku: { startsWith: baseCode },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { sku: true },
  });

  const exactPattern = new RegExp(`^${baseCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-\\d+)?$`);
  const taken = new Set(candidates.map((c) => c.sku).filter((sku) => exactPattern.test(sku)));

  if (!taken.has(baseCode)) return baseCode;

  let n = 2;
  while (taken.has(`${baseCode}-${String(n).padStart(2, "0")}`)) n++;
  return `${baseCode}-${String(n).padStart(2, "0")}`;
}

module.exports = {
  buildBaseCode,
  generateUniqueSku,
};
