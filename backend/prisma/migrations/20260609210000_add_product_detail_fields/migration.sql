-- Campos adicionales de detalle para productos
ALTER TABLE "productos" ADD COLUMN "imagenes"    TEXT[]   NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "productos" ADD COLUMN "materiales"  TEXT;
ALTER TABLE "productos" ADD COLUMN "dimensiones" TEXT;
ALTER TABLE "productos" ADD COLUMN "cuidados"    TEXT;
ALTER TABLE "productos" ADD COLUMN "grabado"     BOOLEAN  NOT NULL DEFAULT false;
