-- CreateTable
CREATE TABLE "pedido_nota_cambios" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_nota_cambios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedido_nota_cambios" ADD CONSTRAINT "pedido_nota_cambios_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_nota_cambios" ADD CONSTRAINT "pedido_nota_cambios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

