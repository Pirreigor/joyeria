-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "dedicatoriaToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_dedicatoriaToken_key" ON "pedidos"("dedicatoriaToken");
