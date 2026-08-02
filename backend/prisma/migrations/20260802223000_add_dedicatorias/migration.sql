-- CreateTable
CREATE TABLE "dedicatorias" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "itemPedidoId" INTEGER NOT NULL,
    "para" TEXT,
    "mensaje" TEXT,
    "escrita" BOOLEAN NOT NULL DEFAULT false,
    "writtenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dedicatorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dedicatorias_token_key" ON "dedicatorias"("token");

-- AddForeignKey
ALTER TABLE "dedicatorias" ADD CONSTRAINT "dedicatorias_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "items_pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
