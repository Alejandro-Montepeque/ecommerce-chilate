-- AlterTable: contraseña temporal para usuarios internos
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "tempPasswordExpiresAt" TIMESTAMP(3);
