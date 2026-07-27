import { renderEmailLayout } from './email-layout'

export function welcomeEmailHtml(input: {
  fullName: string
  dashboardUrl: string
}): string {
  return renderEmailLayout({
    title: `Welcome, ${input.fullName}`,
    preheader: 'Your Shopper account is ready.',
    bodyHtml: `
      <p style="margin:0 0 12px;">Thanks for joining Shopper. You can set up your retail storefront, add products, and start receiving orders.</p>
      <p style="margin:0;">Use the button below to open your merchant dashboard.</p>
    `,
    cta: { label: 'Open dashboard', url: input.dashboardUrl },
    footerNote: 'If you did not create this account, you can ignore this email.',
  })
}

export function passwordResetEmailHtml(input: {
  fullName: string
  resetUrl: string
  otpCode?: string
}): string {
  const otpBlock = input.otpCode
    ? `<p style="margin:16px 0;padding:14px 16px;border-radius:10px;background:#f7f7f7;border:1px solid #ebebeb;font-size:24px;letter-spacing:0.28em;font-weight:700;color:#171717;text-align:center;">${input.otpCode}</p>`
    : ''
  return renderEmailLayout({
    title: 'Reset your password',
    preheader: 'Use this code or link to reset your Shopper password.',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${input.fullName || 'there'}, we received a request to reset your password.</p>
      ${otpBlock}
      <p style="margin:0;">Or continue with the secure link below. This request expires soon.</p>
    `,
    cta: { label: 'Reset password', url: input.resetUrl },
    footerNote: 'If you did not request a reset, you can safely ignore this email.',
  })
}

export function orderConfirmationEmailHtml(input: {
  customerName: string
  orderNumber: string
  storeName: string
  totalLabel: string
  orderUrl?: string
}): string {
  return renderEmailLayout({
    title: `Order ${input.orderNumber} confirmed`,
    preheader: `Your order from ${input.storeName} is confirmed.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${input.customerName}, thanks for shopping with <strong style="color:#171717;">${input.storeName}</strong>.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #ebebeb;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:12px 14px;background:#f7f7f7;font-size:12px;color:#5c5c5c;">Order number</td>
          <td style="padding:12px 14px;background:#f7f7f7;font-size:13px;font-weight:600;color:#171717;text-align:right;">${input.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:12px 14px;font-size:12px;color:#5c5c5c;">Total</td>
          <td style="padding:12px 14px;font-size:13px;font-weight:600;color:#1daf61;text-align:right;">${input.totalLabel}</td>
        </tr>
      </table>
      <p style="margin:0;">We will notify the store so they can prepare and fulfill your order.</p>
    `,
    cta: input.orderUrl
      ? { label: 'View order details', url: input.orderUrl }
      : undefined,
    footerNote: 'Questions? Reply to this email or contact the store from your order page.',
  })
}

export function storeApprovedEmailHtml(input: {
  ownerName: string
  storeName: string
  storeUrl: string
}): string {
  return renderEmailLayout({
    title: `${input.storeName} is live`,
    preheader: 'Your store has been approved on Shopper.',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${input.ownerName}, great news — <strong style="color:#171717;">${input.storeName}</strong> has been approved.</p>
      <p style="margin:0;">Share your storefront link and start selling. You can still change your template anytime from Store settings → Branding.</p>
    `,
    cta: { label: 'View storefront', url: input.storeUrl },
  })
}
