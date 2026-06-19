-- AlterTable
ALTER TABLE "pedidos"
ADD COLUMN "metodoPago" TEXT,
ADD COLUMN "numeroComprobante" TEXT,
ADD COLUMN "comprobanteUrl" TEXT,
ADD COLUMN "direccionEnvio" TEXT;
