/*
  Warnings:

  - You are about to drop the column `warehouseKycId` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPricingRules` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryRegions` on the `stores` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "InventoryEventType" AS ENUM ('CREATED', 'RESTOCKED', 'SOLD', 'ADJUSTED', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PACKED', 'SHIPPED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderEventType" AS ENUM ('CREATED', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('ADMIN', 'CUSTOMER');

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_warehouseKycId_fkey";

-- DropIndex
DROP INDEX "addresses_warehouseKycId_key";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "warehouseKycId";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "deliveryPricingRules",
DROP COLUMN "deliveryRegions";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "vendor" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "images" TEXT[],
    "primaryImage" TEXT,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryLocation" TEXT,
    "deliveryPrice" DECIMAL(65,30),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "colorName" TEXT,
    "colorHex" TEXT,
    "size" TEXT,
    "model" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "compareAt" DECIMAL(65,30),
    "cost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_records" (
    "id" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 10,
    "status" "StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "lastRestockedAt" TIMESTAMP(3),
    "lastSoldAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_events" (
    "id" TEXT NOT NULL,
    "inventoryRecordId" TEXT NOT NULL,
    "type" "InventoryEventType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "deliveryFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "customerNote" TEXT,
    "internalNote" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentProofUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fulfillments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "deliveryMethod" TEXT NOT NULL,
    "deliveryZoneId" TEXT,
    "courierName" TEXT,
    "driverName" TEXT,
    "trackingNumber" TEXT,
    "packedBy" TEXT,
    "deliveredBy" TEXT,
    "assignedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_messages" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_metrics_snapshots" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "totalSales" INTEGER NOT NULL,
    "totalRevenue" DECIMAL(65,30) NOT NULL,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "totalProfit" DECIMAL(65,30) NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "pendingOrders" INTEGER NOT NULL,
    "completedOrders" INTEGER NOT NULL,
    "cancelledOrders" INTEGER NOT NULL,
    "activeProducts" INTEGER NOT NULL,
    "lowStockCount" INTEGER NOT NULL,
    "outOfStockCount" INTEGER NOT NULL,
    "totalCustomers" INTEGER NOT NULL,
    "newCustomers" INTEGER NOT NULL,
    "activeCustomers" INTEGER NOT NULL,
    "totalStockValue" DECIMAL(65,30) NOT NULL,
    "totalStockQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_performance_snapshots" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "unitsSold" INTEGER NOT NULL,
    "revenue" DECIMAL(65,30) NOT NULL,
    "trendPercent" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_performance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_storeId_status_idx" ON "products"("storeId", "status");

-- CreateIndex
CREATE INDEX "products_storeId_category_idx" ON "products"("storeId", "category");

-- CreateIndex
CREATE INDEX "products_storeId_vendor_idx" ON "products"("storeId", "vendor");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_records_productVariantId_key" ON "inventory_records"("productVariantId");

-- CreateIndex
CREATE INDEX "inventory_records_productVariantId_idx" ON "inventory_records"("productVariantId");

-- CreateIndex
CREATE INDEX "inventory_records_status_idx" ON "inventory_records"("status");

-- CreateIndex
CREATE INDEX "inventory_events_inventoryRecordId_idx" ON "inventory_events"("inventoryRecordId");

-- CreateIndex
CREATE INDEX "inventory_events_createdAt_idx" ON "inventory_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_storeId_placedAt_idx" ON "orders"("storeId", "placedAt");

-- CreateIndex
CREATE INDEX "orders_storeId_orderNumber_idx" ON "orders"("storeId", "orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");

-- CreateIndex
CREATE INDEX "order_line_items_orderId_idx" ON "order_line_items"("orderId");

-- CreateIndex
CREATE INDEX "order_line_items_productVariantId_idx" ON "order_line_items"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "order_payments_orderId_key" ON "order_payments"("orderId");

-- CreateIndex
CREATE INDEX "order_payments_orderId_idx" ON "order_payments"("orderId");

-- CreateIndex
CREATE INDEX "order_payments_status_idx" ON "order_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "order_fulfillments_orderId_key" ON "order_fulfillments"("orderId");

-- CreateIndex
CREATE INDEX "order_fulfillments_orderId_idx" ON "order_fulfillments"("orderId");

-- CreateIndex
CREATE INDEX "order_fulfillments_status_idx" ON "order_fulfillments"("status");

-- CreateIndex
CREATE INDEX "order_events_orderId_createdAt_idx" ON "order_events"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "order_messages_orderId_createdAt_idx" ON "order_messages"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "daily_metrics_snapshots_storeId_snapshotDate_idx" ON "daily_metrics_snapshots"("storeId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "daily_metrics_snapshots_storeId_snapshotDate_key" ON "daily_metrics_snapshots"("storeId", "snapshotDate");

-- CreateIndex
CREATE INDEX "product_performance_snapshots_storeId_snapshotDate_idx" ON "product_performance_snapshots"("storeId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "product_performance_snapshots_storeId_productVariantId_snap_key" ON "product_performance_snapshots"("storeId", "productVariantId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_records" ADD CONSTRAINT "inventory_records_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_inventoryRecordId_fkey" FOREIGN KEY ("inventoryRecordId") REFERENCES "inventory_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "delivery_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_messages" ADD CONSTRAINT "order_messages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_metrics_snapshots" ADD CONSTRAINT "daily_metrics_snapshots_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_performance_snapshots" ADD CONSTRAINT "product_performance_snapshots_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_performance_snapshots" ADD CONSTRAINT "product_performance_snapshots_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
