-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "confirmedByUserId" INTEGER,
ADD COLUMN     "dispatchedByUserId" INTEGER;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "createdByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_dispatchedByUserId_fkey" FOREIGN KEY ("dispatchedByUserId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
