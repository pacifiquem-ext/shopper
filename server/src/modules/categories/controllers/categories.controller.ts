import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PublicRoute } from '../../../common/request/decorators/request.public.decorator';
import { AllowedRoles } from '../../../common/request/decorators/request.role.decorator';
import { CategoriesService } from '../services/categories.service';
import {
    CreateProductCategoryDto,
    UpdateProductCategoryDto,
} from '../dtos/category.dto';

@ApiTags('Categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @PublicRoute()
    @Get()
    @ApiOperation({ summary: 'List active product categories' })
    async listPublic() {
        return this.categoriesService.listPublic();
    }
}

@ApiTags('Admin / Categories')
@ApiBearerAuth()
@AllowedRoles([UserRole.PLATFORM_ADMIN])
@Controller({ path: 'admin/categories', version: '1' })
export class AdminCategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    @ApiOperation({ summary: 'Admin list all product categories' })
    async listAdmin() {
        return this.categoriesService.listAdmin();
    }

    @Post()
    @ApiOperation({ summary: 'Create product category with attribute defs' })
    @ApiResponse({ status: 201 })
    async create(@Body() dto: CreateProductCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update product category' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateProductCategoryDto,
    ) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product category' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriesService.remove(id);
    }
}
