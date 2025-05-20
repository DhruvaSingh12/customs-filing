-- CreateEnum
CREATE TYPE "FilingStatus" AS ENUM ('draft', 'submitted', 'error');

-- CreateTable
CREATE TABLE "Filing" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "port_code" TEXT NOT NULL,
    "exporter_gstin" CHAR(15),
    "import_export_flag" CHAR(1) NOT NULL,
    "total_invoice_value" DECIMAL(14,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "submission_date" TIMESTAMP(3),
    "status" "FilingStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilingItem" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "item_id" TEXT,
    "commodity_desc" VARCHAR(200) NOT NULL,
    "hs_code" VARCHAR(10) NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit_code" VARCHAR(4) NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "line_item_value" DECIMAL(14,2) NOT NULL,
    "origin_country_code" CHAR(2) NOT NULL,
    "net_mass" DECIMAL(12,3),
    "gross_mass" DECIMAL(12,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Filing_shipment_id_idx" ON "Filing"("shipment_id");

-- CreateIndex
CREATE INDEX "FilingItem_filingId_idx" ON "FilingItem"("filingId");

-- AddForeignKey
ALTER TABLE "FilingItem" ADD CONSTRAINT "FilingItem_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
