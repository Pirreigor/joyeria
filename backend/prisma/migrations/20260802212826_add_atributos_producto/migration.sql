-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "gemaId" INTEGER,
ADD COLUMN     "materialId" INTEGER,
ADD COLUMN     "origenGemaId" INTEGER,
ADD COLUMN     "quilatajeGema" DOUBLE PRECISION,
ADD COLUMN     "quilates" INTEGER,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "tipoPiezaId" INTEGER;

-- CreateTable
CREATE TABLE "tipos_pieza" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_pieza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales_catalogo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "requiereQuilate" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiales_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gemas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origenes_gema" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origenes_gema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_pieza_name_key" ON "tipos_pieza"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_pieza_code_key" ON "tipos_pieza"("code");

-- CreateIndex
CREATE UNIQUE INDEX "materiales_catalogo_name_key" ON "materiales_catalogo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "materiales_catalogo_code_key" ON "materiales_catalogo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gemas_name_key" ON "gemas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "gemas_code_key" ON "gemas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "origenes_gema_name_key" ON "origenes_gema"("name");

-- CreateIndex
CREATE UNIQUE INDEX "origenes_gema_code_key" ON "origenes_gema"("code");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tipoPiezaId_fkey" FOREIGN KEY ("tipoPiezaId") REFERENCES "tipos_pieza"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiales_catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_gemaId_fkey" FOREIGN KEY ("gemaId") REFERENCES "gemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_origenGemaId_fkey" FOREIGN KEY ("origenGemaId") REFERENCES "origenes_gema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: catalogos base para armar el SKU
INSERT INTO "tipos_pieza" ("name", "code", "active", "updatedAt") VALUES
  ('Anillo', 'AN', true, CURRENT_TIMESTAMP),
  ('Collar', 'CO', true, CURRENT_TIMESTAMP),
  ('Arete', 'AR', true, CURRENT_TIMESTAMP),
  ('Pulsera', 'PU', true, CURRENT_TIMESTAMP),
  ('Dije', 'DJ', true, CURRENT_TIMESTAMP);

INSERT INTO "materiales_catalogo" ("name", "code", "requiereQuilate", "active", "updatedAt") VALUES
  ('Oro', 'OR', true, true, CURRENT_TIMESTAMP),
  ('Plata', 'PL', false, true, CURRENT_TIMESTAMP),
  ('Platino', 'PT', true, true, CURRENT_TIMESTAMP);

INSERT INTO "gemas" ("name", "code", "active", "updatedAt") VALUES
  ('Diamante', 'D', true, CURRENT_TIMESTAMP),
  ('Esmeralda', 'E', true, CURRENT_TIMESTAMP),
  ('Rubi', 'R', true, CURRENT_TIMESTAMP),
  ('Zafiro', 'Z', true, CURRENT_TIMESTAMP),
  ('Perla', 'P', true, CURRENT_TIMESTAMP);

INSERT INTO "origenes_gema" ("name", "code", "active", "updatedAt") VALUES
  ('Laboratorio', 'L', true, CURRENT_TIMESTAMP),
  ('Natural', 'N', true, CURRENT_TIMESTAMP);
