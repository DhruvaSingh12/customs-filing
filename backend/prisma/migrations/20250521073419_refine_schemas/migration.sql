/*
  Warnings:

  - A unique constraint covering the columns `[invoice_no]` on the table `Filing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "Filing" ADD COLUMN     "createdById" TEXT,
ALTER COLUMN "exporter_gstin" SET DEFAULT '';

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "gstin" CHAR(15) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "passwordHash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_gstin_key" ON "User"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Filing_invoice_no_key" ON "Filing"("invoice_no");

-- CreateIndex
CREATE INDEX "Filing_createdById_idx" ON "Filing"("createdById");

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
