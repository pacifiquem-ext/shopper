'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { CartItem } from '@/lib/cart-storage'
import { placeGuestOrder } from '@/services/catalog.service'
import { toast } from 'sonner'

const phoneRegex = /^\+[1-9]\d{1,14}$/

type PlaceOrderPhoneInput = {
  customerPhone: string
}

type PlaceOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  onSuccess: (
    orders: Array<{ id: string; orderNumber: string; storeName: string; total: number }>,
    customerPhone: string,
  ) => void
}

export function PlaceOrderDialog({
  open,
  onOpenChange,
  items,
  onSuccess,
}: PlaceOrderDialogProps) {
  const t = useTranslations('cart')
  const [submitting, setSubmitting] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        customerPhone: z
          .string()
          .min(1, t('placeOrderPhoneRequired'))
          .regex(phoneRegex, t('placeOrderPhoneInvalid')),
      }),
    [t],
  )

  const form = useForm<PlaceOrderPhoneInput>({
    resolver: zodResolver(schema),
    defaultValues: { customerPhone: '' },
  })

  const handleOpenChange = (next: boolean) => {
    if (!submitting) {
      onOpenChange(next)
      if (!next) {
        form.reset()
      }
    }
  }

  const onSubmit = async (values: PlaceOrderPhoneInput) => {
    if (items.length === 0) return

    setSubmitting(true)
    try {
      const result = await placeGuestOrder({
        customerPhone: values.customerPhone.trim(),
        paymentMethod: 'MOBILE_MONEY',
        items: items.map((item) => ({
          productVariantId: item.variantId,
          quantity: item.quantity,
        })),
      })

      const count = result.orders.length
      toast.success(
        count === 1
          ? t('placeOrderSuccessOne', { orderNumber: result.orders[0]?.orderNumber ?? '' })
          : t('placeOrderSuccessMany', { count }),
      )
      form.reset()
      onOpenChange(false)
      onSuccess(
        result.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          storeName: o.storeName,
          total: o.total,
        })),
        values.customerPhone.trim(),
      )
    } catch (error: unknown) {
      const raw =
        error instanceof Error && error.message ? error.message : t('placeOrderError')
      const stockMatch = /Insufficient stock\. Available: (\d+), Requested: (\d+)/.exec(raw)
      const message = stockMatch
        ? t('placeOrderInsufficientStock', {
            available: Number(stockMatch[1]),
            requested: Number(stockMatch[2]),
          })
        : raw
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('placeOrderTitle')}</DialogTitle>
          <DialogDescription>{t('placeOrderDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='customerPhone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('placeOrderPhoneLabel')}</FormLabel>
                  <div className='relative'>
                    <Phone
                      className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
                      aria-hidden
                    />
                    <FormControl>
                      <Input
                        {...field}
                        type='tel'
                        autoComplete='tel'
                        placeholder={t('placeOrderPhonePlaceholder')}
                        className='pl-9'
                        disabled={submitting}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>{t('placeOrderPhoneHint')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                {t('placeOrderCancel')}
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' aria-hidden />
                    {t('placeOrderSubmitting')}
                  </>
                ) : (
                  t('placeOrderConfirm')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
