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
  CreditCard,
  Save,
  Upload,
  Globe,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { storeSettingsService } from '@/services/store-settings.service'
import {
  deliveryZonesService,
  type DeliveryZoneApi,
} from '@/services/delivery-zones.service'

interface DeliveryZoneLocal {
  id: string
  name: string
  feeRwf: number
  etaMinutes: number
}

export default function StoreSettingsPage() {
  const t = useTranslations('dashboard')
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as
    | 'business'
    | 'branding'
    | 'contact'
    | 'delivery'
    | 'subscription'
    | null

  const [activeTab, setActiveTab] = useState<
    'business' | 'branding' | 'contact' | 'delivery' | 'subscription'
  >(tabParam || 'business')

  useEffect(() => {
    if (tabParam && ['business', 'branding', 'contact', 'delivery', 'subscription'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [businessInfo, setBusinessInfo] = useState({
    registeredName: '',
    displayName: '',
    description: '',
    subdomain: '',
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
    primaryColor: '#1d4ed8',
    secondaryColor: '#e8edfb',
    logoUrl: '/placeholder-logo.png',
  })

  const [contact, setContact] = useState({
    email: '',
    phone: '',
    address: '',
    aboutUs: '',
  })

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneLocal[]>([])

  const [subscription] = useState({
    plan: 'Professional',
    status: 'active',
    nextPaymentDate: '2026-04-22',
    monthlyFee: 50000,
    paymentHistory: [
      { id: '1', date: '2026-03-22', amount: 50000, status: 'paid', method: 'Mobile Money' },
      { id: '2', date: '2026-02-22', amount: 50000, status: 'paid', method: 'Mobile Money' },
      { id: '3', date: '2026-01-22', amount: 50000, status: 'paid', method: 'Bank Transfer' },
    ],
  })

  useEffect(() => {
    async function load() {
      setIsLoading(true)
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
            subdomain: s.subdomain ?? '',
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
          const colors = s.brandColors as { primary?: string; secondary?: string } | null
          setBranding({
            primaryColor: colors?.primary ?? '#1d4ed8',
            secondaryColor: colors?.secondary ?? '#e8edfb',
            logoUrl: s.logoUrl ?? '/placeholder-logo.png',
          })
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
        // silently fall back to empty defaults
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
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
        await storeSettingsService.updateSettings({
          logoUrl: branding.logoUrl !== '/placeholder-logo.png' ? branding.logoUrl : undefined,
          brandColors: { primary: branding.primaryColor, secondary: branding.secondaryColor },
        })
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

  const removeDeliveryZone = async (id: string) => {
    if (!id.startsWith('temp_')) {
      try {
        await deliveryZonesService.delete(id)
      } catch {
        return
      }
    }
    setDeliveryZones(deliveryZones.filter((zone) => zone.id !== id))
  }

  const tabs = [
    { key: 'business' as const, label: 'Business Info', icon: Building2 },
    { key: 'branding' as const, label: 'Branding', icon: Palette },
    { key: 'contact' as const, label: 'Contact & About', icon: Mail },
    { key: 'delivery' as const, label: 'Delivery Zones', icon: Truck },
    { key: 'subscription' as const, label: 'Subscription', icon: CreditCard },
  ]

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('nav.storeSettings')}
          </h1>
          <p className="mt-2 text-gray-500">Manage your store configuration and settings</p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading || activeTab === 'subscription'}
          className="h-10 rounded-lg bg-brand-900 px-6 text-white hover:bg-brand-800 disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-64">
          <nav className="space-y-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-brand-900' : 'text-gray-500')} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-900 border-t-transparent" />
              </div>
            ) : (
              <>
                {activeTab === 'business' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Core business details and registration information
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="registeredName" className="text-sm font-semibold text-gray-700">
                            Registered Business Name
                          </Label>
                          <Input
                            id="registeredName"
                            value={businessInfo.registeredName}
                            readOnly
                            className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="displayName" className="text-sm font-semibold text-gray-700">
                            Display Name
                          </Label>
                          <Input
                            id="displayName"
                            value={businessInfo.displayName}
                            onChange={(e) =>
                              setBusinessInfo({ ...businessInfo, displayName: e.target.value })
                            }
                            className="rounded-lg border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                          Business Description
                        </Label>
                        <Textarea
                          id="description"
                          value={businessInfo.description}
                          onChange={(e) =>
                            setBusinessInfo({ ...businessInfo, description: e.target.value })
                          }
                          rows={3}
                          className="rounded-lg border-gray-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="subdomain" className="text-sm font-semibold text-gray-700">
                            <Globe className="mr-1 inline h-4 w-4" />
                            Subdomain
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="subdomain"
                              value={businessInfo.subdomain}
                              readOnly
                              className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                            />
                            <span className="text-sm text-gray-500">.onlineshop.rw</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                            Country
                          </Label>
                          <Input
                            id="country"
                            value={businessInfo.country}
                            readOnly
                            className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                          <User className="mr-2 inline h-4 w-4" />
                          Owner Information
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="ownerName" className="text-sm font-semibold text-gray-700">
                              Full Name
                            </Label>
                            <Input
                              id="ownerName"
                              value={ownerInfo.fullName}
                              onChange={(e) =>
                                setOwnerInfo({ ...ownerInfo, fullName: e.target.value })
                              }
                              className="rounded-lg border-gray-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="ownerNationality"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Nationality
                            </Label>
                            <Input
                              id="ownerNationality"
                              value={ownerInfo.nationality}
                              readOnly
                              className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ownerEmail" className="text-sm font-semibold text-gray-700">
                              Email
                            </Label>
                            <Input
                              id="ownerEmail"
                              type="email"
                              value={ownerInfo.email}
                              onChange={(e) =>
                                setOwnerInfo({ ...ownerInfo, email: e.target.value })
                              }
                              className="rounded-lg border-gray-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ownerPhone" className="text-sm font-semibold text-gray-700">
                              Phone Number
                            </Label>
                            <Input
                              id="ownerPhone"
                              type="tel"
                              value={ownerInfo.phone}
                              onChange={(e) =>
                                setOwnerInfo({ ...ownerInfo, phone: e.target.value })
                              }
                              className="rounded-lg border-gray-200"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                          <MapPin className="mr-2 inline h-4 w-4" />
                          Business Address
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="province" className="text-sm font-semibold text-gray-700">
                              Province
                            </Label>
                            <Input
                              id="province"
                              value={businessAddress.province}
                              readOnly
                              className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="district" className="text-sm font-semibold text-gray-700">
                              District
                            </Label>
                            <Input
                              id="district"
                              value={businessAddress.district}
                              readOnly
                              className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sector" className="text-sm font-semibold text-gray-700">
                              Sector
                            </Label>
                            <Input
                              id="sector"
                              value={businessAddress.sector}
                              readOnly
                              className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="physicalAddress"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Physical Address
                            </Label>
                            <Input
                              id="physicalAddress"
                              value={businessAddress.physicalAddress}
                              readOnly
                              className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="googleMaps" className="text-sm font-semibold text-gray-700">
                            Google Maps URL (Optional)
                          </Label>
                          <Input
                            id="googleMaps"
                            type="url"
                            value={businessAddress.googleMapsUrl}
                            readOnly
                            placeholder="https://maps.google.com/?q=..."
                            className="rounded-lg border-gray-200 bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Branding & Visual Identity
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Customize your store's visual appearance
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Store Logo</Label>
                        <div className="flex items-start gap-6">
                          <div className="h-32 w-32 overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50">
                            <img
                              src={branding.logoUrl}
                              alt="Store logo"
                              className="h-full w-full object-contain p-4"
                            />
                          </div>
                          <div className="flex-1">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload New Logo
                            </Button>
                            <p className="mt-2 text-xs text-gray-500">
                              Recommended: Square image, at least 512x512px, PNG or SVG format
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="primaryColor"
                            className="text-sm font-semibold text-gray-700"
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
                              className="h-12 w-20 cursor-pointer rounded-lg border-2 border-gray-200"
                            />
                            <Input
                              value={branding.primaryColor}
                              onChange={(e) =>
                                setBranding({ ...branding, primaryColor: e.target.value })
                              }
                              className="flex-1 rounded-lg border-gray-200"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Used for buttons, links, and accents</p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="secondaryColor"
                            className="text-sm font-semibold text-gray-700"
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
                              className="h-12 w-20 cursor-pointer rounded-lg border-2 border-gray-200"
                            />
                            <Input
                              value={branding.secondaryColor}
                              onChange={(e) =>
                                setBranding({ ...branding, secondaryColor: e.target.value })
                              }
                              className="flex-1 rounded-lg border-gray-200"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Used for backgrounds and highlights
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Info className="h-4 w-4" />
                          Color Preview
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded-lg border border-gray-200"
                              style={{ backgroundColor: branding.primaryColor }}
                            />
                            <span className="text-sm text-gray-600">Primary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded-lg border border-gray-200"
                              style={{ backgroundColor: branding.secondaryColor }}
                            />
                            <span className="text-sm text-gray-600">Secondary</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Contact Information & About
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">How customers can reach you</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="contactEmail"
                            className="text-sm font-semibold text-gray-700"
                          >
                            <Mail className="mr-1 inline h-4 w-4" />
                            Contact Email
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            className="rounded-lg border-gray-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="contactPhone"
                            className="text-sm font-semibold text-gray-700"
                          >
                            <Phone className="mr-1 inline h-4 w-4" />
                            Contact Phone
                          </Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                            className="rounded-lg border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="contactAddress"
                          className="text-sm font-semibold text-gray-700"
                        >
                          <MapPin className="mr-1 inline h-4 w-4" />
                          Contact Address
                        </Label>
                        <Input
                          id="contactAddress"
                          value={contact.address}
                          onChange={(e) => setContact({ ...contact, address: e.target.value })}
                          className="rounded-lg border-gray-200"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="aboutUs" className="text-sm font-semibold text-gray-700">
                          About Your Business
                        </Label>
                        <Textarea
                          id="aboutUs"
                          value={contact.aboutUs}
                          onChange={(e) => setContact({ ...contact, aboutUs: e.target.value })}
                          rows={6}
                          placeholder="Tell customers about your business, your story, and what makes you unique..."
                          className="rounded-lg border-gray-200"
                        />
                        <p className="text-xs text-gray-500">
                          This will be displayed on your store's About page
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="p-6">
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Delivery Zones & Pricing
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Configure delivery areas and fees
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={addDeliveryZone}
                        variant="outline"
                        className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Zone
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {deliveryZones.map((zone, index) => (
                        <div
                          key={zone.id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="h-5 w-5 text-brand-900" />
                              <span className="text-sm font-semibold text-gray-700">
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
                                onClick={() => removeDeliveryZone(zone.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-gray-600">Zone Name</Label>
                              <Input
                                value={zone.name}
                                onChange={(e) =>
                                  updateDeliveryZone(zone.id, 'name', e.target.value)
                                }
                                placeholder="e.g., Kigali City Center"
                                className="rounded-lg border-gray-200 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-gray-600">
                                Delivery Fee (RWF)
                              </Label>
                              <Input
                                type="number"
                                value={zone.feeRwf}
                                onChange={(e) =>
                                  updateDeliveryZone(zone.id, 'feeRwf', Number(e.target.value))
                                }
                                placeholder="2000"
                                className="rounded-lg border-gray-200 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-gray-600">
                                ETA (Minutes)
                              </Label>
                              <Input
                                type="number"
                                value={zone.etaMinutes}
                                onChange={(e) =>
                                  updateDeliveryZone(zone.id, 'etaMinutes', Number(e.target.value))
                                }
                                placeholder="30"
                                className="rounded-lg border-gray-200 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {deliveryZones.length === 0 && (
                        <div className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                          <div className="text-center">
                            <Truck className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-600">
                              No delivery zones configured
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Add your first delivery zone to get started
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Subscription & Billing
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        View your subscription status and payment history
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {subscription.plan} Plan
                              </h3>
                              <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                {subscription.status === 'active' ? 'Active' : subscription.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              Your subscription is managed by our team. Contact support for changes.
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-brand-900">
                              {subscription.monthlyFee.toLocaleString()} RWF
                            </div>
                            <div className="text-xs text-gray-600">per month</div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                              <Calendar className="h-5 w-5 text-brand-900" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Next Payment Date
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {subscription.nextPaymentDate}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                              <Clock className="h-5 w-5 text-emerald-700" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Days Until Renewal
                              </div>
                              <div className="text-sm font-semibold text-gray-900">31 days</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                          Payment History
                        </h3>
                        <div className="space-y-3">
                          {subscription.paymentHistory.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {payment.amount.toLocaleString()} RWF
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {payment.date} • {payment.method}
                                  </div>
                                </div>
                              </div>
                              <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                {payment.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex gap-3">
                          <Info className="h-5 w-5 shrink-0 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              Need to upgrade or modify your subscription?
                            </p>
                            <p className="mt-1 text-xs text-blue-700">
                              Contact our support team at support@onlineshop.rw or call +250 788
                              000 000
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
