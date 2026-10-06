-- CreateTable
CREATE TABLE "_UsuarioTalleres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UsuarioTalleres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UsuarioTalleres_B_index" ON "_UsuarioTalleres"("B");

-- AddForeignKey
ALTER TABLE "_UsuarioTalleres" ADD CONSTRAINT "_UsuarioTalleres_A_fkey" FOREIGN KEY ("A") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioTalleres" ADD CONSTRAINT "_UsuarioTalleres_B_fkey" FOREIGN KEY ("B") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copiar las asignaciones actuales (un taller por usuario) a la tabla nueva
INSERT INTO "_UsuarioTalleres" ("A", "B")
SELECT "tallerId", "id" FROM "usuarios" WHERE "tallerId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "invitaciones_usuarios" DROP CONSTRAINT "invitaciones_usuarios_tallerId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_tallerId_fkey";

-- AlterTable
ALTER TABLE "invitaciones_usuarios" DROP COLUMN "tallerId";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "tallerId";
