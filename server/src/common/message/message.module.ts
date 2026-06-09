import { existsSync } from 'fs';
import { join } from 'path';

import { Module } from '@nestjs/common';
import {
    AcceptLanguageResolver,
    HeaderResolver,
    I18nModule,
} from 'nestjs-i18n';

import { MessageService } from './services/message.service';

function resolveLanguagesPath(): string {
    const candidates = [
        join(__dirname, '../../languages/'),
        join(process.cwd(), 'dist/languages'),
        join(process.cwd(), 'src/languages'),
    ];

    return candidates.find(path => existsSync(path)) ?? candidates[0];
}

@Module({
    imports: [
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: resolveLanguagesPath(),
                watch: true,
            },
            resolvers: [
                AcceptLanguageResolver,
                new HeaderResolver(['accept-language']),
            ],
        }),
    ],
    exports: [MessageService],
    providers: [MessageService],
})
export class MessageModule {}
