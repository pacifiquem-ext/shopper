import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
    constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
        super(message, status);
    }
}

export class ProductNotFoundException extends DomainException {
    constructor(productId?: string) {
        super(
            productId
                ? `Product with ID ${productId} not found`
                : 'Product not found',
            HttpStatus.NOT_FOUND,
        );
    }
}

export class ProductVariantNotFoundException extends DomainException {
    constructor(variantId?: string) {
        super(
            variantId
                ? `Product variant with ID ${variantId} not found`
                : 'Product variant not found',
            HttpStatus.NOT_FOUND,
        );
    }
}

export class InsufficientStockException extends DomainException {
    constructor(available: number, requested: number) {
        super(
            `Insufficient stock. Available: ${available}, Requested: ${requested}`,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class InvalidOrderStateException extends DomainException {
    constructor(currentState: string, attemptedAction: string) {
        super(
            `Cannot ${attemptedAction} order in ${currentState} state`,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class OrderNotFoundException extends DomainException {
    constructor(orderId?: string) {
        super(
            orderId
                ? `Order with ID ${orderId} not found`
                : 'Order not found',
            HttpStatus.NOT_FOUND,
        );
    }
}

export class InventoryNotFoundException extends DomainException {
    constructor(variantId?: string) {
        super(
            variantId
                ? `Inventory record for variant ${variantId} not found`
                : 'Inventory record not found',
            HttpStatus.NOT_FOUND,
        );
    }
}

export class UnauthorizedStoreAccessException extends DomainException {
    constructor() {
        super(
            'You do not have access to this store',
            HttpStatus.FORBIDDEN,
        );
    }
}

export class InvalidPaymentStatusException extends DomainException {
    constructor(status: string) {
        super(
            `Invalid payment status: ${status}`,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class InvalidFulfillmentStatusException extends DomainException {
    constructor(status: string) {
        super(
            `Invalid fulfillment status: ${status}`,
            HttpStatus.BAD_REQUEST,
        );
    }
}
