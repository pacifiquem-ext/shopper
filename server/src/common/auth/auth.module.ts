import { Module } from '@nestjs/common';

import { AuthPublicController } from './controllers/auth.public.controller';
import { AuthService } from './services/auth.service';

@Module({
    controllers: [AuthPublicController],
    imports: [],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
