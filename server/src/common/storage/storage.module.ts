import { Global, Module } from '@nestjs/common'
import { LocalStorageDriver } from './drivers/local.storage.driver'
import { S3StorageDriver } from './drivers/s3.storage.driver'
import { StorageService } from './storage.service'

@Global()
@Module({
    providers: [LocalStorageDriver, S3StorageDriver, StorageService],
    exports: [StorageService, LocalStorageDriver],
})
export class StorageModule {}
