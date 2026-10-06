-- CreateTable
CREATE TABLE "pedido_etapas_taller" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "etapaNombre" TEXT NOT NULL,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_etapas_taller_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedido_etapas_taller" ADD CONSTRAINT "pedido_etapas_taller_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_etapas_taller" ADD CONSTRAINT "pedido_etapas_taller_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

