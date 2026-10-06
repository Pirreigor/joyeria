-- AlterEnum
ALTER TYPE "EstadoPedido" ADD VALUE 'EN_TALLER';

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "etapaTallerId" INTEGER,
ADD COLUMN     "tallerEnviadoAt" TIMESTAMP(3),
ADD COLUMN     "tallerId" INTEGER;

-- CreateTable
CREATE TABLE "talleres" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talleres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas_taller" (
    "id" SERIAL NOT NULL,
    "tallerId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "etapas_taller_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_etapaTallerId_fkey" FOREIGN KEY ("etapaTallerId") REFERENCES "etapas_taller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas_taller" ADD CONSTRAINT "etapas_taller_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

