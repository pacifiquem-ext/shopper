'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

type RangePreset = 'mtd' | 'ytd' | 'custom'

export function DashboardFilters() {
  const t = useTranslations('dashboard')
  const [preset, setPreset] = useState<RangePreset>('mtd')
  const [customRange, setCustomRange] = useState<DateRange | undefined>()

  const label = useMemo(() => {
    if (preset === 'mtd') {
      return t('header.monthToDate')
    }
    if (preset === 'ytd') {
      return t('header.yearToDate')
    }
    return t('header.custom')
  }, [preset, t])

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-900"
          >
            {label}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={cn(
            'border-gray-200 bg-white p-2 text-gray-900 shadow-md',
            preset === 'custom' ? 'w-[360px]' : 'w-60'
          )}
        >
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setPreset('mtd')}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 hover:text-brand-900',
                preset === 'mtd' && 'bg-brand-50 text-brand-900'
              )}
            >
              {t('header.monthToDate')}
            </button>
            <button
              type="button"
              onClick={() => setPreset('ytd')}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 hover:text-brand-900',
                preset === 'ytd' && 'bg-brand-50 text-brand-900'
              )}
            >
              {t('header.yearToDate')}
            </button>
            <button
              type="button"
              onClick={() => setPreset('custom')}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 hover:text-brand-900',
                preset === 'custom' && 'bg-brand-50 text-brand-900'
              )}
            >
              {t('header.custom')}
            </button>
          </div>

          {preset === 'custom' && (
            <div className="mt-3 rounded-md border border-gray-200 p-2">
              <div className="mb-2 text-xs font-medium text-gray-600">{t('header.customRange')}</div>
              <div className="max-h-[360px] overflow-auto">
                <Calendar mode="range" selected={customRange} onSelect={setCustomRange} numberOfMonths={1} />
              </div>
              <div className="mt-2 flex justify-end">
                <Button type="button" size="sm" className="bg-brand-900 hover:bg-brand-800 text-white">
                  {t('header.apply')}
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <button
        type="button"
        className="h-9 rounded-lg bg-brand-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        {t('header.export')}
      </button>
    </div>
  )
}
