-- CreateEnum
CREATE TYPE "OrigenPedido" AS ENUM ('TIENDA', 'MANUAL', 'LIVE');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "origen" "OrigenPedido" NOT NULL DEFAULT 'TIENDA';

