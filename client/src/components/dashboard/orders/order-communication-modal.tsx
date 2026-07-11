import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { InlineLoadingState } from '@/components/dashboard/shared/loading-placeholders'
import { cn } from '@/lib/utils'
import { Send, User, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type Message = {
  id: string
  sender: 'admin' | 'customer'
  senderName: string
  message: string
  timestamp: string
}

type OrderCommunicationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  customerName: string
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoadingMessages?: boolean
}

export function OrderCommunicationModal({
  open,
  onOpenChange,
  orderId,
  customerName,
  messages,
  onSendMessage,
  isLoadingMessages = false,
}: OrderCommunicationModalProps) {
  const t = useTranslations('dashboard')
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-stroke-soft-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-text-strong-950">{t('orders.communication.title')}</DialogTitle>
          <DialogDescription className="text-text-sub-600">
            {t('orders.communication.description', { customerName, orderId })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-xl border border-stroke-soft-200 bg-white">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 p-5">
              {isLoadingMessages ? (
                <InlineLoadingState label={t('orders.communication.loading')} />
              ) : messages.length === 0 ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-weak-50">
                      <Send className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-text-strong-950">
                      {t('orders.communication.emptyTitle')}
                    </p>
                    <p className="mt-1 text-xs text-text-soft-400">
                      {t('orders.communication.emptyDescription', { customerName })}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        msg.sender === 'admin'
                          ? 'bg-primary-alpha-10 text-primary-darker'
                          : 'bg-bg-weak-50 text-text-sub-600'
                      )}
                    >
                      {msg.sender === 'admin' ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={cn(
                        'flex max-w-[75%] flex-col gap-1.5',
                        msg.sender === 'admin' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-strong-950">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-text-soft-400">{msg.timestamp}</span>
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                          msg.sender === 'admin'
                            ? 'bg-primary-base text-white'
                            : 'bg-bg-weak-50 text-text-strong-950'
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-stroke-soft-200 p-4">
            <div className="flex gap-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('orders.communication.placeholder')}
                className="min-h-[100px] resize-none rounded-xl border-stroke-soft-200 bg-white text-sm focus-visible:ring-primary-base"
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="h-auto shrink-0 rounded-xl bg-primary-base px-5 text-white hover:bg-primary-darker disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">{t('orders.communication.sendAria')}</span>
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-soft-400">{t('orders.communication.hint')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
