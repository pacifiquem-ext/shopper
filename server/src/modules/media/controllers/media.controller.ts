import {
    Controller,
    Get,
    Header,
    NotFoundException,
    Param,
    Post,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'
import { memoryStorage } from 'multer'
import { PublicRoute } from '../../../common/request/decorators/request.public.decorator'
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard'
import { StorageService } from '../../../common/storage/storage.service'
import type { StoragePurpose } from '../../../common/storage/storage.types'
import { UploadImageQueryDto } from '../dtos/upload-image.dto'

@ApiTags('Media')
@Controller({ path: 'media', version: '1' })
export class MediaController {
    constructor(private readonly storage: StorageService) {}

    @Post('upload')
    @UseGuards(JwtAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload an image (product / proof / logo)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 6_000_000 },
        }),
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Query() query: UploadImageQueryDto,
    ) {
        if (!file?.buffer?.length) {
            return { error: 'file required' }
        }
        const purpose = (query.purpose || 'general') as StoragePurpose
        return this.storage.uploadImage(
            file.buffer,
            purpose,
            file.originalname,
        )
    }

    @PublicRoute()
    @Post('upload/public')
    @ApiOperation({
        summary: 'Public image upload (payment proofs for guest buyers)',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 4_000_000 },
        }),
    )
    async uploadPublic(
        @UploadedFile() file: Express.Multer.File,
        @Query() query: UploadImageQueryDto,
    ) {
        if (!file?.buffer?.length) {
            return { error: 'file required' }
        }
        // Guests may only upload proof images publicly.
        const purpose: StoragePurpose =
            query.purpose === 'proof' ? 'proof' : 'proof'
        return this.storage.uploadImage(
            file.buffer,
            purpose,
            file.originalname,
        )
    }

    @PublicRoute()
    @Get('file')
    @ApiOperation({ summary: 'Serve a local storage file by key' })
    @Header('Cache-Control', 'public, max-age=86400')
    async serve(@Query('key') key: string, @Res() res: Response) {
        const clean = (key || '').replace(/^\/+/, '')
        if (!clean || clean.includes('..')) {
            throw new NotFoundException('File not found')
        }
        const buf = await this.storage.readLocal(clean)
        if (!buf) {
            throw new NotFoundException('File not found')
        }
        const lower = clean.toLowerCase()
        const type = lower.endsWith('.png')
            ? 'image/png'
            : lower.endsWith('.webp')
              ? 'image/webp'
              : 'image/jpeg'
        res.setHeader('Content-Type', type)
        res.send(buf)
    }
}
