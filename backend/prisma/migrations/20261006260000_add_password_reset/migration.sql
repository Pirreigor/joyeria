-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT;

