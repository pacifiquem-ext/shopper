-- Single marketplace: ratings, categories, reviews, promotions, payment proof review fields.
-- Keep stores.subdomain column; Prisma maps Store.slug → subdomain.

-- CreateEnum
CREATE TYPE "AttributeFieldType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT');
CREATE TYPE "AttributeAppliesTo" AS ENUM ('PRODUCT', 'VARIANT');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PromotionScope" AS ENUM ('PLATFORM', 'STORE');
CREATE TYPE "PromotionType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "PromotionStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED');

-- AlterTable Store
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "ratingAvg" DECIMAL(4,2) NOT NULL DEFAULT 0;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);

-- AlterTable Product
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "attributes" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ratingAvg" DECIMAL(4,2) NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable ProductVariant
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "attributes" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable Order
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promoCode" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promoDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable OrderPayment
ALTER TABLE "order_payments" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "order_payments" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "order_payments" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

-- CreateTable ProductCategory
CREATE TABLE IF NOT EXISTS "product_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRw" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_slug_key" ON "product_categories"("slug");
CREATE INDEX IF NOT EXISTS "product_categories_isActive_sortOrder_idx" ON "product_categories"("isActive", "sortOrder");

-- CreateTable CategoryAttributeDef
CREATE TABLE IF NOT EXISTS "category_attribute_defs" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelRw" TEXT NOT NULL,
    "type" "AttributeFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "appliesTo" "AttributeAppliesTo" NOT NULL DEFAULT 'PRODUCT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "category_attribute_defs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "category_attribute_defs_categoryId_key_key" ON "category_attribute_defs"("categoryId", "key");
CREATE INDEX IF NOT EXISTS "category_attribute_defs_categoryId_sortOrder_idx" ON "category_attribute_defs"("categoryId", "sortOrder");

-- CreateTable ProductReview
CREATE TABLE IF NOT EXISTS "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_reviews_productId_status_idx" ON "product_reviews"("productId", "status");
CREATE INDEX IF NOT EXISTS "product_reviews_storeId_status_idx" ON "product_reviews"("storeId", "status");
CREATE INDEX IF NOT EXISTS "product_reviews_userId_idx" ON "product_reviews"("userId");

-- CreateTable Promotion
CREATE TABLE IF NOT EXISTS "promotions" (
    "id" TEXT NOT NULL,
    "scope" "PromotionScope" NOT NULL,
    "storeId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "minOrderAmount" DECIMAL(65,30),
    "maxRedemptions" INTEGER,
    "perUserLimit" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "PromotionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "promotions_code_storeId_key" ON "promotions"("code", "storeId");
CREATE INDEX IF NOT EXISTS "promotions_scope_status_idx" ON "promotions"("scope", "status");
CREATE INDEX IF NOT EXISTS "promotions_storeId_status_idx" ON "promotions"("storeId", "status");
CREATE INDEX IF NOT EXISTS "promotions_startsAt_endsAt_idx" ON "promotions"("startsAt", "endsAt");

-- CreateTable PromotionTarget
CREATE TABLE IF NOT EXISTS "promotion_targets" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "productId" TEXT,
    "categoryId" TEXT,
    CONSTRAINT "promotion_targets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "promotion_targets_promotionId_idx" ON "promotion_targets"("promotionId");
CREATE INDEX IF NOT EXISTS "promotion_targets_productId_idx" ON "promotion_targets"("productId");
CREATE INDEX IF NOT EXISTS "promotion_targets_categoryId_idx" ON "promotion_targets"("categoryId");

-- CreateTable PromotionRedemption
CREATE TABLE IF NOT EXISTS "promotion_redemptions" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "customerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "promotion_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "promotion_redemptions_promotionId_idx" ON "promotion_redemptions"("promotionId");
CREATE INDEX IF NOT EXISTS "promotion_redemptions_orderId_idx" ON "promotion_redemptions"("orderId");

-- Product indexes
CREATE INDEX IF NOT EXISTS "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "products_status_ratingAvg_ratingCount_idx" ON "products"("status", "ratingAvg", "ratingCount");
CREATE INDEX IF NOT EXISTS "products_createdAt_idx" ON "products"("createdAt");

-- Foreign keys (guarded)
DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "category_attribute_defs" ADD CONSTRAINT "category_attribute_defs_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "promotions" ADD CONSTRAINT "promotions_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "promotion_targets" ADD CONSTRAINT "promotion_targets_promotionId_fkey"
    FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "promotion_targets" ADD CONSTRAINT "promotion_targets_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "promotion_targets" ADD CONSTRAINT "promotion_targets_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotionId_fkey"
    FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill approvedAt for already-approved stores
UPDATE "stores" SET "approvedAt" = COALESCE("approvedAt", "createdAt") WHERE "status" = 'APPROVED' AND "approvedAt" IS NULL;
