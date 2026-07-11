'use client'

import { RiCheckLine } from '@remixicon/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  STORE_TEMPLATE_OPTIONS,
  STORE_TEMPLATE_PICKER_UI,
  type StoreTemplateId,
} from '@/lib/store-templates'

type Props = {
  value: StoreTemplateId
  savingId: StoreTemplateId | null
  disabled?: boolean
  onSelect: (id: StoreTemplateId) => void
}

function MiniPreview({ id }: { id: StoreTemplateId }) {
  const ui = STORE_TEMPLATE_PICKER_UI[id]
  const isDark = id === 'ISHUSHO_CRAFTS'
  return (
    <div
      className="relative mb-4 overflow-hidden rounded-xl ring-1 ring-black/5"
      style={{ background: ui.bg, height: 112 }}
      aria-hidden
    >
      <div
        className="flex h-7 items-center gap-1.5 px-2"
        style={{ background: isDark ? ui.primary : ui.surface, borderBottom: `1px solid ${ui.primary}14` }}
      >
        <span className="size-2.5 rounded-full" style={{ background: ui.secondary }} />
        <span className="h-1.5 w-10 rounded-full opacity-40" style={{ background: isDark ? '#fff' : ui.primary }} />
        <span className="ml-auto size-3 rounded-md" style={{ background: ui.accent, opacity: 0.85 }} />
      </div>
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-2 p-2.5">
        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-16 rounded-full" style={{ background: ui.secondary, opacity: 0.9 }} />
          <div className="h-1.5 w-full rounded-full opacity-25" style={{ background: isDark ? '#fff' : ui.primary }} />
          <div className="h-1.5 w-3/4 rounded-full opacity-20" style={{ background: isDark ? '#fff' : ui.primary }} />
          <div className="mt-2 h-5 w-14 rounded-md" style={{ background: ui.secondary }} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-md"
              style={{
                background: i % 2 === 0 ? ui.surface : `${ui.secondary}33`,
                border: `1px solid ${ui.primary}12`,
                minHeight: 28,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function StoreTemplatePicker({ value, savingId, disabled, onSelect }: Props) {
  const t = useTranslations('storeTemplates')

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-label-md text-text-strong-950">{t('pickerTitle')}</h3>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('pickerHint')}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STORE_TEMPLATE_OPTIONS.map((option) => {
          const selected = value === option.id
          const isSaving = savingId === option.id
          const ui = STORE_TEMPLATE_PICKER_UI[option.id]
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled || Boolean(savingId)}
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
              className={cn(
                'group relative cursor-pointer rounded-20 border bg-bg-white-0 p-4 text-left shadow-regular-xs transition duration-200',
                'hover:-translate-y-0.5 hover:shadow-regular-md disabled:cursor-not-allowed disabled:opacity-60',
                selected
                  ? 'border-primary-base ring-2 ring-primary-alpha-10'
                  : 'border-stroke-soft-200',
              )}
            >
              {selected ? (
                <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary-base px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-static-white">
                  <RiCheckLine className="size-3" />
                  {t('templateActive')}
                </span>
              ) : null}

              <MiniPreview id={option.id} />

              <span
                className="mb-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${ui.accent}22`, color: ui.secondary }}
              >
                {t(option.tagKey)}
              </span>
              <p className="text-label-sm text-text-strong-950">{t(option.labelKey)}</p>
              <p className="mt-1 text-paragraph-xs leading-relaxed text-text-sub-600">
                {t(option.descriptionKey)}
              </p>
              {isSaving ? (
                <p className="mt-2 text-paragraph-xs font-medium text-primary-base">
                  {t('templateSaving')}
                </p>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
