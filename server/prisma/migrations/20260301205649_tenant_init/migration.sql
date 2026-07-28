-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DELETED');

-- CreateTable
CREATE TABLE "industry_sectors" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_categories" (
    "id" TEXT NOT NULL,
    "industrySectorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "StoreStatus" NOT NULL DEFAULT 'SUBMITTED',
    "registeredName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "logoUrl" TEXT,
    "brandColors" JSONB,
    "deliveryRegions" JSONB,
    "deliveryPricingRules" JSONB,
    "returnPolicy" TEXT,
    "privacyPolicy" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rejectionReason" TEXT,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_kycs" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "industrySectorId" TEXT NOT NULL,
    "businessCategoryId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "ownerFullName" TEXT NOT NULL,
    "ownerDob" TIMESTAMP(3) NOT NULL,
    "ownerNationality" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_kycs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "physicalAddress" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "businessKycId" TEXT,
    "warehouseKycId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "draftData" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industry_sectors_code_key" ON "industry_sectors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "business_categories_code_key" ON "business_categories"("code");

-- CreateIndex
CREATE INDEX "business_categories_industrySectorId_idx" ON "business_categories"("industrySectorId");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "stores_userId_idx" ON "stores"("userId");

-- CreateIndex
CREATE INDEX "stores_slug_idx" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "stores_status_idx" ON "stores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "store_kycs_storeId_key" ON "store_kycs"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_businessKycId_key" ON "addresses"("businessKycId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_warehouseKycId_key" ON "addresses"("warehouseKycId");

-- CreateIndex
CREATE UNIQUE INDEX "store_drafts_userId_key" ON "store_drafts"("userId");

-- AddForeignKey
ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_industrySectorId_fkey" FOREIGN KEY ("industrySectorId") REFERENCES "industry_sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_kycs" ADD CONSTRAINT "store_kycs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_kycs" ADD CONSTRAINT "store_kycs_industrySectorId_fkey" FOREIGN KEY ("industrySectorId") REFERENCES "industry_sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_kycs" ADD CONSTRAINT "store_kycs_businessCategoryId_fkey" FOREIGN KEY ("businessCategoryId") REFERENCES "business_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_businessKycId_fkey" FOREIGN KEY ("businessKycId") REFERENCES "store_kycs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_warehouseKycId_fkey" FOREIGN KEY ("warehouseKycId") REFERENCES "store_kycs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_drafts" ADD CONSTRAINT "store_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
