import { Module } from '@nestjs/common';

import { FilePublicController } from './controllers/files.controller';
import { FileService } from './services/files.service';

@Module({
    controllers: [FilePublicController],
    imports: [],
    providers: [FileService],
    exports: [FileService],
})
export class FileModule {}
