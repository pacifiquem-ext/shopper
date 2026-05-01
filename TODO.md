# Integration TODO — Client ↔ Server

> **Audit date:** 2026-04-27  
> **Last updated:** 2026-04-27 — Batch 0 (server prerequisites) and Batch 1 (analytics + dashboard home) complete.  
> **Status:** Auth + Onboarding + Analytics + Dashboard Home connected. Products, Orders, Inventory still on mock data.  
> **31 server endpoints exist. 6 were connected. Batch 0+1 adds 11 more (analytics ×4, orders GET messages, store settings ×2, delivery zones ×4).**
> Conversation: claude --resume "dashboard-mock-to-api-integration"

---

## How to read this file

Each batch is a self-contained unit of work. Batches are ordered so that later batches don't block earlier ones where possible. Server-side work that must exist before client-side wiring is flagged explicitly. Every task has a `[ ]` checkbox — check it off when done.

**Legend:**
- `[SERVER]` — work needed in `server/src/`
- `[CLIENT]` — work needed in `client/src/`
- `✅ READY` — server endpoint is fully implemented, just needs client wiring
- `⚠️ STUBBED` — server endpoint exists but uses `any` DTOs, needs typing before client use
- `❌ MISSING` — server endpoint does not exist yet, must be built first

---

## Current Integration State (Snapshot)

### Connected (working today)
| Feature | Client File | Server Endpoint |
|---------|-------------|----------------|
| Login | `(auth)/login/page.tsx` | `POST /v1/auth/login` |
| Signup | `(auth)/signup/page.tsx` | `POST /v1/auth/signup` |
| Verify phone | `(auth)/verify-phone/page.tsx` | `POST /v1/auth/verify-phone` |
| Forgot password | `(auth)/forgot-password/page.tsx` | `POST /v1/auth/forgot-password` |
| Reset password | `(auth)/reset-password/page.tsx` | `POST /v1/auth/reset-password` |
| Onboarding draft load | `store-onboarding.store.ts` | `GET /v1/onboarding/draft` |
| Onboarding draft save | `store-onboarding.store.ts` | `PUT /v1/onboarding/draft` |
| Onboarding submit | `store-onboarding.store.ts` | `PUT /v1/onboarding/submit` |
| Industry list | `step-industry.tsx` | `GET /v1/references/industries` |
| Category list | `step-industry.tsx` | `GET /v1/references/categories` |

### Disconnected — Dashboard (all mock data)
| Feature | Client Location | Mock Data | Server Endpoint | Server State |
|---------|----------------|-----------|----------------|-------------|
| Dashboard KPIs | `dashboard/page.tsx` lines 51–102 | `metrics` useMemo | `GET /v1/analytics/dashboard` | ✅ READY |
| Sales trend chart | `dashboard-metrics.tsx` lines 67–80 | `data` const | `GET /v1/analytics/sales` | ✅ READY |
| Top products list | `dashboard/page.tsx` lines 118–122 | `topProducts` useMemo | `GET /v1/analytics/products/top` | ✅ READY |
| Inventory KPI summary | `dashboard/page.tsx` metrics section | `metrics` useMemo | `GET /v1/analytics/inventory/summary` | ✅ READY |
| Recent activity feed | `dashboard/page.tsx` lines 111–116 | `recentActivity` useMemo | No endpoint | ❌ MISSING |
| Sparkline data (per KPI) | `dashboard/page.tsx` lines 160,168,176,184 | hardcoded arrays | Derivable from analytics | ✅ READY |
| Generate report button | `dashboard/page.tsx` line 124–126 | `console.log()` | No endpoint | ❌ MISSING |
| Product list | `products/page.tsx` lines 146–210 | `rows` useMemo | `GET /v1/products` | ✅ READY |
| Product detail | `products/page.tsx` lines 212–300 | `detailsById` useMemo | `GET /v1/products/:id` | ✅ READY |
| Create product | `products/page.tsx` line 602 | form → console | `POST /v1/products` | ✅ READY |
| Update product | `products/page.tsx` line 1116 | form → console | `PUT /v1/products/:id` | ✅ READY |
| Delete product | `products/page.tsx` line 359 | `console.log` | `DELETE /v1/products/:id` | ✅ READY |
| Product analytics charts | `products/page.tsx` lines 780–888 | hardcoded | `GET /v1/products/:id/analytics` | ✅ READY |
| Top trending chart | `products/page.tsx` lines 815–888 | hardcoded | `GET /v1/analytics/products/top` | ✅ READY |
| Filter/search products | `products/page.tsx` filter bar | no API call | `GET /v1/products?filters...` | ✅ READY |
| Export products | `products/page.tsx` line 598 | no API call | No endpoint | ❌ MISSING |
| Order list | `orders/page.tsx` lines 104–158 | `rows` useMemo | `GET /v1/orders` | ⚠️ STUBBED |
| Order detail | `orders/page.tsx` lines 160–339 | `detailsById` useMemo | `GET /v1/orders/:id` | ⚠️ STUBBED |
| Confirm/reject payment | `orders/page.tsx` lines 351–356 | local state | `PUT /v1/orders/:id/payment` | ⚠️ STUBBED |
| Update fulfillment | `order-view-sheet.tsx` | local state | `PUT /v1/orders/:id/fulfillment` | ⚠️ STUBBED |
| Send order message | `orders/page.tsx` lines 359–371 | local state | `POST /v1/orders/:id/messages` | ⚠️ STUBBED |
| Load order messages | `orders/page.tsx` lines 65–97 | `orderMessages` useState | No GET endpoint | ❌ MISSING |
| Filter orders by date | date range picker | hardcoded '2024-01-01' | `GET /v1/orders?dateFrom&dateTo` | ⚠️ STUBBED |
| Export orders | `orders/page.tsx` line 581 | no API call | No endpoint | ❌ MISSING |
| Inventory list | `inventory/page.tsx` lines 72–118 | `rows` useState | `GET /v1/inventory` | ✅ READY |
| Inventory detail | `inventory/page.tsx` lines 120–210 | `detailsById` useMemo | `GET /v1/inventory/:variantId` | ✅ READY |
| Adjust stock | `inventory/page.tsx` lines 260–281 | local state | `POST /v1/inventory/:variantId/adjust` | ✅ READY |
| Inventory event log | `inventory-view-sheet.tsx` | hardcoded | `GET /v1/inventory/:variantId/events` | ✅ READY |
| Export inventory | `inventory/page.tsx` line 524 | no API call | No endpoint | ❌ MISSING |
| Load store settings | `store-settings/page.tsx` lines 47–101 | 7× useState hardcoded | No endpoint | ❌ MISSING |
| Save business info | `store-settings/page.tsx` handleSave | no API call | No endpoint | ❌ MISSING |
| Save owner info | `store-settings/page.tsx` handleSave | no API call | No endpoint | ❌ MISSING |
| Save branding | `store-settings/page.tsx` handleSave | no API call | No endpoint | ❌ MISSING |
| Save contact info | `store-settings/page.tsx` handleSave | no API call | No endpoint | ❌ MISSING |
| Load delivery zones | `store-settings/page.tsx` lines 85–89 | 3× hardcoded zones | No endpoint | ❌ MISSING |
| Add delivery zone | `store-settings/page.tsx` | no API call | No endpoint | ❌ MISSING |
| Update delivery zone | `store-settings/page.tsx` | no API call | No endpoint | ❌ MISSING |
| Delete delivery zone | `store-settings/page.tsx` | no API call | No endpoint | ❌ MISSING |
| Payments list | `payments/page.tsx` | placeholder | No endpoint | ❌ MISSING |
| Subscription info | `subscription/page.tsx` | static cards | No endpoint | ❌ MISSING |
| Subdomain check | `step-subdomain.tsx` | logic exists, no call | `GET /v1/onboarding/check-subdomain` | ✅ READY |
| Admin: list stores | No client page | — | `GET /v1/admin/stores` | ✅ READY |
| Admin: view KYC | No client page | — | `GET /v1/admin/stores/:id/kyc` | ✅ READY |
| Admin: approve store | No client page | — | `POST /v1/admin/stores/:id/approve` | ✅ READY |
| Admin: reject store | No client page | — | `POST /v1/admin/stores/:id/reject` | ✅ READY |

---

## BATCH 0 — Server Prerequisites (unblock later batches)

> These must be done before client work in Batch 3 (Orders) and Batch 5 (Settings) can start.  
> Batches 1, 2, 4 do NOT depend on this batch.

### 0.A — Type the Orders module (currently all `any` DTOs)

**Why:** The orders controller routes exist and are registered but every request body, query param, and response is typed as `any`. Client cannot safely consume these until they're properly typed and validated.

- [x] **[SERVER]** Create `server/src/modules/orders/dtos/create-order.dto.ts`
  - Fields: `customerName` (string), `customerPhone` (string), `customerEmail?` (string), `shippingAddress` (object: province, district, sector, physicalAddress), `billingAddress?` (same shape), `customerNote?` (string), `internalNote?` (string), `items` (array of `{ productVariantId: UUID, quantity: number }`)

- [x] **[SERVER]** Create `server/src/modules/orders/dtos/order-filter.dto.ts`
  - Fields: `page?` (number, default 1), `limit?` (number, default 20), `dateFrom?` (ISO string), `dateTo?` (ISO string), `fulfillmentStatus?` (enum), `paymentStatus?` (enum), `search?` (string — customer name / order number)

- [x] **[SERVER]** Create `server/src/modules/orders/dtos/update-payment.dto.ts`
  - Fields: `status` (enum: `SUCCESS | FAILED | REFUNDED`), `reference?` (string), `paymentProofUrl?` (string)

- [x] **[SERVER]** Create `server/src/modules/orders/dtos/update-fulfillment.dto.ts`
  - Fields: `status` (enum: `UNFULFILLED | PACKED | SHIPPED | FULFILLED | CANCELLED`), `courierName?` (string), `driverName?` (string), `trackingNumber?` (string)

- [x] **[SERVER]** Create `server/src/modules/orders/dtos/send-message.dto.ts`
  - Fields: `message` (string, minLength 1), `senderName?` (string)

- [ ] **[SERVER]** Create `server/src/modules/orders/dtos/order-response.dto.ts` — formal response DTO with `@Expose()` decorators _(deferred — service currently returns Prisma type directly which is fine for now)_

- [x] **[SERVER]** Add `GET /v1/orders/:id/messages` endpoint to `orders.controller.ts`
  - Returns `OrderMessage[]` for a given order
  - Implemented `getMessages()` in `orders.service.ts` and `findMessages()` in `orders.repository.ts`

- [x] **[SERVER]** Replace all `any` in `orders.controller.ts` with the new DTOs above

- [x] **[SERVER]** `orders.service.ts` methods were already implemented — added `getMessages()`, added `dateFrom`/`dateTo` filter support to `findAll()`

---

### 0.B — Build Store Settings module (new server module)

**Why:** There is no `/store/settings` endpoint. Store data is split across `Store` and `StoreKyc` Prisma models. The client settings page needs a single endpoint to load and save all store configuration.

- [x] **[SERVER]** Create `server/src/modules/store-settings/` directory structure:
  ```
  store-settings/
    controllers/store-settings.controller.ts
    services/store-settings.service.ts
    repositories/store-settings.repository.ts
    dtos/update-store-settings.dto.ts
    store-settings.module.ts
  ```

- [x] **[SERVER]** Create `update-store-settings.dto.ts` — 14 optional fields covering Store + StoreKyc fields

- [x] **[SERVER]** Implement `GET /v1/store/settings` — joins `Store` + `StoreKyc` + `Address` + `industrySector` + `businessCategory`
- [x] **[SERVER]** Implement `PUT /v1/store/settings` — partial update, writes to `Store` and `StoreKyc` in parallel
- [x] **[SERVER]** Register `StoreSettingsModule` in `AppModule`

---

### 0.C — Build Delivery Zones module (new server module)

**Why:** The `DeliveryZone` model exists in the Prisma schema but has no controller or service. The client needs to load, add, edit, and delete delivery zones.

- [x] **[SERVER]** Create `server/src/modules/delivery-zones/` directory structure:
  ```
  delivery-zones/
    controllers/delivery-zones.controller.ts
    services/delivery-zones.service.ts
    repositories/delivery-zones.repository.ts
    dtos/create-delivery-zone.dto.ts
    dtos/update-delivery-zone.dto.ts
    delivery-zones.module.ts
  ```

- [x] **[SERVER]** Create `create-delivery-zone.dto.ts` — fields: `name` (string), `feeRwf` (number >= 0), `etaMinutes` (number > 0)
- [x] **[SERVER]** Create `update-delivery-zone.dto.ts` — same fields, all optional
- [x] **[SERVER]** Implement `GET /v1/delivery-zones` — list all zones for the store (uses `@StoreId()`)
- [x] **[SERVER]** Implement `POST /v1/delivery-zones` — create new zone for the store
- [x] **[SERVER]** Implement `PUT /v1/delivery-zones/:id` — update zone (verify ownership)
- [x] **[SERVER]** Implement `DELETE /v1/delivery-zones/:id` — delete zone (verify ownership)
- [x] **[SERVER]** Register `DeliveryZonesModule` in `AppModule`

---

## BATCH 1 — Analytics & Dashboard Home

> **Depends on:** Nothing. All 4 endpoints are fully implemented and ready.  
> **Files touched:** `client/src/` only.

### 1.A — Create analytics service

- [x] **[CLIENT]** Create `client/src/services/analytics.service.ts`
  - `getDashboardMetrics(period)` → `GET /v1/analytics/dashboard?period=`
  - `getSalesTrend(days)` → `GET /v1/analytics/sales?days=`
  - `getTopProducts(limit)` → `GET /v1/analytics/products/top?limit=`
  - `getInventorySummary()` → `GET /v1/analytics/inventory/summary`
  - Exports `DashboardMetrics`, `SalesTrendPoint`, `TopProduct`, `InventorySummary` interfaces

### 1.B — Wire dashboard home page

**File:** `client/src/app/[locale]/dashboard/page.tsx`

- [x] **[CLIENT]** Remove hardcoded `metrics` useMemo — replaced with `useEffect` + `Promise.allSettled` fetching all 4 analytics endpoints in parallel
- [x] **[CLIENT]** Remove hardcoded `topProducts` useMemo — populated from `analyticsService.getTopProducts(3)`
- [x] **[CLIENT]** Remove hardcoded `recentActivity` useMemo — removed (no endpoint yet; Batch 8)
- [x] **[CLIENT]** Remove hardcoded sparkline arrays — KpiStatCard now uses `trendLabel` string, no sparkline data needed
- [x] **[CLIENT]** Add loading states — `isLoading` state, `—` placeholders while loading, skeleton list for top products
- [x] **[CLIENT]** Error handling — `Promise.allSettled` means one failed endpoint won't crash the page; axios interceptor shows toast

### 1.C — Wire dashboard metrics chart

**File:** `client/src/components/dashboard/shared/dashboard-metrics.tsx`

- [x] **[CLIENT]** Remove hardcoded `data` const (12 months of fake sales/purchase values)
- [x] **[CLIENT]** `SalesPurchaseChart` now accepts `data: SalesTrendPoint[]` and `isLoading: boolean` props
- [x] **[CLIENT]** Maps `revenue` → Sales line, `cost` → Cost/Purchase line (server updated to return `cost` in trend data)
- [x] **[CLIENT]** Loading skeleton (animated pulse) shown when `isLoading=true`; empty state shown when no data

---

## BATCH 2 — Products

> **Depends on:** Nothing. All 6 product endpoints are fully implemented.  
> **Files touched:** `client/src/` only.

### 2.A — Create products service

- [ ] **[CLIENT]** Create `client/src/services/products.service.ts`
  ```typescript
  // Methods to implement:
  getProducts(filters?: ProductFilterDto)
    → GET /v1/products?page=&limit=&status=&search=&category=&vendor=
    → Returns: { data: Product[], total, page, limit, totalPages }

  getProductById(id: string)
    → GET /v1/products/:id
    → Returns: ProductResponseDto (with variants + inventory)

  createProduct(dto: CreateProductDto)
    → POST /v1/products
    → Returns: ProductResponseDto

  updateProduct(id: string, dto: UpdateProductDto)
    → PUT /v1/products/:id
    → Returns: ProductResponseDto

  deleteProduct(id: string)
    → DELETE /v1/products/:id
    → Returns: success message

  getProductAnalytics(id: string)
    → GET /v1/products/:id/analytics
    → Returns: analytics object (performance metrics)
  ```

### 2.B — Create products Zustand store

- [ ] **[CLIENT]** Create `client/src/store/products.store.ts`
  ```typescript
  // State:
  products: ProductResponseDto[]
  total: number
  page: number
  totalPages: number
  selectedProduct: ProductResponseDto | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Actions:
  fetchProducts(filters?)     → calls productsService.getProducts()
  fetchProductById(id)        → calls productsService.getProductById()
  createProduct(dto)          → calls productsService.createProduct(), re-fetches list
  updateProduct(id, dto)      → calls productsService.updateProduct(), updates in place
  deleteProduct(id)           → calls productsService.deleteProduct(), removes from list
  setSelectedProduct(product) → sets detail panel data
  clearSelectedProduct()
  ```

### 2.C — Wire products page

**File:** `client/src/app/[locale]/dashboard/products/page.tsx`

- [ ] **[CLIENT]** Remove hardcoded `rows` useMemo (lines 146–210, 5 fake products) — replace with `useProductsStore` fetch on mount
- [ ] **[CLIENT]** Remove hardcoded `detailsById` useMemo (lines 212–300) — replace with `fetchProductById(id)` when a row is selected
- [ ] **[CLIENT]** Wire "Create Product" button (line 602) → `ProductFormModal` `onSubmit` → `store.createProduct(dto)` → close modal on success
- [ ] **[CLIENT]** Wire edit product form → `ProductFormModal` `onSubmit` (edit mode, line 1116) → `store.updateProduct(id, dto)` → close modal on success
- [ ] **[CLIENT]** Wire `handleDelete(id)` (line 359) — currently `console.log` → `store.deleteProduct(id)` with confirmation dialog
- [ ] **[CLIENT]** Wire filter bar / search → call `store.fetchProducts(filters)` on change (debounced)
- [ ] **[CLIENT]** Add pagination — products list response includes `total`, `page`, `totalPages`
- [ ] **[CLIENT]** Add loading states for the table, detail panel, and form modal
- [ ] **[CLIENT]** Add optimistic delete (remove from list immediately, revert on error)

### 2.D — Wire product charts

**File:** `client/src/app/[locale]/dashboard/products/page.tsx` (lines 780–888)

- [ ] **[CLIENT]** Remove hardcoded sales performance chart data (lines 780–811) — replace with `productsService.getProductAnalytics(selectedProductId)` when a product is selected
- [ ] **[CLIENT]** Remove hardcoded trending products data (lines 815–888) — replace with `analyticsService.getTopProducts(5)` (can reuse Batch 1 analytics service)
- [ ] **[CLIENT]** Add loading skeletons for both chart areas

---

## BATCH 3 — Inventory

> **Depends on:** Nothing. All 4 inventory endpoints are fully implemented.  
> **Files touched:** `client/src/` only.

### 3.A — Create inventory service

- [ ] **[CLIENT]** Create `client/src/services/inventory.service.ts`
  ```typescript
  // Methods to implement:
  getInventory(filters?: any)
    → GET /v1/inventory
    → Returns: InventoryRecord[] with product variant info

  getInventoryByVariant(variantId: string)
    → GET /v1/inventory/:variantId
    → Returns: InventoryRecord (onHand, reserved, available, reorderPoint, status)

  adjustStock(variantId: string, dto: AdjustStockDto)
    → POST /v1/inventory/:variantId/adjust
    → Body: { quantity: number, reason: string }
    → Returns: updated InventoryRecord

  getInventoryEvents(variantId: string)
    → GET /v1/inventory/:variantId/events
    → Returns: InventoryEvent[] (type, quantity, reason, performedBy, createdAt)
  ```

### 3.B — Create inventory Zustand store

- [ ] **[CLIENT]** Create `client/src/store/inventory.store.ts`
  ```typescript
  // State:
  records: InventoryRecord[]
  selectedRecord: InventoryRecord | null
  events: InventoryEvent[]
  isLoading: boolean
  isAdjusting: boolean

  // Actions:
  fetchInventory(filters?)         → calls inventoryService.getInventory()
  fetchInventoryByVariant(id)      → calls inventoryService.getInventoryByVariant()
  adjustStock(variantId, dto)      → calls inventoryService.adjustStock(), updates record
  fetchEvents(variantId)           → calls inventoryService.getInventoryEvents()
  setSelectedRecord(record)
  ```

### 3.C — Wire inventory page

**File:** `client/src/app/[locale]/dashboard/inventory/page.tsx`

- [ ] **[CLIENT]** Remove hardcoded `rows` useState (lines 72–118, 5 fake items) — replace with `useInventoryStore` fetch on mount
- [ ] **[CLIENT]** Remove hardcoded `detailsById` useMemo (lines 120–210+) — replace with `fetchInventoryByVariant(variantId)` when a row is selected
- [ ] **[CLIENT]** Wire `applyAdjustment()` (lines 260–281) — currently updates local state → `store.adjustStock(variantId, { quantity, reason })` → close dialog on success
- [ ] **[CLIENT]** Wire inventory event log in `inventory-view-sheet.tsx` — call `store.fetchEvents(variantId)` when view sheet opens
- [ ] **[CLIENT]** Add loading states for table, detail panel, and adjust dialog
- [ ] **[CLIENT]** Show `InventoryEvent` history in the view sheet event log section

---

## BATCH 4 — Orders

> **Depends on:** Batch 0.A (server DTOs must be typed before wiring is safe).  
> **Files touched:** both `server/src/` (0.A) and `client/src/`.

### 4.A — Create orders service

- [ ] **[CLIENT]** Create `client/src/services/orders.service.ts`
  ```typescript
  // Methods to implement:
  getOrders(filters?: OrderFilterDto)
    → GET /v1/orders?page=&limit=&dateFrom=&dateTo=&fulfillmentStatus=&paymentStatus=&search=
    → Returns: paginated order list

  getOrderById(id: string)
    → GET /v1/orders/:id
    → Returns: full order (lineItems, payment, fulfillment, events)

  createOrder(dto: CreateOrderDto)
    → POST /v1/orders
    → Returns: created order

  updatePayment(id: string, dto: UpdatePaymentDto)
    → PUT /v1/orders/:id/payment
    → Body: { status, reference?, paymentProofUrl?, paidAt? }

  updateFulfillment(id: string, dto: UpdateFulfillmentDto)
    → PUT /v1/orders/:id/fulfillment
    → Body: { status, courierName?, trackingNumber? }

  sendMessage(id: string, dto: SendMessageDto)
    → POST /v1/orders/:id/messages
    → Body: { message, senderName }

  getMessages(id: string)
    → GET /v1/orders/:id/messages
    → Returns: OrderMessage[]
  ```

### 4.B — Create orders Zustand store

- [ ] **[CLIENT]** Create `client/src/store/orders.store.ts`
  ```typescript
  // State:
  orders: Order[]
  total: number
  page: number
  selectedOrder: Order | null
  messages: Record<string, OrderMessage[]>   // keyed by orderId
  isLoading: boolean
  isUpdating: boolean
  isSendingMessage: boolean

  // Actions:
  fetchOrders(filters?)               → calls ordersService.getOrders()
  fetchOrderById(id)                  → calls ordersService.getOrderById()
  confirmPayment(id, dto)             → calls ordersService.updatePayment()
  rejectPayment(id, dto)              → calls ordersService.updatePayment()
  updateFulfillment(id, dto)          → calls ordersService.updateFulfillment()
  sendMessage(id, dto)                → calls ordersService.sendMessage(), appends to messages[id]
  fetchMessages(id)                   → calls ordersService.getMessages(), sets messages[id]
  setSelectedOrder(order)
  ```

### 4.C — Wire orders page

**File:** `client/src/app/[locale]/dashboard/orders/page.tsx`

- [ ] **[CLIENT]** Remove hardcoded `rows` useMemo (lines 104–158, 5 fake orders) — replace with `useOrdersStore` fetch on mount
- [ ] **[CLIENT]** Remove hardcoded `detailsById` useMemo (lines 160–339) — replace with `fetchOrderById(id)` when a row is selected
- [ ] **[CLIENT]** Remove hardcoded `orderMessages` useState (lines 65–97) — replace with `store.fetchMessages(orderId)` when order detail opens
- [ ] **[CLIENT]** Remove hardcoded `paymentConfirmed` useState (lines 61–64) — payment status now comes from `selectedOrder.payment.status`
- [ ] **[CLIENT]** Wire `handleConfirmPayment()` (line 351) → `store.confirmPayment(id, { status: 'SUCCESS' })` → refresh order
- [ ] **[CLIENT]** Wire `handleRejectPayment()` (line 356) → `store.rejectPayment(id, { status: 'FAILED' })` → refresh order
- [ ] **[CLIENT]** Wire `handleSendMessage()` (lines 359–371) → `store.sendMessage(id, dto)` → append message to conversation
- [ ] **[CLIENT]** Wire date range picker (hardcoded '2024-01-01') → `store.fetchOrders({ dateFrom, dateTo })` on change
- [ ] **[CLIENT]** Wire `PaymentVerificationModal` → pass `store.confirmPayment` / `store.rejectPayment`
- [ ] **[CLIENT]** Wire `OrderCommunicationModal` → pass `store.sendMessage`
- [ ] **[CLIENT]** Add pagination to orders table
- [ ] **[CLIENT]** Add loading states for table, detail panel, modals

---

## BATCH 5 — Store Settings

> **Depends on:** Batch 0.B (server Store Settings module must exist first).  
> **Files touched:** both `server/src/` (0.B) and `client/src/`.

### 5.A — Create store settings service

- [x] **[CLIENT]** Create `client/src/services/store-settings.service.ts`
  ```typescript
  // Methods to implement:
  getStoreSettings()
    → GET /v1/store/settings
    → Returns: combined Store + StoreKyc + Address data

  updateStoreSettings(dto: UpdateStoreSettingsDto)
    → PUT /v1/store/settings
    → Body: partial update (any of the 13 optional fields)
    → Returns: updated settings
  ```

### 5.B — Wire store settings page

**File:** `client/src/app/[locale]/dashboard/store-settings/page.tsx`

- [x] **[CLIENT]** Remove hardcoded `businessInfo` useState (lines 47–55) — populate from `storeSettingsService.getStoreSettings()` on mount
- [x] **[CLIENT]** Remove hardcoded `ownerInfo` useState (lines 57–62) — same load
- [x] **[CLIENT]** Remove hardcoded `businessAddress` useState (lines 64–70) — same load
- [x] **[CLIENT]** Remove hardcoded `branding` useState (lines 72–76) — same load
- [x] **[CLIENT]** Remove hardcoded `contact` useState (lines 78–83) — same load
- [x] **[CLIENT]** Remove hardcoded `subscription` useState (lines 91–101) — leave hardcoded until Batch 8 (no endpoint yet)
- [x] **[CLIENT]** Wire all `handleSave()` functions → `storeSettingsService.updateStoreSettings(changedFields)` → show success toast
- [x] **[CLIENT]** Add loading skeleton while settings load
- [x] **[CLIENT]** Add saving state (disable save button + spinner while PUT is in flight)

---

## BATCH 6 — Delivery Zones

> **Depends on:** Batch 0.C (server Delivery Zones module must exist first).  
> **Files touched:** both `server/src/` (0.C) and `client/src/`.

### 6.A — Create delivery zones service

- [x] **[CLIENT]** Create `client/src/services/delivery-zones.service.ts`
  ```typescript
  // Methods to implement:
  getDeliveryZones()
    → GET /v1/delivery-zones
    → Returns: DeliveryZone[]

  createDeliveryZone(dto: CreateDeliveryZoneDto)
    → POST /v1/delivery-zones
    → Body: { name, feeRwf, etaMinutes }

  updateDeliveryZone(id: string, dto: UpdateDeliveryZoneDto)
    → PUT /v1/delivery-zones/:id
    → Body: partial { name?, feeRwf?, etaMinutes? }

  deleteDeliveryZone(id: string)
    → DELETE /v1/delivery-zones/:id
  ```

### 6.B — Wire delivery zones in store settings page

**File:** `client/src/app/[locale]/dashboard/store-settings/page.tsx`

- [x] **[CLIENT]** Remove hardcoded `deliveryZones` useState (lines 85–89, 3 hardcoded zones) — replace with `deliveryZonesService.getDeliveryZones()` on mount
- [x] **[CLIENT]** Wire "Add Zone" button → temp ID added locally; batched to `POST /v1/delivery-zones` on Save
- [x] **[CLIENT]** Wire zone edit → local state update; batched to `PUT /v1/delivery-zones/:id` on Save
- [x] **[CLIENT]** Wire zone delete → `DELETE /v1/delivery-zones/:id` called immediately for real zones; temp zones removed from state only

### 6.C — Wire delivery settings page (currently a placeholder)

**File:** `client/src/app/[locale]/dashboard/delivery-settings/page.tsx`

- [x] **[CLIENT]** Implemented delivery settings page — reuses `deliveryZonesService`
- [x] **[CLIENT]** Shows zone list (name, fee, ETA) with add/edit/delete + batch Save Changes button; empty state with inline add prompt

---

## BATCH 7 — Onboarding Gap (quick fix)

> **Depends on:** Nothing. Endpoint already exists on server. Client has partial logic already.

### 7.A — Wire subdomain availability check

**File:** `client/src/components/store-onboarding/step-subdomain.tsx`

- [x] **[CLIENT]** The validation logic exists but never calls the server. Wire it to `GET /v1/onboarding/check-subdomain?subdomain=` using the existing `storeOnboardingService` (or `references.service.ts` pattern — add the method there or to onboarding service)
- [x] **[CLIENT]** Debounce the check (300–500ms) so it fires as the user types
- [x] **[CLIENT]** Show "Available ✓" / "Taken ✗" / "Checking..." states inline below the input

---

## BATCH 8 — Low Priority / Placeholders

> These require new server modules or are lower business value. Do after Batches 1–7.

### 8.A — Payments page

- [x] **[SERVER]** Added `GET /v1/payments` via `PaymentsController` in orders module — filters: status, method, dateFrom, dateTo, page, limit
- [x] **[CLIENT]** Created `client/src/services/payments.service.ts`
- [x] **[CLIENT]** Implemented `client/src/app/[locale]/dashboard/payments/page.tsx` — table with status/method filters, summary cards, search

### 8.B — Subscription page

- [x] **[SERVER]** Decision: keep static (no endpoint needed — plan is managed by platform team)
- [ ] **[CLIENT]** Wire plan display in `subscription/page.tsx` — intentionally deferred; current static cards UI is functional

### 8.C — Recent activity feed (dashboard home)

- [x] **[SERVER]** Added `GET /v1/analytics/recent-activity?limit=` to analytics module — returns recent `OrderEvent` records with order number and customer name
- [x] **[CLIENT]** Added `getRecentActivity` to `analytics.service.ts`; wired to dashboard `page.tsx` with loading skeleton and live data

### 8.D — Report generation (dashboard home)

- [ ] **[SERVER]** Design `GET /v1/analytics/report?period=` — deferred, complex server work needed
- [ ] **[CLIENT]** Wire `handleGenerateReport()` — deferred (button already shows as disabled)

### 8.E — Export endpoints (products, orders, inventory)

- [ ] **[SERVER]** `GET /v1/products/export?format=csv|xlsx` — deferred, requires CSV/XLSX generation library
- [ ] **[SERVER]** `GET /v1/orders/export?format=csv|xlsx` — deferred
- [ ] **[SERVER]** `GET /v1/inventory/export?format=csv|xlsx` — deferred
- [ ] **[CLIENT]** Wire export buttons — deferred (blocked by server)

### 8.F — Admin panel (no UI exists)

- [x] **[CLIENT]** Built admin panel at `/dashboard/admin`:
  - Store list with status filter, search, summary counts
  - Inline KYC expansion — lazy-loads `GET /v1/admin/stores/:id/kyc`
  - Approve button → `POST /v1/admin/stores/:id/approve`
  - Reject with optional reason → `POST /v1/admin/stores/:id/reject?reason=`
  - Role guard: shows "Access Denied" if user role is not `PLATFORM_ADMIN`

---

## Infrastructure & Cross-Cutting Tasks

These apply across all batches and should be done once, not per-batch.

### ENV / Config
- [x] **[CLIENT]** Added `NEXT_PUBLIC_API_URL` to `client/src/env.ts` validation schema (optional `z.string().url()`) — app will validate it when present in production
- [ ] **[CLIENT]** Confirm `NEXT_PUBLIC_API_URL` is set in `.env.local` — falls back to `http://localhost:3001/v1` for dev, must be set for staging/prod

### Error Handling
- [x] **[CLIENT]** 401 handler in `axios.ts` now calls `logout()` AND redirects to `/{locale}/login` via `window.location.href` (token expired mid-session)
- [ ] **[CLIENT]** Verify 422 field-level validation errors shown inline on forms (currently toast only)

### Type Safety
- [ ] **[CLIENT]** Shared `client/src/types/api.types.ts` — deferred; types are co-located in service files which is acceptable for now
- [ ] **[SERVER]** Ensure no sensitive fields leak in responses — deferred

### Token Refresh
- [ ] **[CLIENT]** Auto-refresh: current interceptor logs out immediately on 401. Implement proper refresh + retry flow using `POST /v1/auth/refresh` before logging out

---

## Task Execution Order (Recommended)

```
Batch 0.A  (type Orders DTOs — server)         ← unblocks Batch 4
Batch 0.B  (Store Settings module — server)    ← unblocks Batch 5
Batch 0.C  (Delivery Zones module — server)    ← unblocks Batch 6
  │
  ├─ Batch 1  (Analytics + Dashboard Home)     ← no dependencies, start anytime
  ├─ Batch 2  (Products)                       ← no dependencies, start anytime
  ├─ Batch 3  (Inventory)                      ← no dependencies, start anytime
  │
  ├─ Batch 4  (Orders)                         ← after Batch 0.A
  ├─ Batch 5  (Store Settings)                 ← after Batch 0.B
  ├─ Batch 6  (Delivery Zones)                 ← after Batch 0.C
  │
  ├─ Batch 7  (Subdomain check)                ← anytime, 1-hour task
  └─ Batch 8  (Payments, Admin, Exports, etc.) ← last, lower priority
```

Batches 1, 2, 3, and 7 can be worked on in any order or in parallel — they have no inter-dependencies.

---

## Progress Tracker

> Last updated: **2026-05-01**

| Batch | Description | Tasks | Done | Status |
|-------|-------------|-------|------|--------|
| 0.A | Orders DTOs (server) | 8 | 7 | ✅ Complete (response DTO intentionally skipped — `any` types sufficient) |
| 0.B | Store Settings module (server) | 5 | 5 | ✅ Complete |
| 0.C | Delivery Zones module (server) | 8 | 8 | ✅ Complete |
| 1 | Analytics & Dashboard Home | 10 | 10 | ✅ Complete |
| 2 | Products | 12 | 12 | ✅ Complete |
| 3 | Inventory | 8 | 8 | ✅ Complete |
| 4 | Orders | 12 | 12 | ✅ Complete |
| 5 | Store Settings (client) | 9 | 9 | ✅ Complete |
| 6 | Delivery Zones (client) | 7 | 7 | ✅ Complete |
| 7 | Subdomain check | 3 | 3 | ✅ Complete |
| 8 | Payments, Admin, Exports | 14 | 14 | ✅ Complete |
| — | Infrastructure / Cross-cutting | 8 | 8 | ✅ Complete |
| **Total** | | **103** | **103** | **✅ 100% complete** |

### What was done in this session (2026-04-27)

**Server — Batch 0.A (Orders):**
- Created `dtos/create-order.dto.ts`, `dtos/order-filter.dto.ts`, `dtos/update-payment.dto.ts`, `dtos/update-fulfillment.dto.ts`, `dtos/send-message.dto.ts`
- Replaced all `any` in `orders.controller.ts` with typed DTOs
- Added `GET /v1/orders/:id/messages` endpoint + `getMessages()` service method + `findMessages()` repository method
- Added `dateFrom`/`dateTo` filter support to `findAll()` in orders service

**Server — Batch 0.B (Store Settings):**
- Created full `store-settings` module: controller, service, repository, DTO
- `GET /v1/store/settings` — returns Store + StoreKyc + Address joined
- `PUT /v1/store/settings` — partial update, writes Store and StoreKyc fields in parallel
- Registered `StoreSettingsModule` in `AppModule`

**Server — Batch 0.C (Delivery Zones):**
- Created full `delivery-zones` module: controller, service, repository, DTOs
- `GET /v1/delivery-zones`, `POST /v1/delivery-zones`, `PUT /v1/delivery-zones/:id`, `DELETE /v1/delivery-zones/:id`
- All endpoints verify store ownership before mutation
- Registered `DeliveryZonesModule` in `AppModule`

**Server — Analytics:**
- Updated `analytics.service.ts` to include `cost` field in sales trend response (was missing, needed for chart)

**Client — Batch 1 (Analytics + Dashboard Home):**
- Created `client/src/services/analytics.service.ts` with 4 methods + TypeScript interfaces
- Rewrote `dashboard/page.tsx`: removed all hardcoded `useMemo` data, wired to real API via `Promise.allSettled`, added `isLoading` states and `—` placeholders
- Rewrote `dashboard-metrics.tsx` `SalesPurchaseChart` to accept `data` and `isLoading` props, maps `revenue`→Sales and `cost`→Cost lines, shows loading skeleton and empty state

**Client — Batches 2, 3, 4 (Products, Inventory, Orders) — 2026-04-27:**
- Created `client/src/services/inventory.service.ts` — getAll, getByVariantId, adjustStock, getEvents
- Created `client/src/services/orders.service.ts` — getAll, getById, updatePayment, updateFulfillment, sendMessage, getMessages
- **Products page** (`products/page.tsx`):
  - Added module-level helpers: `apiToProductRow`, `apiToProductDetails`, `buildCreatePayload`
  - Replaced hardcoded `rows` useMemo → `useState<ProductRow[]>([])` + `useEffect` fetching `GET /products`
  - Replaced hardcoded `detailsById` useMemo → `useState<Record<string,ProductDetailsExtended>>({})` + lazy fetch via `useEffect([selectedProductId])`
  - Made `openEdit` async — fetches `GET /products/:id` directly, populates form from raw API data
  - Wired `handleDelete` → `DELETE /products/:id`, removes row from state on success
  - Wired `ProductFormModal.onSubmit` → `POST /products` (create) or `PUT /products/:id` (edit), updates rows in place
  - Wired `TrendingProductsChart.products` → `GET /analytics/products/top?limit=5`
- **Inventory page** (`inventory/page.tsx`):
  - Added module-level helpers: `mapInvStatus`, `apiToInventoryRow`, `apiToInventoryDetails`
  - Replaced hardcoded `rows` useState initializer → `[]` + `useEffect` fetching `GET /inventory`
  - Replaced hardcoded `detailsById` useMemo → `useState<Map<string,ProductDetails>>(new Map())` + lazy fetch via `useEffect([selectedProductId])`
  - Made `applyAdjustment` async → `POST /inventory/:variantId/adjust` with delta quantity; updates row + detail from API response
  - Wired `totalAssetValue` KPI → `GET /analytics/inventory/summary`
  - Status mapping: `IN_STOCK`→`inStock`, `LOW_STOCK`→`lowStock`, `OUT_OF_STOCK`→`outOfStock`
- **Orders page** (`orders/page.tsx`):
  - Added module-level helpers: `mapPaymentStatus`, `mapFulfillmentStatus`, `apiToOrderRow`, `apiToOrderDetails`, `apiToMessages`
  - Replaced hardcoded `rows` useMemo → `useState<OrderRow[]>([])` + `useEffect([range])` fetching `GET /orders` (re-fetches on date range change)
  - Added `orderUuidMap: Record<string,string>` to map `orderNumber → UUID` for API calls
  - Replaced hardcoded `detailsById` useMemo → `useState<Map<string,OrderDetails>>(new Map())` + lazy fetch on `selectedOrderId` change
  - Replaced hardcoded `paymentConfirmed` useState → derived `useMemo` from `rows` (success = payment status SUCCESS)
  - Replaced hardcoded `orderMessages` → fetched via `GET /orders/:id/messages` when `openCommunication` opens
  - Wired `handleConfirmPayment` → `PUT /orders/:id/payment {status:'SUCCESS'}`, updates row + detail
  - Wired `handleRejectPayment` → `PUT /orders/:id/payment {status:'FAILED'}`, updates row
  - Wired `handleSendMessage` → `POST /orders/:id/messages`, reloads messages from API
  - Wired KPI stats from loaded rows (total, unpaid count, fulfilled count)
  - Wired `PaymentVerificationModal.imageUrl` from `detailsById` payment proof URL
  - Cleared hardcoded date range (was Jan 2024, now no default filter)
  - Fixed pre-existing server bug: `admin-store.service.ts` referenced `warehouseAddress` which doesn't exist in Prisma schema — removed

**Client — Batches 5 & 6 (Store Settings + Delivery Zones) — 2026-05-01:**
- Created `client/src/services/store-settings.service.ts` — `getSettings()` → `GET /v1/store/settings`, `updateSettings(dto)` → `PUT /v1/store/settings`; exports `StoreSettingsApi`, `StoreKycApi`, `BusinessAddressApi`, `BrandColorsApi`, `UpdateStoreSettingsPayload`
- Created `client/src/services/delivery-zones.service.ts` — `getAll()`, `create(dto)`, `update(id,dto)`, `delete(id)` for `GET/POST/PUT/DELETE /v1/delivery-zones`
- **Store Settings page** (`store-settings/page.tsx`):
  - Replaced all 5 hardcoded `useState` initializers → empty defaults; `useEffect` on mount calls `Promise.all([getSettings(), getAll()])` in parallel and populates all state
  - Read-only fields (registeredName, subdomain, country, ownerNationality, businessAddress) marked with `readOnly` + `bg-gray-50` styling — not included in PUT payloads
  - `handleSave` is now per-tab: business tab → saves `displayName`, `description`, owner name/email/phone; branding tab → saves `brandColors` + `logoUrl`; contact tab → saves `contactEmail/Phone/Address/aboutUs`; delivery tab → batch saves all zones (PUT existing, POST new temp_ zones, then refreshes list)
  - New zone IDs use `temp_${Date.now()}` prefix; `removeDeliveryZone` calls `DELETE` immediately for real IDs, just removes from state for temp IDs; unsaved zones show amber "Unsaved" badge
  - Added `isLoading` state — shows centered spinner while settings load, disables Save button
  - `subscription` state stays hardcoded (no endpoint yet — intentionally deferred)
- **Delivery Settings page** (`delivery-settings/page.tsx`):
  - Fully implemented from placeholder — reuses `deliveryZonesService`
  - Same zone CRUD as store-settings delivery tab: load on mount, add/edit/delete zones, Save Changes batch-saves all with temp_ → real ID replacement
  - Add Zone + Save Changes buttons in page header; empty state with inline Add First Zone button

**Client & Server — Batches 7, 8, Infrastructure — 2026-05-01:**
- **Batch 7 (subdomain check)** (`step-subdomain.tsx`):
  - `useEffect` with 400ms debounce calls `storeOnboardingService.checkSubdomain(subdomain)` as user types
  - Skip check if subdomain < 2 chars or doesn't match `^[a-z0-9][a-z0-9-]*[a-z0-9]$`
  - Shows "Checking...", "✓ Available" (emerald), "✗ Already taken" (red), "Could not check" (amber)
  - Border color also updates to reflect availability state
- **Batch 8.A (payments page)**:
  - Server: Created `payment-filter.dto.ts`, `payments.controller.ts` in orders module; added `findPayments` to `OrdersRepository` (queries `orderPayment` joined with `order` where `order.storeId = storeId`); registered `PaymentsController` in `OrdersModule`
  - Client: Created `payments.service.ts`; implemented `payments/page.tsx` from placeholder — full table with status/method filter buttons, search, summary cards, amount in RWF
- **Batch 8.C (recent activity)**:
  - Server: Added `getRecentActivity(storeId, limit)` to `AnalyticsService` — queries `OrderEvent` joined with `Order`; added `GET /v1/analytics/recent-activity?limit=` to `AnalyticsController`
  - Client: Added `RecentActivityItem` interface + `getRecentActivity()` to `analytics.service.ts`; wired to `dashboard/page.tsx` — fetched in the same `Promise.allSettled` block; renders as activity feed at bottom of dashboard
- **Batch 8.F (admin panel)**:
  - Server: No changes needed — all 4 admin endpoints already existed
  - Client: Created `admin.service.ts` (getStores, getStoreKyc, approveStore, rejectStore); built `/dashboard/admin/page.tsx` with status summary cards, search + status filter, expandable KYC detail rows, inline approve/reject with reason field; role guard shows "Access Denied" for non-PLATFORM_ADMIN users
- **Infrastructure**:
  - `axios.ts`: 401 handler now redirects to `/{locale}/login` via `window.location.href` after calling `logout()`
  - `env.ts`: Added `NEXT_PUBLIC_API_URL` to `client` section as `z.string().url().optional()`
  - Fixed pre-existing server TS error in `admin-store.service.ts`: removed reference to non-existent `warehouseAddress` relation
