-- Renombrar valores del enum Role antes de renombrar el tipo
ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'ADMINISTRADOR';
ALTER TYPE "Role" RENAME VALUE 'CUSTOMER' TO 'CLIENTE';
ALTER TYPE "Role" RENAME TO "Rol";

-- Renombrar valores del enum OrderStatus antes de renombrar el tipo
ALTER TYPE "OrderStatus" RENAME VALUE 'NEW' TO 'NUEVO';
ALTER TYPE "OrderStatus" RENAME VALUE 'PAID' TO 'PAGADO';
ALTER TYPE "OrderStatus" RENAME VALUE 'SHIPPED' TO 'ENVIADO';
ALTER TYPE "OrderStatus" RENAME VALUE 'DELIVERED' TO 'ENTREGADO';
ALTER TYPE "OrderStatus" RENAME VALUE 'CANCELED' TO 'CANCELADO';
ALTER TYPE "OrderStatus" RENAME TO "EstadoPedido";

-- Renombrar columnas en User (antes de renombrar la tabla)
ALTER TABLE "User" RENAME COLUMN "role" TO "rol";
ALTER TABLE "User" RENAME COLUMN "permissions" TO "permisos";

-- Renombrar columnas en Order (antes de renombrar la tabla)
ALTER TABLE "Order" RENAME COLUMN "userId" TO "usuarioId";
ALTER TABLE "Order" RENAME COLUMN "status" TO "estado";

-- Renombrar columnas en OrderItem (antes de renombrar la tabla)
ALTER TABLE "OrderItem" RENAME COLUMN "orderId" TO "pedidoId";
ALTER TABLE "OrderItem" RENAME COLUMN "productId" TO "productoId";

-- Renombrar tablas
ALTER TABLE "User" RENAME TO "usuarios";
ALTER TABLE "Product" RENAME TO "productos";
ALTER TABLE "Category" RENAME TO "categorias";
ALTER TABLE "StoreSetting" RENAME TO "config_tienda";
ALTER TABLE "Slide" RENAME TO "slides";
ALTER TABLE "Flyer" RENAME TO "flyers";
ALTER TABLE "Order" RENAME TO "pedidos";
ALTER TABLE "OrderItem" RENAME TO "items_pedido";
