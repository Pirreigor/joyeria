-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'TALLER';

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "tallerId" INTEGER;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

