-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('PEN', 'USD');

-- AlterTable
ALTER TABLE "pedido_pagos" ADD COLUMN     "moneda" "Moneda" NOT NULL DEFAULT 'PEN',
ADD COLUMN     "monto" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "moneda" "Moneda" NOT NULL DEFAULT 'PEN';

