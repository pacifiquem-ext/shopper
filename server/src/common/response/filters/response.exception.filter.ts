import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

import { MessageService } from 'src/common/message/services/message.service';

import { IApiErrorResponse } from '../interfaces/response.interface';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ResponseExceptionFilter.name);

    constructor(
        private readonly messageService: MessageService,
        private readonly configService: ConfigService
    ) {
        this.initializeSentry();
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string;
        let validationMessages: string[] | undefined;

        if (exception instanceof BadRequestException) {
            const exceptionResponse = exception.getResponse() as any;
            const exceptionMessage = exceptionResponse.message;

            if (Array.isArray(exceptionMessage)) {
                // Handle validation errors
                validationMessages =
                    this.translateValidationMessages(exceptionMessage);
                message = this.messageService.translateKey(
                    ['http', 'error', statusCode],
                    {
                        defaultValue: 'Bad Request',
                    }
                );
            } else {
                // Handle single error message
                message = this.messageService.translate(
                    exceptionMessage || 'http.error.400',
                    {
                        defaultValue: exceptionMessage || 'Bad Request',
                    }
                );
            }
        } else if (exception instanceof HttpException) {
            // Handle HTTP exceptions
            message = this.messageService.translate(exception.message, {
                defaultValue: exception.message,
            });
        } else {
            // Handle unknown errors
            message = this.messageService.translateKey(
                ['http', 'error', statusCode],
                {
                    defaultValue: 'Internal Server Error',
                }
            );
        }

        const errorResponse: IApiErrorResponse = {
            statusCode,
            message,
            timestamp: new Date().toISOString(),
        };

        if (validationMessages) {
            errorResponse.error = validationMessages;
        }

        if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `${request.method} ${request.url} - ${statusCode}: ${message}`,
                exception instanceof Error ? exception.stack : undefined
            );

            this.captureSentryException(exception, request, errorResponse);
        } else if (statusCode >= HttpStatus.BAD_REQUEST) {
            this.logger.warn(
                `${request.method} ${request.url} - ${statusCode}: ${message}`
            );
        }

        response.status(statusCode).json(errorResponse);
    }

    private translateValidationMessages(messages: string[]): string[] {
        return messages.map(msg => {
            try {
                const [key, paramsString] = msg.split('|');
                const args = paramsString ? JSON.parse(paramsString) : {};

                return this.messageService.translate(key, { args });
            } catch {
                return this.messageService.translate(msg, {
                    defaultValue: msg,
                });
            }
        });
    }

    private initializeSentry(): void {
        const sentryDsn = this.configService.get<string>('sentry.dsn');
        if (sentryDsn) {
            Sentry.init({
                dsn: sentryDsn,
                environment: this.configService.get<string>('app.env'),
                tracesSampleRate: 1.0,
            });
        }
    }

    private captureSentryException(
        exception: unknown,
        request: Request,
        errorResponse: IApiErrorResponse
    ): void {
        Sentry.withScope(scope => {
            scope.setExtra('requestUrl', request.url);
            scope.setExtra('method', request.method);
            scope.setExtra('timestamp', errorResponse.timestamp);
            scope.setExtra('body', this.redactSensitiveBody(request.body));
            scope.setExtra('query', request.query);
            scope.setExtra('params', request.params);
            scope.setExtra('headers', this.sanitizeHeaders(request.headers));

            if (exception instanceof Error) {
                Sentry.captureException(exception);
            } else {
                Sentry.captureMessage(errorResponse.message);
            }
        });
    }

    private redactSensitiveBody(body: unknown): unknown {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return body;
        }

        const sensitiveKeys = new Set([
            'password',
            'newPassword',
            'otpCode',
            'refreshToken',
            'token',
        ]);

        const redacted: Record<string, unknown> = {
            ...(body as Record<string, unknown>),
        };
        for (const key of Object.keys(redacted)) {
            if (sensitiveKeys.has(key)) {
                redacted[key] = '[REDACTED]';
            }
        }
        return redacted;
    }

    private sanitizeHeaders(headers: any): any {
        const sanitized = { ...headers };
        delete sanitized.authorization;
        delete sanitized.cookie;
        return sanitized;
    }
}
