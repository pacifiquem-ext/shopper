import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { PublicRoute } from 'src/common/request/decorators/request.public.decorator';

@ApiExcludeController()
@Controller({ path: '', version: VERSION_NEUTRAL })
export class RootController {
    @Get()
    @PublicRoute()
    public getRoot() {
        return {
            service: 'shopper_server',
            message:
                'REST API only. Open the Next.js app (pnpm dev in client/) in the browser for pages such as /en/dashboard.',
            health: '/health',
        };
    }
}
