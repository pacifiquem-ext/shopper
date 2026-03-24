export type StockStatus = 'inStock' | 'lowStock' | 'outOfStock'

export type PaymentStatus = 'pending' | 'success'

export type FulfillmentStatus = 'fulfilled' | 'unfulfilled'

export type ProductStatus = 'active' | 'draft' | 'archived'

export type ProductEventType = 'created' | 'stockAdjusted' | 'sold' | 'restocked'

export type OrderEventType =
  | 'created'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type ProductEvent = {
  id: string
  type: ProductEventType
  at: string
  title: string
  description?: string
}

export type OrderEvent = {
  id: string
  type: OrderEventType
  at: string
  title: string
  description?: string
}

export type InventoryRow = {
  id: string
  name: string
  category: string
  sku: string
  vendor: string
  stock: number
  status: StockStatus
}

export type ProductDetails = {
  id: string
  name: string
  sku: string
  category: string
  vendor: string
  status: StockStatus
  stock: {
    onHand: number
    reserved: number
    available: number
    reorderPoint: number
    updatedAt: string
  }
  pricing: {
    price: string
    cost: string
    margin: string
  }
  shipping: {
    weight: string
    deliveryEligible: string
  }
  staff: {
    createdBy: string
    updatedBy: string
  }
  notes: {
    internalNote: string
  }
  events: ProductEvent[]
}

export type OrderLineItem = {
  id: string
  name: string
  sku: string
  quantity: number
  unitPrice: string
  total: string
}

export type OrderRow = {
  id: string
  date: string
  customer: string
  payment: PaymentStatus
  total: string
  delivery: string
  items: string
  fulfillment: FulfillmentStatus
}

export type OrderDetails = {
  id: string
  placedAt: string
  customer: {
    name: string
    phone: string
    email: string
  }
  payment: {
    status: PaymentStatus
    method: string
    reference: string
    paidAt: string
  }
  fulfillment: {
    status: FulfillmentStatus
    deliveryMethod: string
    courierName: string
    driverName: string
    assignedAt: string
    deliveredAt: string
    trackingNumber: string
  }
  addresses: {
    shipping: string
    billing: string
  }
  staff: {
    createdBy: string
    packedBy: string
    deliveredBy: string
    store: string
  }
  totals: {
    subtotal: string
    deliveryFee: string
    discount: string
    tax: string
    total: string
  }
  items: OrderLineItem[]
  notes: {
    customerNote: string
    internalNote: string
  }
  events: OrderEvent[]
}

export type ProductVariant = {
  id: string
  title: string
  sku: string
  color?: { name: string; hex: string }
  size?: string
  stock: number
  price: string
}

export type ProductRow = {
  id: string
  name: string
  vendor: string
  category: string
  status: ProductStatus
  priceRange: string
  totalStock: number
  updatedAt: string
  primaryImageUrl?: string
  variantsCount: number
}

export type ProductDetailsExtended = {
  id: string
  name: string
  vendor: string
  category: string
  status: ProductStatus
  description: string
  tags: string[]
  images: string[]
  variants: ProductVariant[]
  pricing: {
    priceFrom: string
    priceTo: string
    cost?: string
    margin?: string
    compareAt?: string
  }
  delivery: {
    enabled?: boolean
    location?: string
    price?: string
  }
  staff: {
    createdBy: string
    updatedBy: string
  }
  notes: {
    internalNote?: string
  }
  updatedAt: string
}

export type InventoryTab = 'all' | 'inStock' | 'lowStock' | 'outOfStock'

export type OrdersTab = 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'closed'

export type ProductsTab = 'all' | 'active' | 'draft' | 'archived'

export type InventoryFilters = {
  vendor: string
  category: string
  status: StockStatus | 'any'
  sku: string
  stockRange: [number, number]
}

export type ProductFilters = {
  vendor: string
  category: string
  status: ProductStatus | 'any'
  minStock: number | null
  maxStock: number | null
}
