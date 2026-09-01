import { Injectable } from '@nestjs/common'
import type { Request } from 'express'
import geoip from 'geoip-lite'
import { UAParser } from 'ua-parser-js'

import { DatabaseService } from '../../../common/database/services/database.service'
import {
    applySignal,
    emptyAffinity,
    type ShopperAffinity,
    type ShopperContext,
    type ShopperSignal,
} from '../discovery/shopper-affinity'

export const SHOPPER_VISITOR_COOKIE = 'shopper_vid'
export const SHOPPER_VISITOR_HEADER = 'x-shopper-visitor'

@Injectable()
export class ShopperProfileService {
    constructor(private readonly prisma: DatabaseService) {}

    visitorIdFromRequest(req: Request, explicit?: string | null): string | null {
        const header = req.headers[SHOPPER_VISITOR_HEADER]
        const fromHeader = Array.isArray(header) ? header[0] : header
        const cookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[
            SHOPPER_VISITOR_COOKIE
        ]
        const raw = explicit?.trim() || fromHeader?.trim() || cookie?.trim() || ''
        return raw && raw.length <= 80 ? raw : null
    }

    contextFromRequest(req: Request): ShopperContext {
        const forwarded = req.headers['x-forwarded-for']
        const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded
        const ip = (forwardedIp?.split(',')[0] || req.ip || req.socket?.remoteAddress || '')
            .replace('::ffff:', '')
            .trim()
        const geo = ip && ip !== '127.0.0.1' && ip !== '::1' ? geoip.lookup(ip) : null
        const ua = req.headers['user-agent'] || ''
        const device = new UAParser(ua).getDevice().type
        return {
            country: geo?.country ?? null,
            region: geo?.region ?? null,
            city: geo?.city ?? null,
            deviceType:
                device === 'mobile' || device === 'tablet' || device === 'desktop'
                    ? device
                    : 'desktop',
        }
    }

    async loadAffinity(visitorId: string | null | undefined): Promise<{
        visitorId: string | null
        affinity: ShopperAffinity
        context: ShopperContext
    }> {
        if (!visitorId) {
            return { visitorId: null, affinity: emptyAffinity(), context: {} }
        }
        const row = await this.prisma.shopperProfile.findUnique({
            where: { visitorId },
        })
        if (!row) {
            return { visitorId, affinity: emptyAffinity(), context: {} }
        }
        return {
            visitorId,
            affinity: this.parseAffinity(row.affinity),
            context: {
                country: row.country,
                region: row.region,
                city: row.city,
                deviceType:
                    row.deviceType === 'mobile' ||
                    row.deviceType === 'tablet' ||
                    row.deviceType === 'desktop'
                        ? row.deviceType
                        : null,
            },
        }
    }

    async ingest(
        visitorId: string,
        events: ShopperSignal[],
        context: ShopperContext,
    ): Promise<ShopperAffinity> {
        const existing = await this.prisma.shopperProfile.findUnique({
            where: { visitorId },
        })
        let affinity = existing ? this.parseAffinity(existing.affinity) : emptyAffinity()
        for (const event of events) {
            affinity = applySignal(affinity, event)
        }

        const profile = existing
            ? await this.prisma.shopperProfile.update({
                  where: { id: existing.id },
                  data: {
                      affinity: affinity as object,
                      country: context.country ?? existing.country,
                      region: context.region ?? existing.region,
                      city: context.city ?? existing.city,
                      deviceType: context.deviceType ?? existing.deviceType,
                      lastSeenAt: new Date(),
                  },
              })
            : await this.prisma.shopperProfile.create({
                  data: {
                      visitorId,
                      affinity: affinity as object,
                      country: context.country,
                      region: context.region,
                      city: context.city,
                      deviceType: context.deviceType,
                  },
              })

        if (events.length > 0) {
            await this.prisma.shopperEvent.createMany({
                data: events.map((event) => ({
                    profileId: profile.id,
                    type: event.type,
                    query: event.query ?? null,
                    productId: event.productId ?? null,
                    storeId: event.storeId ?? null,
                    category: event.category ?? null,
                })),
            })
        }

        return affinity
    }

    private parseAffinity(value: unknown): ShopperAffinity {
        const fallback = emptyAffinity()
        if (!value || typeof value !== 'object') return fallback
        const raw = value as Partial<ShopperAffinity>
        return {
            searches: Array.isArray(raw.searches) ? raw.searches : [],
            categories: raw.categories ?? {},
            stores: raw.stores ?? {},
            products: raw.products ?? {},
            tags: raw.tags ?? {},
            priceBand: {
                low: raw.priceBand?.low ?? 0,
                mid: raw.priceBand?.mid ?? 0,
                high: raw.priceBand?.high ?? 0,
            },
        }
    }
}
