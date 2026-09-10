-- AlterTable: items_pedido gets its own per-item custom photo
ALTER TABLE "items_pedido" ADD COLUMN "customFotoUrl" TEXT;

-- AlterTable: pedidos moves from a single notaFotoUrl to a notaFotos array
ALTER TABLE "pedidos" ADD COLUMN "notaFotos" TEXT[] NOT NULL DEFAULT '{}';

-- DataMigration: preserve any existing notaFotoUrl value as the first element of notaFotos
UPDATE "pedidos"
SET "notaFotos" = ARRAY["notaFotoUrl"]
WHERE "notaFotoUrl" IS NOT NULL AND "notaFotoUrl" != '';

ALTER TABLE "pedidos" DROP COLUMN "notaFotoUrl";
