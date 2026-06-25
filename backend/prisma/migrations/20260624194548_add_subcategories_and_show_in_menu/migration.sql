-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "showInMenu" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
