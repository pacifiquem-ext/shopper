import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersRepository } from '../repositories/orders.repository';
import { PaymentFilterDto } from '../dtos/payment-filter.dto';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';
import { StoreGuard } from '../../../common/request/guards/store.guard';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAccessGuard, StoreGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly ordersRepository: OrdersRepository) {}

    @Get()
    @ApiOperation({ summary: 'List all payments for the store with pagination and filters' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payments retrieved successfully' })
    async findAll(@StoreId() storeId: string, @Query() filters: PaymentFilterDto) {
        const { page = 1, limit = 20, status, method, dateFrom, dateTo } = filters;
        const skip = (page - 1) * limit;

        const { payments, total } = await this.ordersRepository.findPayments(storeId, {
            skip,
            take: limit,
            status,
            method,
            dateFrom,
            dateTo,
        });

        return {
            data: payments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
