-- CreateTable
CREATE TABLE "invitaciones_usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ADMINISTRADOR',
    "permisos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitaciones_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitaciones_usuarios_token_key" ON "invitaciones_usuarios"("token");
