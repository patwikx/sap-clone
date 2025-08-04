-- CreateEnum
CREATE TYPE "public"."DocStatus" AS ENUM ('O', 'C', 'L');

-- CreateTable
CREATE TABLE "public"."OUSR" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OUSR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ADO1_LOG" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedFields" JSONB,

    CONSTRAINT "ADO1_LOG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OHEM" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "department" TEXT,
    "managerId" TEXT,
    "officePhone" TEXT,
    "mobilePhone" TEXT,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OHEM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OCRD" (
    "id" TEXT NOT NULL,
    "cardCode" TEXT NOT NULL,
    "cardName" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "groupCode" INTEGER NOT NULL,
    "phone1" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OCRD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CRD1" (
    "id" TEXT NOT NULL,
    "addressName" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "addressType" TEXT NOT NULL,
    "businessPartnerId" TEXT NOT NULL,

    CONSTRAINT "CRD1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OACT" (
    "id" TEXT NOT NULL,
    "acctCode" TEXT NOT NULL,
    "acctName" TEXT NOT NULL,
    "acctType" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isControlAccount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OACT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OJDT" (
    "id" SERIAL NOT NULL,
    "memo" TEXT,
    "refDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "taxDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OJDT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JDT1" (
    "id" SERIAL NOT NULL,
    "journalEntryId" INTEGER NOT NULL,
    "line_id" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DOUBLE PRECISION NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "shortName" TEXT,
    "lineMemo" TEXT,
    "businessPartnerId" TEXT,

    CONSTRAINT "JDT1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OPMG" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OPMG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OITM" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL DEFAULT 'I',
    "onHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "committed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "procurementMethod" TEXT NOT NULL DEFAULT 'B',
    "leadTime" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemGroupId" TEXT NOT NULL,

    CONSTRAINT "OITM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OITB" (
    "id" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,

    CONSTRAINT "OITB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OWHS" (
    "id" TEXT NOT NULL,
    "whsCode" TEXT NOT NULL,
    "whsName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OWHS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OITW" (
    "id" TEXT NOT NULL,
    "onHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "committed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,

    CONSTRAINT "OITW_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OITT" (
    "id" TEXT NOT NULL,
    "bomCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "parentItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OITT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ITT1" (
    "id" TEXT NOT NULL,
    "billOfMaterialsId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "childItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ITT1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OWOR" (
    "id" SERIAL NOT NULL,
    "docNum" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'P',
    "type" TEXT NOT NULL DEFAULT 'S',
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "completedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rejectedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "postingDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OWOR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WOR1" (
    "id" SERIAL NOT NULL,
    "productionOrderId" INTEGER NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "baseQty" DOUBLE PRECISION NOT NULL,
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "issuedQty" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WOR1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ORDR" (
    "id" SERIAL NOT NULL,
    "docNum" INTEGER NOT NULL,
    "docStatus" "public"."DocStatus" NOT NULL DEFAULT 'O',
    "docDate" TIMESTAMP(3) NOT NULL,
    "docDueDate" TIMESTAMP(3) NOT NULL,
    "taxDate" TIMESTAMP(3) NOT NULL,
    "docTotal" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessPartnerId" TEXT NOT NULL,

    CONSTRAINT "ORDR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RDR1" (
    "id" SERIAL NOT NULL,
    "salesOrderId" INTEGER NOT NULL,
    "lineNum" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "openQty" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RDR1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OINV" (
    "id" SERIAL NOT NULL,
    "docNum" INTEGER NOT NULL,
    "docStatus" "public"."DocStatus" NOT NULL DEFAULT 'O',
    "docDate" TIMESTAMP(3) NOT NULL,
    "docDueDate" TIMESTAMP(3) NOT NULL,
    "taxDate" TIMESTAMP(3) NOT NULL,
    "docTotal" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessPartnerId" TEXT NOT NULL,
    "baseDocType" TEXT,
    "baseDocNum" INTEGER,

    CONSTRAINT "OINV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."INV1" (
    "id" SERIAL NOT NULL,
    "arInvoiceId" INTEGER NOT NULL,
    "lineNum" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "baseDocType" TEXT,
    "baseDocNum" INTEGER,
    "baseLineNum" INTEGER,

    CONSTRAINT "INV1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OPOR" (
    "id" SERIAL NOT NULL,
    "docNum" INTEGER NOT NULL,
    "docStatus" "public"."DocStatus" NOT NULL DEFAULT 'O',
    "docDate" TIMESTAMP(3) NOT NULL,
    "docDueDate" TIMESTAMP(3) NOT NULL,
    "taxDate" TIMESTAMP(3) NOT NULL,
    "docTotal" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessPartnerId" TEXT NOT NULL,

    CONSTRAINT "OPOR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."POR1" (
    "id" SERIAL NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "lineNum" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "openQty" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "POR1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OPCH" (
    "id" SERIAL NOT NULL,
    "docNum" INTEGER NOT NULL,
    "docStatus" "public"."DocStatus" NOT NULL DEFAULT 'O',
    "docDate" TIMESTAMP(3) NOT NULL,
    "docDueDate" TIMESTAMP(3) NOT NULL,
    "taxDate" TIMESTAMP(3) NOT NULL,
    "docTotal" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessPartnerId" TEXT NOT NULL,
    "baseDocType" TEXT,
    "baseDocNum" INTEGER,

    CONSTRAINT "OPCH_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PCH1" (
    "id" SERIAL NOT NULL,
    "apInvoiceId" INTEGER NOT NULL,
    "lineNum" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "baseDocType" TEXT,
    "baseDocNum" INTEGER,
    "baseLineNum" INTEGER,

    CONSTRAINT "PCH1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OINS" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OINS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."INS1" (
    "id" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "INS1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OSCL" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "itemCode" TEXT,
    "serialNumber" TEXT,
    "status" INTEGER NOT NULL DEFAULT -3,
    "priority" TEXT NOT NULL DEFAULT 'M',
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedOn" TIMESTAMP(3),
    "contractId" TEXT,

    CONSTRAINT "OSCL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OUSR_email_key" ON "public"."OUSR"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OHEM_email_key" ON "public"."OHEM"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OHEM_userId_key" ON "public"."OHEM"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OCRD_cardCode_key" ON "public"."OCRD"("cardCode");

-- CreateIndex
CREATE UNIQUE INDEX "OACT_acctCode_key" ON "public"."OACT"("acctCode");

-- CreateIndex
CREATE UNIQUE INDEX "OPMG_code_key" ON "public"."OPMG"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OITM_itemCode_key" ON "public"."OITM"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "OITB_groupName_key" ON "public"."OITB"("groupName");

-- CreateIndex
CREATE UNIQUE INDEX "OWHS_whsCode_key" ON "public"."OWHS"("whsCode");

-- CreateIndex
CREATE UNIQUE INDEX "OITW_itemId_warehouseId_key" ON "public"."OITW"("itemId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "OITT_bomCode_key" ON "public"."OITT"("bomCode");

-- CreateIndex
CREATE UNIQUE INDEX "OWOR_docNum_key" ON "public"."OWOR"("docNum");

-- CreateIndex
CREATE UNIQUE INDEX "ORDR_docNum_key" ON "public"."ORDR"("docNum");

-- CreateIndex
CREATE UNIQUE INDEX "OINV_docNum_key" ON "public"."OINV"("docNum");

-- CreateIndex
CREATE UNIQUE INDEX "OPOR_docNum_key" ON "public"."OPOR"("docNum");

-- CreateIndex
CREATE UNIQUE INDEX "OPCH_docNum_key" ON "public"."OPCH"("docNum");

-- CreateIndex
CREATE UNIQUE INDEX "OINS_serialNumber_key" ON "public"."OINS"("serialNumber");

-- AddForeignKey
ALTER TABLE "public"."ADO1_LOG" ADD CONSTRAINT "ADO1_LOG_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."OUSR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OHEM" ADD CONSTRAINT "OHEM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."OUSR"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OHEM" ADD CONSTRAINT "OHEM_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."OHEM"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CRD1" ADD CONSTRAINT "CRD1_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JDT1" ADD CONSTRAINT "JDT1_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "public"."OJDT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JDT1" ADD CONSTRAINT "JDT1_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."OACT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JDT1" ADD CONSTRAINT "JDT1_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."OCRD"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OITM" ADD CONSTRAINT "OITM_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "public"."OITB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OITW" ADD CONSTRAINT "OITW_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."OITM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OITW" ADD CONSTRAINT "OITW_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."OWHS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OITT" ADD CONSTRAINT "OITT_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "public"."OITM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ITT1" ADD CONSTRAINT "ITT1_billOfMaterialsId_fkey" FOREIGN KEY ("billOfMaterialsId") REFERENCES "public"."OITT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ITT1" ADD CONSTRAINT "ITT1_childItemId_fkey" FOREIGN KEY ("childItemId") REFERENCES "public"."OITM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OWOR" ADD CONSTRAINT "OWOR_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WOR1" ADD CONSTRAINT "WOR1_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "public"."OWOR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WOR1" ADD CONSTRAINT "WOR1_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ORDR" ADD CONSTRAINT "ORDR_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RDR1" ADD CONSTRAINT "RDR1_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."ORDR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RDR1" ADD CONSTRAINT "RDR1_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OINV" ADD CONSTRAINT "OINV_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."INV1" ADD CONSTRAINT "INV1_arInvoiceId_fkey" FOREIGN KEY ("arInvoiceId") REFERENCES "public"."OINV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."INV1" ADD CONSTRAINT "INV1_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OPOR" ADD CONSTRAINT "OPOR_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."POR1" ADD CONSTRAINT "POR1_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."OPOR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."POR1" ADD CONSTRAINT "POR1_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OPCH" ADD CONSTRAINT "OPCH_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PCH1" ADD CONSTRAINT "PCH1_apInvoiceId_fkey" FOREIGN KEY ("apInvoiceId") REFERENCES "public"."OPCH"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PCH1" ADD CONSTRAINT "PCH1_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OINS" ADD CONSTRAINT "OINS_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OINS" ADD CONSTRAINT "OINS_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "public"."OITM"("itemCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."INS1" ADD CONSTRAINT "INS1_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OSCL" ADD CONSTRAINT "OSCL_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."OCRD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OSCL" ADD CONSTRAINT "OSCL_serialNumber_fkey" FOREIGN KEY ("serialNumber") REFERENCES "public"."OINS"("serialNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OSCL" ADD CONSTRAINT "OSCL_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."INS1"("id") ON DELETE SET NULL ON UPDATE CASCADE;
