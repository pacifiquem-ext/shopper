import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Send, User, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

type Message = {
  id: string
  sender: 'admin' | 'customer'
  senderName: string
  message: string
  timestamp: string
}

type OrderConversationProps = {
  orderId: string
  customerName: string
  messages: Message[]
  onSendMessage: (message: string) => void
  title: string
  placeholder: string
  sendLabel: string
  emptyStateText: string
}

export function OrderConversation({
  orderId,
  customerName,
  messages,
  onSendMessage,
  title,
  placeholder,
  sendLabel,
  emptyStateText,
}: OrderConversationProps) {
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
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-xs font-medium text-gray-500">
          Communicate with {customerName} about order {orderId}
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4 p-5">
          {messages.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Send className="h-6 w-6 text-gray-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-500">{emptyStateText}</p>
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
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    msg.sender === 'admin'
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-gray-100 text-gray-700'
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
                    'flex max-w-[75%] flex-col gap-1',
                    msg.sender === 'admin' ? 'items-end' : 'items-start'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm',
                      msg.sender === 'admin'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-900'
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

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] resize-none rounded-xl border-gray-200 bg-white text-sm focus-visible:ring-brand-600"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="h-auto shrink-0 rounded-xl bg-brand-600 px-4 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">{sendLabel}</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
