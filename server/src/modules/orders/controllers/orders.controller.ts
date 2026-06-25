import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    Res,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
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
import { StoreGuard } from '../../../common/request/guards/store.guard';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderFilterDto } from '../dtos/order-filter.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { UpdateFulfillmentDto } from '../dtos/update-fulfillment.dto';
import { SendMessageDto } from '../dtos/send-message.dto';
import { IsArray, IsString } from 'class-validator';

class MarkNotificationsReadDto {
    @IsArray()
    @IsString({ each: true })
    ids: string[];
}

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtAccessGuard, StoreGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    async create(
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: CreateOrderDto,
    ) {
        return this.ordersService.create(storeId, userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with filters and pagination' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Orders retrieved successfully' })
    async findAll(@StoreId() storeId: string, @Query() filters: OrderFilterDto) {
        return this.ordersService.findAll(storeId, filters);
    }

    @Get('notifications')
    @ApiOperation({ summary: 'Get unread order notifications for this store' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Notifications retrieved successfully' })
    async getNotifications(@StoreId() storeId: string, @Query('limit') limit?: string) {
        const resolved = limit ? Math.max(1, Math.min(50, Number(limit))) : 10;
        return this.ordersService.getNotifications(storeId, resolved);
    }

    @Put('notifications/read')
    @ApiOperation({ summary: 'Mark notifications as read' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Notifications marked read' })
    async markNotificationsRead(@StoreId() storeId: string, @Body() dto: MarkNotificationsReadDto) {
        return this.ordersService.markNotificationsRead(storeId, dto.ids ?? []);
    }

    @Get('export')
    @ApiOperation({ summary: 'Export orders as CSV' })
    @ApiResponse({ status: HttpStatus.OK, description: 'CSV file returned' })
    async exportCsv(
        @StoreId() storeId: string,
        @Res() res: Response,
    ) {
        const csv = await this.ordersService.exportCsv(storeId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        res.send(csv);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async findById(@Param('id') id: string, @StoreId() storeId: string) {
        return this.ordersService.findById(id, storeId);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Get all messages for an order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Messages retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async getMessages(@Param('id') id: string, @StoreId() storeId: string) {
        return this.ordersService.getMessages(id, storeId);
    }

    @Put(':id/payment')
    @ApiOperation({ summary: 'Update order payment status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async updatePayment(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: UpdatePaymentDto,
    ) {
        return this.ordersService.updatePayment(id, storeId, userId, dto);
    }

    @Put(':id/fulfillment')
    @ApiOperation({ summary: 'Update order fulfillment status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Fulfillment updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async updateFulfillment(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: UpdateFulfillmentDto,
    ) {
        return this.ordersService.updateFulfillment(id, storeId, userId, dto);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Send message to customer' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Message sent successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async sendMessage(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: SendMessageDto,
    ) {
        return this.ordersService.sendMessage(id, storeId, userId, dto);
    }
}
