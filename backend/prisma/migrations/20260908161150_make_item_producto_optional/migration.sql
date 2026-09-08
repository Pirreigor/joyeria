-- DropForeignKey
ALTER TABLE "items_pedido" DROP CONSTRAINT "items_pedido_productoId_fkey";

-- AlterTable
ALTER TABLE "items_pedido" ADD COLUMN     "customNombre" TEXT,
ALTER COLUMN "productoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "items_pedido" ADD CONSTRAINT "items_pedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
