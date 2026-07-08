-- AlterTable: super administrador oculto/protegido
ALTER TABLE "User" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Marca al primer usuario (el admin sembrado) como super administrador, para
-- que quede oculto de la lista y protegido de cambios/eliminación.
UPDATE "User" SET "isSuperAdmin" = true
WHERE "createdAt" = (SELECT MIN("createdAt") FROM "User");
