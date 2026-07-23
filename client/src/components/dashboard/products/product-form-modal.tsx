'use client'

import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { toast } from 'sonner'
import { validateImageUrl, DEFAULT_PRODUCT_IMAGE_LIMITS } from '@/lib/image-validation'
import { getPublicApiBaseUrl } from '@/lib/api-base-url'


type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED'

interface DraftProduct {
  name: string
  vendor: string
  category: string
  status: ProductStatus
  description: string
  tags: string
  mediaSectionEnabled: boolean
  images: string[]
  newImageUrl: string
  variantsSectionEnabled: boolean
  colors: Array<{ name: string; hex: string; imageUrl?: string }>
  sizes: string[]
  models: string[]
  price: string
  compareAt: string
  cost: string
  deliverySectionEnabled: boolean
  deliveryEnabled: boolean
  deliveryLocation: string
  deliveryPrice: string
  internalNote: string
  attributes?: Record<string, string>
}

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditMode: boolean
  draftProduct: DraftProduct
  setDraftProduct: React.Dispatch<React.SetStateAction<DraftProduct>>
  onSubmit: () => void | Promise<void>
  onZoomImage: (url: string) => void
  addImages: (urls: string[]) => void
  removeImage: (url: string) => void
  isDraftLoading?: boolean
}

export function ProductFormModal({
  open,
  onOpenChange,
  isEditMode,
  draftProduct,
  setDraftProduct,
  onSubmit,
  onZoomImage,
  addImages,
  removeImage,
  isDraftLoading = false,
}: ProductFormModalProps) {
  const t = useTranslations('dashboard')
  const mediaUploadInputId = useId()

  const [createStep, setCreateStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [categoryAttributes, setCategoryAttributes] = useState<
    Array<{ key: string; label: string; type?: string }>
  >([])
  const [imageValidating, setImageValidating] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const root = getPublicApiBaseUrl().replace(/\/+$/, '')
        const res = await fetch(`${root}/catalog/categories`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!res.ok) return
        const body = await res.json()
        const data = body?.data ?? body
        const names: string[] = Array.isArray(data)
          ? data.map((c: { name?: string; category?: string } | string) =>
              typeof c === 'string' ? c : c.name || c.category || '',
            ).filter(Boolean)
          : Array.isArray(data?.categories)
            ? data.categories.map((c: { name?: string } | string) =>
                typeof c === 'string' ? c : c.name || '',
              ).filter(Boolean)
            : []
        if (!cancelled) setCategoryOptions(Array.from(new Set(names)).sort())
      } catch {
        // non-blocking
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open || !draftProduct.category.trim()) {
      setCategoryAttributes([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const root = getPublicApiBaseUrl().replace(/\/+$/, '')
        const res = await fetch(
          `${root}/catalog/categories/${encodeURIComponent(draftProduct.category)}/attributes`,
          { headers: { Accept: 'application/json' }, cache: 'no-store' },
        )
        if (res.status === 404 || !res.ok) {
          if (!cancelled) setCategoryAttributes([])
          return
        }
        const body = await res.json()
        const data = body?.data ?? body
        const attrs = Array.isArray(data)
          ? data
          : Array.isArray(data?.attributes)
            ? data.attributes
            : []
        if (!cancelled) {
          setCategoryAttributes(
            attrs.map((a: { key?: string; name?: string; label?: string; type?: string }) => ({
              key: a.key || a.name || '',
              label: a.label || a.name || a.key || '',
              type: a.type,
            })).filter((a: { key: string }) => a.key),
          )
        }
      } catch {
        if (!cancelled) setCategoryAttributes([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, draftProduct.category])

  const createSteps = useMemo(
    () => [
      {
        key: 'basics',
        title: t('products.create.steps.basics'),
        description: t('products.create.steps.basicsDesc'),
      },
      {
        key: 'media',
        title: t('products.create.steps.media'),
        description: t('products.create.steps.mediaDesc'),
      },
      {
        key: 'variants',
        title: t('products.create.steps.variants'),
        description: t('products.create.steps.variantsDesc'),
      },
      {
        key: 'pricing',
        title: t('products.create.steps.pricing'),
        description: t('products.create.steps.pricingDesc'),
      },
      {
        key: 'delivery',
        title: t('products.create.steps.delivery'),
        description: t('products.create.steps.deliveryDesc'),
      },
      {
        key: 'review',
        title: t('products.create.steps.review'),
        description: t('products.create.steps.reviewDesc'),
      },
    ],
    [t]
  )

  const isStepEnabled = useCallback(
    (index: number) => {
      const key = createSteps[index]?.key
      if (!key) return false
      if (key === 'media') return draftProduct.mediaSectionEnabled
      if (key === 'variants') return draftProduct.variantsSectionEnabled
      if (key === 'delivery') return draftProduct.deliverySectionEnabled
      return true
    },
    [createSteps, draftProduct.deliverySectionEnabled, draftProduct.mediaSectionEnabled, draftProduct.variantsSectionEnabled]
  )

  const canGoNext = useMemo(() => {
    if (createStep === 0) return draftProduct.name.trim().length > 0
    if (createStep === 2 && draftProduct.variantsSectionEnabled) {
      return draftProduct.colors.every((c) => c.name.trim().length > 0)
    }
    if (createStep === 3) return draftProduct.price.trim().length > 0
    return true
  }, [createStep, draftProduct.colors, draftProduct.name, draftProduct.price, draftProduct.variantsSectionEnabled])

  const closeCreate = () => {
    if (isSubmitting || isDraftLoading) return
    onOpenChange(false)
    setCreateStep(0)
  }

  const handleFinish = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && (isSubmitting || isDraftLoading)) return
    if (!next) setCreateStep(0)
    onOpenChange(next)
  }

  const nextStep = () => {
    if (!canGoNext) return

    setCreateStep((s) => {
      let idx = Math.min(createSteps.length - 1, s + 1)
      while (idx < createSteps.length - 1 && !isStepEnabled(idx)) idx += 1
      return idx
    })
  }

  const prevStep = () => {
    setCreateStep((s) => {
      let idx = Math.max(0, s - 1)
      while (idx > 0 && !isStepEnabled(idx)) idx -= 1
      return idx
    })
  }

  const setSectionEnabled = (key: 'media' | 'variants' | 'delivery', enabled: boolean) => {
    setDraftProduct((p) => {
      if (key === 'media') return { ...p, mediaSectionEnabled: enabled }
      if (key === 'variants') return { ...p, variantsSectionEnabled: enabled }
      return { ...p, deliverySectionEnabled: enabled }
    })

    if (!enabled) {
      const stepKey = createSteps[createStep]?.key
      if (stepKey === key) nextStep()
    }
  }

  const statusLabel = (s: ProductStatus) => {
    if (s === 'ACTIVE') return t('products.status.active')
    if (s === 'DRAFT') return t('products.status.draft')
    return t('products.status.archived')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100vw-24px)] max-w-4xl overflow-hidden rounded-2xl border border-primary-base/20 bg-white p-0 shadow-xl">
        <div className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr]">
          {isDraftLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-[1px]">
              <TurningZeroLoader size="md" label={t('products.preview.loading')} />
              <p className="text-sm font-medium text-text-sub-600">{t('products.preview.loading')}</p>
            </div>
          )}
          {isSubmitting && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-[1px]">
              <TurningZeroLoader size="md" label={t('products.create.submitting')} />
              <p className="text-sm font-medium text-text-sub-600">{t('products.create.submitting')}</p>
            </div>
          )}
          <div className="border-b border-stroke-soft-200 bg-primary-alpha-10/30 p-5 lg:border-b-0 lg:border-r lg:border-stroke-soft-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-semibold text-text-strong-950">
                  {isEditMode ? 'Edit Product' : t('products.create.title')}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-text-sub-600">
                  {isEditMode ? 'Update product information and settings' : t('products.create.subtitle')}
                </DialogDescription>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {createSteps.map((s, idx) => {
                const active = idx === createStep
                const done = idx < createStep
                const enabled = isStepEnabled(idx)
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setCreateStep(idx)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                      active
                        ? 'border-primary-base/20 bg-white text-primary-base'
                        : 'border-transparent bg-transparent text-text-sub-600 hover:bg-white',
                      done ? 'opacity-100' : 'opacity-90'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold',
                        active
                          ? 'border-primary-base/20 bg-primary-alpha-10 text-primary-base'
                          : done
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-primary-base/20 bg-white text-text-sub-600'
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {s.title}{' '}
                        {!enabled ? (
                          <span className="ml-2 inline-flex items-center rounded-full border border-primary-base/20 bg-primary-alpha-10 px-2 py-0.5 text-[11px] font-semibold text-text-sub-600">
                            {t('products.create.sections.skippedPill')}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-text-soft-400">{s.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex max-h-[85vh] flex-col">
            <DialogHeader className="border-b border-stroke-soft-200 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-lg font-semibold text-text-strong-950">{createSteps[createStep]?.title}</DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-text-sub-600">
                    {createSteps[createStep]?.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="h-full">
              <div className="space-y-4 px-6 py-6">
                {createStep === 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.fields.name')}</Label>
                        <Input
                          value={draftProduct.name}
                          onChange={(e) => setDraftProduct((p) => ({ ...p, name: e.target.value }))}
                          placeholder={t('products.create.fields.namePlaceholder')}
                          className="h-10 rounded-xl border-primary-base/20 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.fields.vendor')}</Label>
                        <div className="flex h-10 items-center rounded-xl border border-primary-base/20 bg-bg-weak-50 px-3 text-sm font-medium text-text-strong-950">
                          {draftProduct.vendor || t('products.table.na')}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.fields.category')}</Label>
                        {categoryOptions.length > 0 ? (
                          <Select
                            value={draftProduct.category || undefined}
                            onValueChange={(value) =>
                              setDraftProduct((p) => ({ ...p, category: value, attributes: {} }))
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl border-primary-base/20 bg-white">
                              <SelectValue placeholder={t('products.create.fields.categoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent className="border-primary-base/20 bg-white text-text-strong-950">
                              {categoryOptions.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={draftProduct.category}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, category: e.target.value }))}
                            placeholder={t('products.create.fields.categoryPlaceholder')}
                            className="h-10 rounded-xl border-primary-base/20 bg-white"
                          />
                        )}
                      </div>
                      {categoryAttributes.length > 0 ? (
                        <div className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {categoryAttributes.map((attr) => (
                            <div key={attr.key} className="space-y-2">
                              <Label className="text-sm font-semibold text-text-sub-600">{attr.label}</Label>
                              <Input
                                value={draftProduct.attributes?.[attr.key] ?? ''}
                                onChange={(e) =>
                                  setDraftProduct((p) => ({
                                    ...p,
                                    attributes: {
                                      ...(p.attributes ?? {}),
                                      [attr.key]: e.target.value,
                                    },
                                  }))
                                }
                                className="h-10 rounded-xl border-primary-base/20 bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.fields.status')}</Label>
                        <Select
                          value={draftProduct.status}
                          onValueChange={(value) => setDraftProduct((p) => ({ ...p, status: value as ProductStatus }))}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-primary-base/20 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-primary-base/20 bg-white text-text-strong-950">
                            <SelectItem value="DRAFT">{t('products.status.draft')}</SelectItem>
                            <SelectItem value="ACTIVE">{t('products.status.active')}</SelectItem>
                            <SelectItem value="ARCHIVED">{t('products.status.archived')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.fields.description')}</Label>
                      <Textarea
                        value={draftProduct.description}
                        onChange={(e) => setDraftProduct((p) => ({ ...p, description: e.target.value }))}
                        placeholder={t('products.create.fields.descriptionPlaceholder')}
                        className="min-h-[120px] rounded-xl border-primary-base/20 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.fields.tags')}</Label>
                      <Input
                        value={draftProduct.tags}
                        onChange={(e) => setDraftProduct((p) => ({ ...p, tags: e.target.value }))}
                        placeholder={t('products.create.fields.tagsPlaceholder')}
                        className="h-10 rounded-xl border-primary-base/20 bg-white"
                      />
                      <div className="text-xs font-medium text-text-soft-400">{t('products.create.fields.tagsHint')}</div>
                    </div>
                  </div>
                ) : null}

                {createStep === 1 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary-base/20 bg-white px-4 py-3 shadow-sm">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-strong-950">{t('products.create.sections.applies')}</div>
                        <div className="mt-0.5 text-xs font-medium text-text-soft-400">{t('products.create.sections.mediaHint')}</div>
                      </div>
                      <Switch
                        checked={draftProduct.mediaSectionEnabled}
                        onCheckedChange={(v) => setSectionEnabled('media', Boolean(v))}
                      />
                    </div>

                    {!draftProduct.mediaSectionEnabled ? (
                      <div className="rounded-2xl border border-dashed border-primary-base/20 bg-primary-alpha-10/30 p-6">
                        <div className="text-sm font-semibold text-text-strong-950">{t('products.create.sections.skippedTitle')}</div>
                        <div className="mt-1 text-sm text-text-sub-600">{t('products.create.sections.skippedBody')}</div>
                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={() => setSectionEnabled('media', true)}
                            className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker"
                          >
                            {t('products.create.sections.enable')}
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {draftProduct.mediaSectionEnabled ? (
                      <div className="rounded-2xl border border-primary-base/20 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-text-strong-950">{t('products.create.media.addImages')}</div>
                            <div className="mt-1 text-xs font-medium text-text-soft-400">{t('products.create.media.addImagesHint')}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs font-medium text-text-sub-600">{t('products.create.media.uploadHint')}</div>
                          <div>
                            <input
                              id={mediaUploadInputId}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? [])
                                const urls: string[] = []
                                for (const f of files) urls.push(URL.createObjectURL(f))
                                addImages(urls)
                                e.target.value = ''
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(mediaUploadInputId)?.click()}
                              className="h-10 rounded-xl border-primary-base/20 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t('products.create.media.upload')}
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <Input
                            value={draftProduct.newImageUrl}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, newImageUrl: e.target.value }))}
                            placeholder={t('products.create.media.urlPlaceholder')}
                            className="h-10 flex-1 rounded-xl border-primary-base/20 bg-white"
                          />
                          <Button
                            type="button"
                            onClick={async () => {
                              const url = draftProduct.newImageUrl.trim()
                              if (!url) return
                              setImageValidating(true)
                              try {
                                const result = await validateImageUrl(url, DEFAULT_PRODUCT_IMAGE_LIMITS)
                                if (!result.ok) {
                                  toast.error(t('products.create.media.imageInvalid', { reason: result.message }))
                                  return
                                }
                                addImages([url])
                                setDraftProduct((p) => ({ ...p, newImageUrl: '' }))
                              } finally {
                                setImageValidating(false)
                              }
                            }}
                            className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('products.create.media.add')}
                          </Button>
                        </div>

                        {draftProduct.images.length > 0 ? (
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {draftProduct.images.map((url) => (
                              <div key={url} className="group relative overflow-hidden rounded-2xl border border-primary-base/20 bg-primary-alpha-10/30">
                                <img
                                  src={url}
                                  alt={draftProduct.name || t('products.create.media.defaultAlt')}
                                  className="h-28 w-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 hidden items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-2 group-hover:flex">
                                  <button
                                    type="button"
                                    onClick={() => onZoomImage(url)}
                                    className="inline-flex h-8 items-center gap-2 rounded-lg bg-white/90 px-2 text-xs font-semibold text-text-strong-950"
                                  >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                    {t('products.create.media.zoom')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    className="inline-flex h-8 items-center rounded-lg bg-white/90 px-2 text-xs font-semibold text-text-strong-950"
                                  >
                                    {t('products.create.media.remove')}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl border border-dashed border-primary-base/20 bg-primary-alpha-10/30 p-6 text-sm text-text-sub-600">
                            {t('products.create.media.empty')}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {createStep === 2 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary-base/20 bg-white px-4 py-3 shadow-sm">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-strong-950">{t('products.create.sections.applies')}</div>
                        <div className="mt-0.5 text-xs font-medium text-text-soft-400">{t('products.create.sections.variantsHint')}</div>
                      </div>
                      <Switch
                        checked={draftProduct.variantsSectionEnabled}
                        onCheckedChange={(v) => setSectionEnabled('variants', Boolean(v))}
                      />
                    </div>

                    {!draftProduct.variantsSectionEnabled ? (
                      <div className="rounded-2xl border border-dashed border-primary-base/20 bg-primary-alpha-10/30 p-6">
                        <div className="text-sm font-semibold text-text-strong-950">{t('products.create.sections.skippedTitle')}</div>
                        <div className="mt-1 text-sm text-text-sub-600">{t('products.create.sections.skippedBody')}</div>
                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={() => setSectionEnabled('variants', true)}
                            className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker"
                          >
                            {t('products.create.sections.enable')}
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {draftProduct.variantsSectionEnabled ? (
                      <>
                        <div className="rounded-2xl border border-primary-base/20 bg-white p-4 shadow-sm">
                          <div className="text-sm font-semibold text-text-strong-950">{t('products.create.variants.colors')}</div>
                          <div className="mt-1 text-xs font-medium text-text-soft-400">{t('products.create.variants.colorsHint')}</div>
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {draftProduct.colors.map((c, idx) => (
                              <div
                                key={`${c.name}-${idx}`}
                                className="space-y-2 rounded-xl border border-primary-base/20 bg-white p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <label
                                    htmlFor={`products-create-color-${idx}`}
                                    className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-primary-base/20 bg-white"
                                    title={t('products.create.variants.colorPickerAria')}
                                  >
                                    <span className="h-7 w-7 rounded-lg" style={{ backgroundColor: c.hex }} />
                                  </label>
                                  <input
                                    id={`products-create-color-${idx}`}
                                    type="color"
                                    value={c.hex}
                                    onChange={(e) =>
                                      setDraftProduct((p) => {
                                        const nextHex = e.target.value
                                        const next = [...p.colors]
                                        const prevName = next[idx]?.name ?? ''
                                        next[idx] = {
                                          ...next[idx],
                                          hex: nextHex,
                                          name: prevName.trim().length > 0 ? prevName : '',
                                        }
                                        return { ...p, colors: next }
                                      })
                                    }
                                    aria-label={t('products.create.variants.colorPickerAria')}
                                    className="h-0 w-0 overflow-hidden opacity-0"
                                  />
                                  <Input
                                    value={c.name}
                                    onChange={(e) =>
                                      setDraftProduct((p) => {
                                        const next = [...p.colors]
                                        next[idx] = { ...next[idx], name: e.target.value }
                                        return { ...p, colors: next }
                                      })
                                    }
                                    className="h-9 flex-1 rounded-lg border-primary-base/20 bg-white"
                                    placeholder={t('products.create.variants.colorNamePlaceholder')}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setDraftProduct((p) => ({
                                        ...p,
                                        colors: p.colors.filter((_, i) => i !== idx),
                                      }))
                                    }
                                    className="h-9 w-9 rounded-lg text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
                                    aria-label={t('products.create.variants.removeColorAria')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Input
                                  value={c.imageUrl ?? ''}
                                  onChange={(e) =>
                                    setDraftProduct((p) => {
                                      const next = [...p.colors]
                                      next[idx] = { ...next[idx], imageUrl: e.target.value }
                                      return { ...p, colors: next }
                                    })
                                  }
                                  className="h-9 rounded-lg border-primary-base/20 bg-white"
                                  placeholder={t('products.create.variants.colorImagePlaceholder')}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setDraftProduct((p) => ({
                                  ...p,
                                  colors: [...p.colors, { name: '', hex: '#111827', imageUrl: '' }],
                                }))
                              }
                              className="h-9 rounded-lg border-primary-base/20 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t('products.create.variants.addColor')}
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-primary-base/20 bg-white p-4 shadow-sm">
                          <div className="text-sm font-semibold text-text-strong-950">{t('products.create.variants.sizes')}</div>
                          <div className="mt-1 text-xs font-medium text-text-soft-400">{t('products.create.variants.sizesHint')}</div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {draftProduct.sizes.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() =>
                                  setDraftProduct((p) => ({
                                    ...p,
                                    sizes: p.sizes.filter((x) => x !== s),
                                  }))
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-primary-base/20 bg-primary-alpha-10 px-3 py-1 text-sm font-semibold text-gray-800"
                              >
                                {s}
                                <span className="text-text-soft-400">×</span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <Input
                              value={draftProduct.models.join(', ')}
                              onChange={(e) =>
                                setDraftProduct((p) => ({
                                  ...p,
                                  models: e.target.value
                                    .split(',')
                                    .map((x) => x.trim())
                                    .filter(Boolean),
                                }))
                              }
                              placeholder={t('products.create.variants.modelsPlaceholder')}
                              className="h-10 flex-1 rounded-xl border-primary-base/20 bg-white"
                            />
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {createStep === 3 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.pricing.price')}</Label>
                        <Input
                          value={draftProduct.price}
                          onChange={(e) => setDraftProduct((p) => ({ ...p, price: e.target.value }))}
                          placeholder={t('products.create.pricing.pricePlaceholder')}
                          className="h-10 rounded-xl border-primary-base/20 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.pricing.compareAt')}</Label>
                        <Input
                          value={draftProduct.compareAt}
                          onChange={(e) => setDraftProduct((p) => ({ ...p, compareAt: e.target.value }))}
                          placeholder={t('products.create.pricing.compareAtPlaceholder')}
                          className="h-10 rounded-xl border-primary-base/20 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.pricing.cost')}</Label>
                        <Input
                          value={draftProduct.cost}
                          onChange={(e) => setDraftProduct((p) => ({ ...p, cost: e.target.value }))}
                          placeholder={t('products.create.pricing.costPlaceholder')}
                          className="h-10 rounded-xl border-primary-base/20 bg-white"
                        />
                      </div>
                      <div className="rounded-2xl border border-primary-base/20 bg-primary-alpha-10/30 p-4 text-sm text-text-sub-600">
                        <div className="flex items-center gap-2 font-semibold text-text-strong-950">
                          <Sparkles className="h-4 w-4" />
                          {t('products.create.pricing.smartHintTitle')}
                        </div>
                        <div className="mt-2 text-sm text-text-sub-600">{t('products.create.pricing.smartHintBody')}</div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {createStep === 4 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary-base/20 bg-white px-4 py-3 shadow-sm">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-strong-950">{t('products.create.sections.applies')}</div>
                        <div className="mt-0.5 text-xs font-medium text-text-soft-400">{t('products.create.sections.deliveryHint')}</div>
                      </div>
                      <Switch
                        checked={draftProduct.deliverySectionEnabled}
                        onCheckedChange={(v) => setSectionEnabled('delivery', Boolean(v))}
                      />
                    </div>

                    {!draftProduct.deliverySectionEnabled ? (
                      <div className="rounded-2xl border border-dashed border-primary-base/20 bg-primary-alpha-10/30 p-6">
                        <div className="text-sm font-semibold text-text-strong-950">{t('products.create.sections.skippedTitle')}</div>
                        <div className="mt-1 text-sm text-text-sub-600">{t('products.create.sections.skippedBody')}</div>
                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={() => setSectionEnabled('delivery', true)}
                            className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker"
                          >
                            {t('products.create.sections.enable')}
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {draftProduct.deliverySectionEnabled ? (
                      <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.delivery.enabled')}</Label>
                            <select
                              value={draftProduct.deliveryEnabled ? 'yes' : 'no'}
                              onChange={(e) =>
                                setDraftProduct((p) => ({ ...p, deliveryEnabled: e.target.value === 'yes' }))
                              }
                              className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-white px-3 text-sm text-text-strong-950"
                            >
                              <option value="yes">{t('products.viewSheet.yes')}</option>
                              <option value="no">{t('products.viewSheet.no')}</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.delivery.location')}</Label>
                            <Input
                              value={draftProduct.deliveryLocation}
                              onChange={(e) => setDraftProduct((p) => ({ ...p, deliveryLocation: e.target.value }))}
                              placeholder={t('products.create.delivery.locationPlaceholder')}
                              className="h-10 rounded-xl border-primary-base/20 bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.delivery.price')}</Label>
                            <Input
                              value={draftProduct.deliveryPrice}
                              onChange={(e) => setDraftProduct((p) => ({ ...p, deliveryPrice: e.target.value }))}
                              placeholder={t('products.create.delivery.pricePlaceholder')}
                              className="h-10 rounded-xl border-primary-base/20 bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-text-sub-600">{t('products.create.delivery.internalNote')}</Label>
                          <Textarea
                            value={draftProduct.internalNote}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, internalNote: e.target.value }))}
                            placeholder={t('products.create.delivery.internalNotePlaceholder')}
                            className="min-h-[120px] rounded-xl border-primary-base/20 bg-white"
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {createStep === 5 ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-text-strong-950">{t('products.create.review.title')}</div>
                          <div className="mt-1 text-xs font-medium text-text-soft-400">{t('products.create.review.subtitle')}</div>
                        </div>
                        <Badge className="rounded-full border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 hover:bg-bg-weak-50">
                          {statusLabel(draftProduct.status)}
                        </Badge>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-text-soft-400">{t('products.create.fields.name')}</div>
                          <div className="text-sm font-semibold text-text-strong-950">{draftProduct.name || t('products.table.na')}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-text-soft-400">{t('products.create.fields.vendor')}</div>
                          <div className="text-sm font-semibold text-text-strong-950">{draftProduct.vendor || t('products.table.na')}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-text-soft-400">{t('products.create.fields.category')}</div>
                          <div className="text-sm font-semibold text-text-strong-950">{draftProduct.category || t('products.table.na')}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-text-soft-400">{t('products.create.pricing.price')}</div>
                          <div className="text-sm font-semibold text-text-strong-950">{draftProduct.price || t('products.table.na')}</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                          <Sparkles className="h-4 w-4" />
                          {t('products.create.review.nextTitle')}
                        </div>
                        <div className="mt-2 text-sm text-text-sub-600">{t('products.create.review.nextBody')}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <div className="border-t border-stroke-soft-200 px-6 py-4">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreate}
                  disabled={isSubmitting || isDraftLoading}
                  className="h-10 rounded-xl border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base disabled:opacity-50"
                >
                  {t('products.create.cancel')}
                </Button>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={createStep === 0 || isSubmitting || isDraftLoading}
                    className="h-10 rounded-xl border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('products.create.back')}
                  </Button>
                  {createStep < createSteps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canGoNext || isSubmitting || isDraftLoading}
                      className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker disabled:opacity-50"
                    >
                      {t('products.create.next')}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void handleFinish()}
                      disabled={isSubmitting || isDraftLoading}
                      className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker disabled:opacity-50"
                    >
                      {isEditMode ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Update Product
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {t('products.create.finish')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
