-- AlterTable
ALTER TABLE "invitaciones_usuarios" ADD COLUMN     "tallerId" INTEGER;

-- AddForeignKey
ALTER TABLE "invitaciones_usuarios" ADD CONSTRAINT "invitaciones_usuarios_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

