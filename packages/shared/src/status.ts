/** Domain status values — keep in sync with Prisma enums / server constants. */

export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const

export const StockStatus = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
} as const

export const InventoryEventType = {
  CREATED: 'CREATED',
  RESTOCKED: 'RESTOCKED',
  SOLD: 'SOLD',
  ADJUSTED: 'ADJUSTED',
  RETURNED: 'RETURNED',
} as const

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export const PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  MOBILE_MONEY: 'MOBILE_MONEY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD',
} as const

export const FulfillmentStatus = {
  UNFULFILLED: 'UNFULFILLED',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
} as const

export const OrderEventType = {
  CREATED: 'CREATED',
  PAID: 'PAID',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export const MessageSender = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const

export const UserRole = {
  STORE_OWNER: 'STORE_OWNER',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const

export const StoreStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const

export const ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const PromotionScope = {
  PLATFORM: 'PLATFORM',
  STORE: 'STORE',
} as const

export const PromotionType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
} as const

export const PromotionStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  EXPIRED: 'EXPIRED',
} as const

export const AttributeFieldType = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  SELECT: 'SELECT',
  MULTISELECT: 'MULTISELECT',
} as const

export const AttributeAppliesTo = {
  PRODUCT: 'PRODUCT',
  VARIANT: 'VARIANT',
} as const

export type ProductStatusType = (typeof ProductStatus)[keyof typeof ProductStatus]
export type StockStatusType = (typeof StockStatus)[keyof typeof StockStatus]
export type InventoryEventTypeType =
  (typeof InventoryEventType)[keyof typeof InventoryEventType]
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]
export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod]
export type FulfillmentStatusType =
  (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus]
export type OrderEventTypeType = (typeof OrderEventType)[keyof typeof OrderEventType]
export type MessageSenderType = (typeof MessageSender)[keyof typeof MessageSender]
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]
export type StoreStatusType = (typeof StoreStatus)[keyof typeof StoreStatus]
export type ReviewStatusType = (typeof ReviewStatus)[keyof typeof ReviewStatus]
export type PromotionScopeType = (typeof PromotionScope)[keyof typeof PromotionScope]
export type PromotionTypeType = (typeof PromotionType)[keyof typeof PromotionType]
export type PromotionStatusType =
  (typeof PromotionStatus)[keyof typeof PromotionStatus]
export type AttributeFieldTypeType =
  (typeof AttributeFieldType)[keyof typeof AttributeFieldType]
export type AttributeAppliesToType =
  (typeof AttributeAppliesTo)[keyof typeof AttributeAppliesTo]
