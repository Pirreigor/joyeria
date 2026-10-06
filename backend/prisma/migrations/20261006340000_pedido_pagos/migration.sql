-- CreateTable
CREATE TABLE "pedido_pagos" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "metodoPago" TEXT,
    "numeroComprobante" TEXT,
    "comprobanteUrl" TEXT,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_pagos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedido_pagos" ADD CONSTRAINT "pedido_pagos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_pagos" ADD CONSTRAINT "pedido_pagos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Copiar el pago actual de cada pedido a la tabla nueva
INSERT INTO "pedido_pagos" ("pedidoId", "metodoPago", "numeroComprobante", "comprobanteUrl", "usuarioId", "createdAt")
SELECT "id", "metodoPago", "numeroComprobante", "comprobanteUrl", "confirmedByUserId", COALESCE("updatedAt", CURRENT_TIMESTAMP)
FROM "pedidos"
WHERE "comprobanteUrl" IS NOT NULL OR "metodoPago" IS NOT NULL;
