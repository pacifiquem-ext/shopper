'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Palette,
  Mail,
  Phone,
  MapPin,
  Truck,
  Save,
  Upload,
  Globe,
  User,
  Check,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { MARKETPLACE_BRAND } from '@/lib/marketplace-brand-colors'
import { processStoreLogoFile } from '@/lib/store-logo-image'
import { cn } from '@/lib/utils'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { useSearchParams } from 'next/navigation'
import { storeSettingsService } from '@/services/store-settings.service'
import {
  deliveryZonesService,
  type DeliveryZoneApi,
} from '@/services/delivery-zones.service'
import { DeleteConfirmationDialog } from '@/components/dashboard/shared/delete-confirmation-dialog'

interface DeliveryZoneLocal {
  id: string
  name: string
  feeRwf: number
  etaMinutes: number
}

export default function StoreSettingsPage() {
  const t = useTranslations('dashboard')
  const tBranding = useTranslations('dashboard.storeSettings.branding')
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as
    | 'business'
    | 'branding'
    | 'contact'
    | 'delivery'
    | null

  const [activeTab, setActiveTab] = useState<
    'business' | 'branding' | 'contact' | 'delivery'
  >(tabParam && ['business', 'branding', 'contact', 'delivery'].includes(tabParam) ? tabParam : 'business')

  useEffect(() => {
    if (tabParam && ['business', 'branding', 'contact', 'delivery'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isLogoUploading, setIsLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const [businessInfo, setBusinessInfo] = useState({
    registeredName: '',
    displayName: '',
    description: '',
    slug: '',
    industrySector: '',
    businessCategory: '',
    country: '',
  })

  const [ownerInfo, setOwnerInfo] = useState({
    fullName: '',
    nationality: '',
    email: '',
    phone: '',
  })

  const [businessAddress, setBusinessAddress] = useState({
    province: '',
    district: '',
    sector: '',
    physicalAddress: '',
    googleMapsUrl: '',
  })

  const [branding, setBranding] = useState({
    primaryColor: MARKETPLACE_BRAND.primary as string,
    secondaryColor: MARKETPLACE_BRAND.canvas as string,
    logoUrl: '/placeholder-logo.png',
  })

  const [contact, setContact] = useState({
    email: '',
    phone: '',
    address: '',
    aboutUs: '',
  })

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneLocal[]>([])
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZoneLocal | null>(null)
  const [isDeletingZone, setIsDeletingZone] = useState(false)
  const td = useTranslations('dashboard.deliveryZones')

  const syncBrandingFromSettings = useCallback((s: Record<string, unknown>) => {
    const colors = s.brandColors as { primary?: string; secondary?: string } | null
    setBranding({
      primaryColor: colors?.primary ?? MARKETPLACE_BRAND.primary,
      secondaryColor: colors?.secondary ?? MARKETPLACE_BRAND.canvas,
      logoUrl: (s.logoUrl as string) ?? '/placeholder-logo.png',
    })
  }, [])

  const buildBrandColorsPayload = useCallback(
    (overrides?: { primary?: string; secondary?: string }) => ({
      primary: overrides?.primary ?? branding.primaryColor,
      secondary: overrides?.secondary ?? branding.secondaryColor,
    }),
    [branding.primaryColor, branding.secondaryColor],
  )

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setLoadError(false)
      try {
        const [settingsRes, zonesRes] = await Promise.all([
          storeSettingsService.getSettings(),
          deliveryZonesService.getAll(),
        ])

        const s = (settingsRes as any)?.data ?? settingsRes
        if (s) {
          setBusinessInfo({
            registeredName: s.registeredName ?? '',
            displayName: s.displayName ?? '',
            description: s.description ?? '',
            slug: s.slug ?? '',
            industrySector: s.kyc?.industrySector?.name ?? '',
            businessCategory: s.kyc?.businessCategory?.name ?? '',
            country: s.kyc?.country ?? '',
          })
          setOwnerInfo({
            fullName: s.kyc?.ownerFullName ?? '',
            nationality: s.kyc?.ownerNationality ?? '',
            email: s.kyc?.ownerEmail ?? '',
            phone: s.kyc?.ownerPhoneNumber ?? '',
          })
          setBusinessAddress({
            province: s.kyc?.businessAddress?.province ?? '',
            district: s.kyc?.businessAddress?.district ?? '',
            sector: s.kyc?.businessAddress?.sector ?? '',
            physicalAddress: s.kyc?.businessAddress?.physicalAddress ?? '',
            googleMapsUrl: s.kyc?.businessAddress?.googleMapsUrl ?? '',
          })
          syncBrandingFromSettings(s as Record<string, unknown>)
          setContact({
            email: s.contactEmail ?? '',
            phone: s.contactPhone ?? '',
            address: s.contactAddress ?? '',
            aboutUs: s.aboutUs ?? '',
          })
        }

        const zones = (zonesRes as any)?.data ?? zonesRes
        if (Array.isArray(zones)) {
          setDeliveryZones(
            zones.map((z: DeliveryZoneApi) => ({
              id: z.id,
              name: z.name,
              feeRwf: z.feeRwf,
              etaMinutes: z.etaMinutes,
            })),
          )
        }
      } catch {
        setLoadError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [syncBrandingFromSettings, reloadKey])

  const handleSave = async () => {
    if (loadError || isLoading) return
    setIsSaving(true)
    try {
      if (activeTab === 'business') {
        await storeSettingsService.updateSettings({
          displayName: businessInfo.displayName,
          description: businessInfo.description,
          ownerFullName: ownerInfo.fullName,
          ownerEmail: ownerInfo.email,
          ownerPhoneNumber: ownerInfo.phone,
        })
      } else if (activeTab === 'branding') {
        const res = await storeSettingsService.updateSettings({
          logoUrl: branding.logoUrl !== '/placeholder-logo.png' ? branding.logoUrl : undefined,
          brandColors: buildBrandColorsPayload(),
        })
        const updated = (res as unknown as { data?: Record<string, unknown> })?.data ?? res
        if (updated && typeof updated === 'object') {
          syncBrandingFromSettings(updated as Record<string, unknown>)
        }
        toast.success(t('storeSettings.saved'))
      } else if (activeTab === 'contact') {
        await storeSettingsService.updateSettings({
          contactEmail: contact.email,
          contactPhone: contact.phone,
          contactAddress: contact.address,
          aboutUs: contact.aboutUs,
        })
      } else if (activeTab === 'delivery') {
        const existingZones = deliveryZones.filter((z) => !z.id.startsWith('temp_'))
        const newZones = deliveryZones.filter((z) => z.id.startsWith('temp_'))

        await Promise.all([
          ...existingZones.map((z) =>
            deliveryZonesService.update(z.id, {
              name: z.name,
              feeRwf: z.feeRwf,
              etaMinutes: z.etaMinutes,
            }),
          ),
          ...newZones.map((z) =>
            deliveryZonesService.create({
              name: z.name,
              feeRwf: z.feeRwf,
              etaMinutes: z.etaMinutes,
            }),
          ),
        ])

        // Refresh to get real IDs for newly created zones
        const refreshRes = await deliveryZonesService.getAll()
        const refreshed = (refreshRes as any)?.data ?? refreshRes
        if (Array.isArray(refreshed)) {
          setDeliveryZones(
            refreshed.map((z: DeliveryZoneApi) => ({
              id: z.id,
              name: z.name,
              feeRwf: z.feeRwf,
              etaMinutes: z.etaMinutes,
            })),
          )
        }
      }
    } catch {
      // axios interceptor already shows error toast
    } finally {
      setIsSaving(false)
    }
  }

  const addDeliveryZone = () => {
    setDeliveryZones([
      ...deliveryZones,
      { id: `temp_${Date.now()}`, name: '', feeRwf: 0, etaMinutes: 30 },
    ])
  }

  const updateDeliveryZone = (id: string, field: string, value: string | number) => {
    setDeliveryZones(
      deliveryZones.map((zone) => (zone.id === id ? { ...zone, [field]: value } : zone)),
    )
  }

  const confirmRemoveDeliveryZone = async () => {
    if (!zoneToDelete) return
    const id = zoneToDelete.id
    setIsDeletingZone(true)
    try {
      if (!id.startsWith('temp_')) {
        await deliveryZonesService.delete(id)
      }
      setDeliveryZones((prev) => prev.filter((zone) => zone.id !== id))
      setZoneToDelete(null)
    } catch {
      // axios interceptor shows error toast
    } finally {
      setIsDeletingZone(false)
    }
  }

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return

    setIsLogoUploading(true)
    try {
      const result = await processStoreLogoFile(file)
      if (!result.ok) {
        if (result.error === 'invalid_type') {
          toast.error(tBranding('logoErrors.invalidType'))
        } else if (result.error === 'too_small') {
          toast.error(
            tBranding('logoErrors.tooSmall', {
              width: result.width ?? 0,
              height: result.height ?? 0,
            }),
          )
        } else {
          toast.error(tBranding('logoErrors.loadFailed'))
        }
        return
      }
      setBranding((prev) => ({ ...prev, logoUrl: result.dataUrl }))
    } finally {
      setIsLogoUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const tabs = [
    { key: 'business' as const, label: 'Business Info', icon: Building2 },
    { key: 'branding' as const, label: 'Branding', icon: Palette },
    { key: 'contact' as const, label: 'Contact & About', icon: Mail },
    { key: 'delivery' as const, label: 'Delivery Zones', icon: Truck },
  ]

  return (
    <div className="flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-text-strong-950 sm:text-3xl">
            {t('nav.storeSettings')}
          </h1>
          <p className="mt-2 text-sm text-text-soft-400 sm:text-base">Manage your store configuration and settings</p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading || loadError}
          className="h-10 w-full rounded-lg bg-primary-base px-6 text-white hover:bg-primary-darker disabled:opacity-50 sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {loadError ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-rose-800">{t('storeSettings.loadError')}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setReloadKey((k) => k + 1)}
            className="h-9 rounded-lg border-rose-200 bg-white text-rose-800 hover:bg-rose-50"
          >
            {t('errors.retry')}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-64">
          <div
            role="tablist"
            aria-orientation="vertical"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-white p-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] lg:block lg:space-y-1 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={`store-settings-tab-${tab.key}`}
                  aria-selected={isActive}
                  aria-controls={`store-settings-panel-${tab.key}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors sm:gap-3 sm:px-4 sm:py-3 lg:w-full',
                    isActive
                      ? 'bg-primary-alpha-10 text-primary-base'
                      : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-primary-base' : 'text-text-soft-400')} aria-hidden />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <TurningZeroLoader size="md" />
              </div>
            ) : (
              <>
                {activeTab === 'business' && (
                  <div
                    role="tabpanel"
                    id="store-settings-panel-business"
                    aria-labelledby="store-settings-tab-business"
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-text-strong-950">Business Information</h2>
                      <p className="mt-1 text-sm text-text-soft-400">
                        Core business details and registration information
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="registeredName" className="text-sm font-semibold text-text-sub-600">
                            Registered Business Name
                          </Label>
                          <Input
                            id="registeredName"
                            value={businessInfo.registeredName}
                            readOnly
                            className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="displayName" className="text-sm font-semibold text-text-sub-600">
                            Display Name
                          </Label>
                          <Input
                            id="displayName"
                            value={businessInfo.displayName}
                            onChange={(e) =>
                              setBusinessInfo({ ...businessInfo, displayName: e.target.value })
                            }
                            className="rounded-lg border-stroke-soft-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-text-sub-600">
                          Business Description
                        </Label>
                        <Textarea
                          id="description"
                          value={businessInfo.description}
                          onChange={(e) =>
                            setBusinessInfo({ ...businessInfo, description: e.target.value })
                          }
                          rows={3}
                          className="rounded-lg border-stroke-soft-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="store-slug" className="text-sm font-semibold text-text-sub-600">
                            <Globe className="mr-1 inline h-4 w-4" />
                            {t('storeSettings.slugLabel')}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 text-sm text-text-soft-400">/stores/</span>
                            <Input
                              id="store-slug"
                              value={businessInfo.slug}
                              readOnly
                              className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-semibold text-text-sub-600">
                            Country
                          </Label>
                          <Input
                            id="country"
                            value={businessInfo.country}
                            readOnly
                            className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-4 text-base font-semibold text-text-strong-950">
                          <User className="mr-2 inline h-4 w-4" />
                          Owner Information
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="ownerName" className="text-sm font-semibold text-text-sub-600">
                              Full Name
                            </Label>
                            <Input
                              id="ownerName"
                              value={ownerInfo.fullName}
                              onChange={(e) =>
                                setOwnerInfo({ ...ownerInfo, fullName: e.target.value })
                              }
                              className="rounded-lg border-stroke-soft-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="ownerNationality"
                              className="text-sm font-semibold text-text-sub-600"
                            >
                              Nationality
                            </Label>
                            <Input
                              id="ownerNationality"
                              value={ownerInfo.nationality}
                              readOnly
                              className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ownerEmail" className="text-sm font-semibold text-text-sub-600">
                              Email
                            </Label>
                            <Input
                              id="ownerEmail"
                              type="email"
                              value={ownerInfo.email}
                              onChange={(e) =>
                                setOwnerInfo({ ...ownerInfo, email: e.target.value })
                              }
                              className="rounded-lg border-stroke-soft-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ownerPhone" className="text-sm font-semibold text-text-sub-600">
                              Phone Number
                            </Label>
                            <Input
                              id="ownerPhone"
                              type="tel"
                              value={ownerInfo.phone}
                              onChange={(e) =>
                                setOwnerInfo({ ...ownerInfo, phone: e.target.value })
                              }
                              className="rounded-lg border-stroke-soft-200"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-4 text-base font-semibold text-text-strong-950">
                          <MapPin className="mr-2 inline h-4 w-4" />
                          Business Address
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="province" className="text-sm font-semibold text-text-sub-600">
                              Province
                            </Label>
                            <Input
                              id="province"
                              value={businessAddress.province}
                              readOnly
                              className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="district" className="text-sm font-semibold text-text-sub-600">
                              District
                            </Label>
                            <Input
                              id="district"
                              value={businessAddress.district}
                              readOnly
                              className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sector" className="text-sm font-semibold text-text-sub-600">
                              Sector
                            </Label>
                            <Input
                              id="sector"
                              value={businessAddress.sector}
                              readOnly
                              className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="physicalAddress"
                              className="text-sm font-semibold text-text-sub-600"
                            >
                              Physical Address
                            </Label>
                            <Input
                              id="physicalAddress"
                              value={businessAddress.physicalAddress}
                              readOnly
                              className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="googleMaps" className="text-sm font-semibold text-text-sub-600">
                            Google Maps URL (Optional)
                          </Label>
                          <Input
                            id="googleMaps"
                            type="url"
                            value={businessAddress.googleMapsUrl}
                            readOnly
                            placeholder="https://maps.google.com/?q=..."
                            className="rounded-lg border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div
                    role="tabpanel"
                    id="store-settings-panel-branding"
                    aria-labelledby="store-settings-tab-branding"
                    className="p-4 sm:p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-text-strong-950">
                        Branding & Visual Identity
                      </h2>
                      <p className="mt-1 text-sm text-text-soft-400">
                        Customize your store's visual appearance
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">
                          {tBranding('storeLogo')}
                        </Label>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                          <div className="mx-auto aspect-[4/5] h-36 w-[7.2rem] shrink-0 overflow-hidden rounded-xl border-2 border-stroke-soft-200 bg-bg-weak-50 sm:mx-0 sm:h-40 sm:w-32">
                            <img
                              src={branding.logoUrl}
                              alt={tBranding('logoAlt')}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isLogoUploading || isLoading}
                              onClick={() => logoInputRef.current?.click()}
                              className="h-10 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-bg-weak-50"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {isLogoUploading ? tBranding('uploading') : tBranding('uploadLogo')}
                            </Button>
                            <p className="mt-2 text-xs text-text-soft-400">{tBranding('logoHint')}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="primaryColor"
                            className="text-sm font-semibold text-text-sub-600"
                          >
                            Primary Brand Color
                          </Label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              id="primaryColor"
                              value={branding.primaryColor}
                              onChange={(e) =>
                                setBranding({ ...branding, primaryColor: e.target.value })
                              }
                              className="h-12 w-20 cursor-pointer rounded-lg border-2 border-stroke-soft-200"
                            />
                            <Input
                              value={branding.primaryColor}
                              onChange={(e) =>
                                setBranding({ ...branding, primaryColor: e.target.value })
                              }
                              className="flex-1 rounded-lg border-stroke-soft-200"
                            />
                          </div>
                          <p className="text-xs text-text-soft-400">Used for buttons, links, and accents</p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="secondaryColor"
                            className="text-sm font-semibold text-text-sub-600"
                          >
                            Secondary Brand Color
                          </Label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              id="secondaryColor"
                              value={branding.secondaryColor}
                              onChange={(e) =>
                                setBranding({ ...branding, secondaryColor: e.target.value })
                              }
                              className="h-12 w-20 cursor-pointer rounded-lg border-2 border-stroke-soft-200"
                            />
                            <Input
                              value={branding.secondaryColor}
                              onChange={(e) =>
                                setBranding({ ...branding, secondaryColor: e.target.value })
                              }
                              className="flex-1 rounded-lg border-stroke-soft-200"
                            />
                          </div>
                          <p className="text-xs text-text-soft-400">
                            Used for backgrounds and highlights
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-sub-600">
                          <Info className="h-4 w-4" />
                          Color Preview
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded-lg border border-stroke-soft-200"
                              style={{ backgroundColor: branding.primaryColor }}
                            />
                            <span className="text-sm text-text-sub-600">Primary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded-lg border border-stroke-soft-200"
                              style={{ backgroundColor: branding.secondaryColor }}
                            />
                            <span className="text-sm text-text-sub-600">Secondary</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div
                    role="tabpanel"
                    id="store-settings-panel-contact"
                    aria-labelledby="store-settings-tab-contact"
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-text-strong-950">
                        Contact Information & About
                      </h2>
                      <p className="mt-1 text-sm text-text-soft-400">How customers can reach you</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="contactEmail"
                            className="text-sm font-semibold text-text-sub-600"
                          >
                            <Mail className="mr-1 inline h-4 w-4" />
                            Contact Email
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            className="rounded-lg border-stroke-soft-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="contactPhone"
                            className="text-sm font-semibold text-text-sub-600"
                          >
                            <Phone className="mr-1 inline h-4 w-4" />
                            Contact Phone
                          </Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                            className="rounded-lg border-stroke-soft-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="contactAddress"
                          className="text-sm font-semibold text-text-sub-600"
                        >
                          <MapPin className="mr-1 inline h-4 w-4" />
                          Contact Address
                        </Label>
                        <Input
                          id="contactAddress"
                          value={contact.address}
                          onChange={(e) => setContact({ ...contact, address: e.target.value })}
                          className="rounded-lg border-stroke-soft-200"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="aboutUs" className="text-sm font-semibold text-text-sub-600">
                          About Your Business
                        </Label>
                        <Textarea
                          id="aboutUs"
                          value={contact.aboutUs}
                          onChange={(e) => setContact({ ...contact, aboutUs: e.target.value })}
                          rows={6}
                          placeholder="Tell customers about your business, your story, and what makes you unique..."
                          className="rounded-lg border-stroke-soft-200"
                        />
                        <p className="text-xs text-text-soft-400">
                          This will be displayed on your store's About page
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div
                    role="tabpanel"
                    id="store-settings-panel-delivery"
                    aria-labelledby="store-settings-tab-delivery"
                    className="p-6"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-text-strong-950">
                          Delivery Zones & Pricing
                        </h2>
                        <p className="mt-1 text-sm text-text-soft-400">
                          Configure delivery areas and fees
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={addDeliveryZone}
                        variant="outline"
                        className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Zone
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {deliveryZones.map((zone, index) => (
                        <div
                          key={zone.id}
                          className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="h-5 w-5 text-primary-base" />
                              <span className="text-sm font-semibold text-text-sub-600">
                                Zone {index + 1}
                                {zone.id.startsWith('temp_') && (
                                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                    Unsaved
                                  </span>
                                )}
                              </span>
                            </div>
                            {deliveryZones.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => setZoneToDelete(zone)}
                                variant="ghost"
                                size="sm"
                                className="h-8 text-error-base hover:bg-error-alpha-10 hover:text-error-darker"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-text-sub-600">Zone Name</Label>
                              <Input
                                value={zone.name}
                                onChange={(e) =>
                                  updateDeliveryZone(zone.id, 'name', e.target.value)
                                }
                                placeholder="e.g., Kigali City Center"
                                className="rounded-lg border-stroke-soft-200 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-text-sub-600">
                                Delivery Fee (RWF)
                              </Label>
                              <Input
                                type="number"
                                value={zone.feeRwf}
                                onChange={(e) =>
                                  updateDeliveryZone(zone.id, 'feeRwf', Number(e.target.value))
                                }
                                placeholder="2000"
                                className="rounded-lg border-stroke-soft-200 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-text-sub-600">
                                ETA (Minutes)
                              </Label>
                              <Input
                                type="number"
                                value={zone.etaMinutes}
                                onChange={(e) =>
                                  updateDeliveryZone(zone.id, 'etaMinutes', Number(e.target.value))
                                }
                                placeholder="30"
                                className="rounded-lg border-stroke-soft-200 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {deliveryZones.length === 0 && (
                        <div className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-stroke-soft-200 bg-bg-weak-50">
                          <div className="text-center">
                            <Truck className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-text-sub-600">
                              No delivery zones configured
                            </p>
                            <p className="mt-1 text-xs text-text-soft-400">
                              Add your first delivery zone to get started
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={!!zoneToDelete}
        onOpenChange={(open) => {
          if (!open) setZoneToDelete(null)
        }}
        onConfirm={confirmRemoveDeliveryZone}
        title={td('deleteTitle')}
        description={td('deleteDescription')}
        itemName={zoneToDelete?.name || td('unnamedZone')}
        warningMessage={td('deleteWarning')}
        permanentlyRemoveLabel={td('permanentlyRemove')}
        confirmButtonText={td('deleteConfirm')}
        cancelButtonText={td('cancel')}
        isLoading={isDeletingZone}
      />
    </div>
  )
}
