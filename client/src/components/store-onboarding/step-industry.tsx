'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { StepHeader } from './step-header'
import { useWizardField } from './wizard-context'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/helpers'
import { referencesService, IndustrySector, BusinessCategory } from '@/services/references.service'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export function StepIndustry() {
  const t = useTranslations('storeOnboarding')
  const { draft, setIndustrySectorId, setBusinessCategoryId } = useStoreOnboardingStore()

  const { hasError: indError, errorMessage: indMsg } = useWizardField('industrySectorId')
  const { hasError: catError, errorMessage: catMsg } = useWizardField('businessCategoryId')

  const [industries, setIndustries] = useState<IndustrySector[]>([])
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [isLoadingInd, setIsLoadingInd] = useState(true)
  const [isLoadingCat, setIsLoadingCat] = useState(false)

  const [openInd, setOpenInd] = useState(false)
  const [openCat, setOpenCat] = useState(false)

  // Fetch Industries on mount
  useEffect(() => {
    let mounted = true
    const fetchIndustries = async () => {
      setIsLoadingInd(true)
      try {
        const payload = (await referencesService.getIndustries()) as any
        const data = payload?.data || payload
        if (mounted && Array.isArray(data)) {
          setIndustries(data)
        }
      } catch (err) {
        console.error('Failed to fetch industries', err)
      } finally {
        if (mounted) setIsLoadingInd(false)
      }
    }
    fetchIndustries()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch Categories whenever selected industry changes
  useEffect(() => {
    let mounted = true
    const fetchCategories = async () => {
      if (!draft.industrySectorId) {
        setCategories([])
        return
      }
      setIsLoadingCat(true)
      try {
        const payload = (await referencesService.getCategories(draft.industrySectorId)) as any
        const data = payload?.data || payload
        if (mounted && Array.isArray(data)) {
          setCategories(data)
        }
      } catch (err) {
        console.error('Failed to fetch categories', err)
      } finally {
        if (mounted) setIsLoadingCat(false)
      }
    }
    fetchCategories()
    return () => {
      mounted = false
    }
  }, [draft.industrySectorId])

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('industry.title', {
          defaultValue: 'What specific category is your business?',
        })}
        subtitle={t('industry.subtitle', {
          defaultValue: 'Help us categorize your store for customers to find you easily.',
        })}
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className={cn('text-sm font-medium', indError ? 'text-red-500' : 'text-gray-700')}>
            {t('industry.sectorLabel', { defaultValue: 'Industry Sector' })}
          </Label>
          <Popover open={openInd} onOpenChange={setOpenInd}>
            <PopoverTrigger asChild disabled={isLoadingInd}>
              <button
                type="button"
                className={cn(
                  'focus:border-brand-500 focus:ring-brand-500 flex h-14 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 shadow-sm outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  indError && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
              >
                {isLoadingInd ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('industry.loading', { defaultValue: 'Loading sectors...' })}</span>
                  </div>
                ) : (
                  <span className={!draft.industrySectorId ? 'text-gray-500' : 'truncate'}>
                    {draft.industrySectorId
                      ? industries.find((ind) => ind.id === draft.industrySectorId)?.name
                      : t('industry.sectorPlaceholder', { defaultValue: 'Select your sector' })}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="z-100 max-h-80 w-(--radix-popover-trigger-width) rounded-xl border border-gray-200 bg-white p-0 shadow-xl"
              align="start"
              sideOffset={4}
            >
              <Command className="w-full bg-transparent">
                <CommandInput
                  placeholder="Search sectors..."
                  className="h-12 border-none text-gray-900 ring-0 outline-hidden placeholder:text-gray-500"
                />
                <CommandList className="max-h-60 overflow-y-auto p-1">
                  <CommandEmpty className="p-4 text-center text-sm text-gray-500">
                    No sectors found.
                  </CommandEmpty>
                  <CommandGroup>
                    {industries.map((ind) => (
                      <CommandItem
                        key={ind.id}
                        value={ind.name}
                        onSelect={() => {
                          setIndustrySectorId(ind.id)
                          setBusinessCategoryId('') // Reset category when industry changes
                          setOpenInd(false)
                        }}
                        className="data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-900 cursor-pointer rounded-lg px-2 py-3 text-base text-gray-900 transition-colors"
                      >
                        <Check
                          className={cn(
                            'text-brand-600 mr-2 h-4 w-4 shrink-0',
                            draft.industrySectorId === ind.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className="truncate">{ind.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {indError && <p className="mt-1 text-sm font-medium text-red-500">{indMsg}</p>}
        </div>

        {draft.industrySectorId && (
          <div className="animate-in fade-in slide-in-from-top-4 space-y-3 duration-300">
            <Label
              className={cn('text-sm font-medium', catError ? 'text-red-500' : 'text-gray-700')}
            >
              {t('industry.categoryLabel', { defaultValue: 'Business Category' })}
            </Label>
            <Popover open={openCat} onOpenChange={setOpenCat}>
              <PopoverTrigger asChild disabled={isLoadingCat || categories.length === 0}>
                <button
                  type="button"
                  className={cn(
                    'focus:border-brand-500 focus:ring-brand-500 flex h-14 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 shadow-sm outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    catError && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  )}
                >
                  {isLoadingCat ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {t('industry.loadingCat', { defaultValue: 'Loading categories...' })}
                      </span>
                    </div>
                  ) : (
                    <span className={!draft.businessCategoryId ? 'text-gray-500' : 'truncate'}>
                      {draft.businessCategoryId
                        ? categories.find((cat) => cat.id === draft.businessCategoryId)?.name
                        : t('industry.categoryPlaceholder', {
                            defaultValue: 'Select your category',
                          })}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="z-100 max-h-80 w-(--radix-popover-trigger-width) rounded-xl border border-gray-200 bg-white p-0 shadow-xl"
                align="start"
                sideOffset={4}
              >
                <Command className="w-full bg-transparent">
                  <CommandInput
                    placeholder="Search categories..."
                    className="h-12 border-none text-gray-900 ring-0 outline-hidden placeholder:text-gray-500"
                  />
                  <CommandList className="max-h-60 overflow-y-auto p-1">
                    <CommandEmpty className="p-4 text-center text-sm text-gray-500">
                      No categories found.
                    </CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onSelect={() => {
                            setBusinessCategoryId(cat.id)
                            setOpenCat(false)
                          }}
                          className="data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-900 cursor-pointer rounded-lg px-2 py-3 text-base text-gray-900 transition-colors"
                        >
                          <Check
                            className={cn(
                              'text-brand-600 mr-2 h-4 w-4 shrink-0',
                              draft.businessCategoryId === cat.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <span className="truncate">{cat.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {catError && <p className="mt-1 text-sm font-medium text-red-500">{catMsg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
