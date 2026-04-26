import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryZonesRepository } from '../repositories/delivery-zones.repository';
import { CreateDeliveryZoneDto } from '../dtos/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from '../dtos/update-delivery-zone.dto';

@Injectable()
export class DeliveryZonesService {
    constructor(private readonly deliveryZonesRepository: DeliveryZonesRepository) {}

    async findAll(storeId: string) {
        return this.deliveryZonesRepository.findAll(storeId);
    }

    async create(storeId: string, dto: CreateDeliveryZoneDto) {
        return this.deliveryZonesRepository.create({
            name: dto.name,
            feeRwf: dto.feeRwf,
            etaMinutes: dto.etaMinutes,
            store: { connect: { id: storeId } },
        });
    }

    async update(id: string, storeId: string, dto: UpdateDeliveryZoneDto) {
        const zone = await this.deliveryZonesRepository.findById(id, storeId);
        if (!zone) throw new NotFoundException(`Delivery zone ${id} not found`);

        await this.deliveryZonesRepository.update(id, storeId, dto);
        return this.deliveryZonesRepository.findById(id, storeId);
    }

    async delete(id: string, storeId: string) {
        const zone = await this.deliveryZonesRepository.findById(id, storeId);
        if (!zone) throw new NotFoundException(`Delivery zone ${id} not found`);

        await this.deliveryZonesRepository.delete(id, storeId);
        return { message: 'Delivery zone deleted successfully' };
    }
}
