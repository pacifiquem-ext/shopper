'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck, Plus, Trash2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import {
  deliveryZonesService,
  type DeliveryZoneApi,
} from '@/services/delivery-zones.service'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'

interface DeliveryZoneLocal {
  id: string
  name: string
  feeRwf: number
  etaMinutes: number
}

export default function DeliverySettingsPage() {
  const t = useTranslations('dashboard')
  const [zones, setZones] = useState<DeliveryZoneLocal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await deliveryZonesService.getAll()
        const data = (res as any)?.data ?? res
        if (Array.isArray(data)) {
          setZones(
            data.map((z: DeliveryZoneApi) => ({
              id: z.id,
              name: z.name,
              feeRwf: z.feeRwf,
              etaMinutes: z.etaMinutes,
            })),
          )
        }
      } catch {
        // silently fall back to empty list
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const addZone = () => {
    setZones([...zones, { id: `temp_${Date.now()}`, name: '', feeRwf: 0, etaMinutes: 30 }])
  }

  const updateZone = (id: string, field: string, value: string | number) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, [field]: value } : z)))
  }

  const removeZone = async (id: string) => {
    if (!id.startsWith('temp_')) {
      try {
        await deliveryZonesService.delete(id)
      } catch {
        return
      }
    }
    setZones(zones.filter((z) => z.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const existingZones = zones.filter((z) => !z.id.startsWith('temp_'))
      const newZones = zones.filter((z) => z.id.startsWith('temp_'))

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

      // Refresh to replace temp IDs with real UUIDs
      const refreshRes = await deliveryZonesService.getAll()
      const refreshed = (refreshRes as any)?.data ?? refreshRes
      if (Array.isArray(refreshed)) {
        setZones(
          refreshed.map((z: DeliveryZoneApi) => ({
            id: z.id,
            name: z.name,
            feeRwf: z.feeRwf,
            etaMinutes: z.etaMinutes,
          })),
        )
      }
    } catch {
      // axios interceptor shows error toast
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('nav.deliverySettings')}
          </h1>
          <p className="mt-2 text-gray-500">Configure delivery zones manually.</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={addZone}
            variant="outline"
            className="h-10 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Zone
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="h-10 rounded-lg bg-brand-900 px-6 text-white hover:bg-brand-800 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <TurningZeroLoader size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            {zones.map((zone, index) => (
              <div key={zone.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
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
                  {zones.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeZone(zone.id)}
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
                      onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
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
                      onChange={(e) => updateZone(zone.id, 'feeRwf', Number(e.target.value))}
                      placeholder="2000"
                      className="rounded-lg border-gray-200 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">ETA (Minutes)</Label>
                    <Input
                      type="number"
                      value={zone.etaMinutes}
                      onChange={(e) => updateZone(zone.id, 'etaMinutes', Number(e.target.value))}
                      placeholder="30"
                      className="rounded-lg border-gray-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {zones.length === 0 && (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <div className="text-center">
                  <Truck className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    No delivery zones configured
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Click &quot;Add Zone&quot; to create your first delivery zone
                  </p>
                  <Button
                    type="button"
                    onClick={addZone}
                    variant="outline"
                    className="mt-4 h-9 rounded-lg border-gray-200 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Zone
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
