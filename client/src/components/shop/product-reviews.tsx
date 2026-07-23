'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import * as Input from '@/components/alignui/input'
import * as Label from '@/components/alignui/label'
import { Textarea } from '@/components/alignui/textarea'
import { EmptyState } from '@/components/alignui/empty'
import { Link } from '@/i18n/navigation'
import { useAuthStore } from '@/store/auth.store'
import {
  fetchProductReviews,
  submitProductReview,
  type ProductReviewPublic,
} from '@/services/catalog.service'

export function ProductReviews({ productId }: { productId: string }) {
  const t = useTranslations('marketplace.reviews')
  const accessToken = useAuthStore((s) => s.accessToken)
  const [reviews, setReviews] = useState<ProductReviewPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setReviews(await fetchProductReviews(productId))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void load()
  }, [load])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) {
      toast.error(t('loginRequired'))
      return
    }
    setSubmitting(true)
    try {
      await submitProductReview(productId, {
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
      })
      toast.success(t('submitted'))
      setTitle('')
      setBody('')
      setRating(5)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10 space-y-6 border-t border-stroke-soft-200 pt-10">
      <div>
        <h2 className="text-title-h6 text-text-strong-950">{t('title')}</h2>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-paragraph-sm text-text-sub-600">{t('loading')}</p>
      ) : reviews.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <Card className="space-y-1 p-4">
                <p className="text-label-sm text-text-strong-950">
                  {t('ratingStars', { rating: review.rating })}
                  {review.title ? ` · ${review.title}` : ''}
                </p>
                {review.body ? (
                  <p className="text-paragraph-sm text-text-sub-600">{review.body}</p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="space-y-4 p-5">
        <h3 className="text-label-md text-text-strong-950">{t('writeTitle')}</h3>
        {!accessToken ? (
          <p className="text-paragraph-sm text-text-sub-600">
            {t('loginPrompt')}{' '}
            <Link href="/login" className="font-semibold text-primary-base hover:underline">
              {t('loginLink')}
            </Link>
          </p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label.Root htmlFor="review-rating">{t('ratingLabel')}</Label.Root>
              <select
                id="review-rating"
                className="h-10 w-full rounded-10 bg-bg-white-0 px-3 text-paragraph-sm shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label.Root htmlFor="review-title">{t('titleLabel')}</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('titlePlaceholder')}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label.Root htmlFor="review-body">{t('bodyLabel')}</Label.Root>
              <Textarea
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('bodyPlaceholder')}
                rows={3}
              />
            </div>
            <div className="sm:col-span-2">
              <Button.Root type="submit" variant="primary" disabled={submitting}>
                {submitting ? t('submitting') : t('submit')}
              </Button.Root>
            </div>
          </form>
        )}
      </Card>
    </section>
  )
}
