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
import { DeleteConfirmationDialog } from '@/components/dashboard/shared/delete-confirmation-dialog'

interface DeliveryZoneLocal {
  id: string
  name: string
  feeRwf: number
  etaMinutes: number
}

export default function DeliverySettingsPage() {
  const t = useTranslations('dashboard')
  const td = useTranslations('dashboard.deliveryZones')
  const [zones, setZones] = useState<DeliveryZoneLocal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZoneLocal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const confirmRemoveZone = async () => {
    if (!zoneToDelete) return
    const id = zoneToDelete.id
    setIsDeleting(true)
    try {
      if (!id.startsWith('temp_')) {
        await deliveryZonesService.delete(id)
      }
      setZones((prev) => prev.filter((z) => z.id !== id))
      setZoneToDelete(null)
    } catch {
      // axios interceptor shows error toast
    } finally {
      setIsDeleting(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight text-text-strong-950">
            {t('nav.deliverySettings')}
          </h1>
          <p className="mt-2 text-text-soft-400">{td('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={addZone}
            variant="outline"
            className="h-10 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
          >
            <Plus className="mr-2 h-4 w-4" />
            {td('addZone')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="h-10 rounded-lg bg-primary-base px-6 text-white hover:bg-primary-darker disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? td('saving') : td('saveChanges')}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-stroke-soft-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <TurningZeroLoader size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            {zones.map((zone, index) => (
              <div key={zone.id} className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary-base" />
                    <span className="text-sm font-semibold text-text-sub-600">
                      {td('zoneLabel', { index: index + 1 })}
                      {zone.id.startsWith('temp_') && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          {td('unsaved')}
                        </span>
                      )}
                    </span>
                  </div>
                  {zones.length > 1 && (
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
                    <Label className="text-xs font-semibold text-text-sub-600">{td('zoneName')}</Label>
                    <Input
                      value={zone.name}
                      onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                      placeholder={td('zoneNamePlaceholder')}
                      className="rounded-lg border-stroke-soft-200 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-text-sub-600">
                      {td('deliveryFee')}
                    </Label>
                    <Input
                      type="number"
                      value={zone.feeRwf}
                      onChange={(e) => updateZone(zone.id, 'feeRwf', Number(e.target.value))}
                      placeholder="2000"
                      className="rounded-lg border-stroke-soft-200 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-text-sub-600">{td('etaMinutes')}</Label>
                    <Input
                      type="number"
                      value={zone.etaMinutes}
                      onChange={(e) => updateZone(zone.id, 'etaMinutes', Number(e.target.value))}
                      placeholder="30"
                      className="rounded-lg border-stroke-soft-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {zones.length === 0 && (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-stroke-soft-200 bg-bg-weak-50">
                <div className="text-center">
                  <Truck className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-text-sub-600">
                    {td('emptyTitle')}
                  </p>
                  <p className="mt-1 text-xs text-text-soft-400">
                    {td('emptyHint')}
                  </p>
                  <Button
                    type="button"
                    onClick={addZone}
                    variant="outline"
                    className="mt-4 h-9 rounded-lg border-stroke-soft-200 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {td('addFirstZone')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={!!zoneToDelete}
        onOpenChange={(open) => {
          if (!open) setZoneToDelete(null)
        }}
        onConfirm={confirmRemoveZone}
        title={td('deleteTitle')}
        description={td('deleteDescription')}
        itemName={zoneToDelete?.name || td('unnamedZone')}
        warningMessage={td('deleteWarning')}
        permanentlyRemoveLabel={td('permanentlyRemove')}
        confirmButtonText={td('deleteConfirm')}
        cancelButtonText={td('cancel')}
        isLoading={isDeleting}
      />
    </div>
  )
}
