-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "dedicatoriaDe" TEXT,
ADD COLUMN     "dedicatoriaPara" TEXT,
ADD COLUMN     "dedicatoriaMensaje" TEXT,
ADD COLUMN     "dedicatoriaYoutubeUrl" TEXT,
ADD COLUMN     "dedicatoriaEscrita" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dedicatoriaEscritaAt" TIMESTAMP(3);
