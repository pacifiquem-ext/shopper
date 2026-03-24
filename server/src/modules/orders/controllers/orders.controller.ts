import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { AuthUser } from '../../../common/request/decorators/request.user.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Order created successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async create(
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: any,
    ) {
        return this.ordersService.create(storeId, userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with filters and pagination' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Orders retrieved successfully',
    })
    async findAll(@StoreId() storeId: string, @Query() filters: any) {
        return this.ordersService.findAll(storeId, filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Order retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Order not found',
    })
    async findById(@Param('id') id: string, @StoreId() storeId: string) {
        return this.ordersService.findById(id, storeId);
    }

    @Put(':id/payment')
    @ApiOperation({ summary: 'Update order payment status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment updated successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Order not found',
    })
    async updatePayment(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: any,
    ) {
        return this.ordersService.updatePayment(id, storeId, userId, dto);
    }

    @Put(':id/fulfillment')
    @ApiOperation({ summary: 'Update order fulfillment status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Fulfillment updated successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Order not found',
    })
    async updateFulfillment(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: any,
    ) {
        return this.ordersService.updateFulfillment(id, storeId, userId, dto);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Send message to customer' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Message sent successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Order not found',
    })
    async sendMessage(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: any,
    ) {
        return this.ordersService.sendMessage(id, storeId, userId, dto);
    }
}
