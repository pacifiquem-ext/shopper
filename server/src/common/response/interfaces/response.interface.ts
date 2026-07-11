import { ClassConstructor } from 'class-transformer';
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
    ItemsPage,
    OffsetPage,
    PaginationMetadata,
} from '@onlineshop/shared';

/** @deprecated Prefer PaginationMetadata from @onlineshop/shared */
export type IPaginationMetadata = PaginationMetadata;

/** @deprecated Prefer ApiSuccessResponse from @onlineshop/shared */
export type IApiSuccessResponse<T> = ApiSuccessResponse<T>;

/** @deprecated Prefer ItemsPage from @onlineshop/shared */
export type IApiPaginatedData<T> = ItemsPage<T>;

/** @deprecated Prefer ApiSuccessResponse<ItemsPage<T>> */
export interface IApiPaginatedResponse<T> extends ApiSuccessResponse<ItemsPage<T>> {}

/** @deprecated Prefer ApiErrorResponse from @onlineshop/shared */
export type IApiErrorResponse = ApiErrorResponse;

export interface IGenericResponse {
    success: boolean;
    message: string;
}

export interface IResponseDocOptions<T> {
    httpStatus: number;
    messageKey: string;
    serialization?: ClassConstructor<T>;
}

export interface IGenericResponseOptions {
    httpStatus: number;
    messageKey: string;
}

export type { ApiSuccessResponse, ApiErrorResponse, OffsetPage, ItemsPage, PaginationMetadata };
