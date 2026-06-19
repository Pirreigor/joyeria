-- AlterTable
ALTER TABLE "categorias" RENAME CONSTRAINT "Category_pkey" TO "categorias_pkey";

-- AlterTable
ALTER TABLE "config_tienda" RENAME CONSTRAINT "StoreSetting_pkey" TO "config_tienda_pkey";

-- AlterTable
ALTER TABLE "flyers" RENAME CONSTRAINT "Flyer_pkey" TO "flyers_pkey";

-- AlterTable
ALTER TABLE "items_pedido" RENAME CONSTRAINT "OrderItem_pkey" TO "items_pedido_pkey";

-- AlterTable (rename constraint)
ALTER TABLE "pedidos" RENAME CONSTRAINT "Order_pkey" TO "pedidos_pkey";

-- AlterTable (add columns and modify)
ALTER TABLE "pedidos"
ADD COLUMN     "clienteEmail" TEXT,
ADD COLUMN     "clienteNombre" TEXT,
ADD COLUMN     "clienteTelefono" TEXT,
ALTER COLUMN "usuarioId" DROP NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'PREPARAR';

-- AlterTable (rename constraint)
ALTER TABLE "productos" RENAME CONSTRAINT "Product_pkey" TO "productos_pkey";

-- AlterTable (add column)
ALTER TABLE "productos" ADD COLUMN "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "slides" RENAME CONSTRAINT "Slide_pkey" TO "slides_pkey";

-- AlterTable
ALTER TABLE "usuarios" RENAME CONSTRAINT "User_pkey" TO "usuarios_pkey";

-- RenameForeignKey
ALTER TABLE "items_pedido" RENAME CONSTRAINT "OrderItem_orderId_fkey" TO "items_pedido_pedidoId_fkey";

-- RenameForeignKey
ALTER TABLE "items_pedido" RENAME CONSTRAINT "OrderItem_productId_fkey" TO "items_pedido_productoId_fkey";

-- RenameForeignKey
ALTER TABLE "pedidos" RENAME CONSTRAINT "Order_userId_fkey" TO "pedidos_usuarioId_fkey";

-- RenameIndex
ALTER INDEX "Category_name_key" RENAME TO "categorias_name_key";

-- RenameIndex
ALTER INDEX "Category_slug_key" RENAME TO "categorias_slug_key";

-- RenameIndex
ALTER INDEX "Flyer_displayOrder_key" RENAME TO "flyers_displayOrder_key";

-- RenameIndex
ALTER INDEX "Product_slug_key" RENAME TO "productos_slug_key";

-- RenameIndex
ALTER INDEX "Slide_displayOrder_key" RENAME TO "slides_displayOrder_key";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "usuarios_email_key";
