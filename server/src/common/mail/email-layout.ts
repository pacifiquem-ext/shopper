/** AlignUI-aligned HTML email shell for Shopper transactional mail. */

export type EmailLayoutOptions = {
  title: string
  preheader?: string
  bodyHtml: string
  footerNote?: string
  cta?: { label: string; url: string }
}

const BRAND = {
  primary: '#1daf61',
  primaryDark: '#178c4e',
  ink: '#171717',
  muted: '#5c5c5c',
  bg: '#f7f7f7',
  surface: '#ffffff',
  border: '#ebebeb',
  white: '#ffffff',
}

export function renderEmailLayout(opts: EmailLayoutOptions): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(opts.preheader)}</div>`
    : ''
  const cta = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
        <tr>
          <td style="border-radius:10px;background:${BRAND.primary};">
            <a href="${escapeAttr(opts.cta.url)}" style="display:inline-block;padding:12px 22px;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${BRAND.white};text-decoration:none;">
              ${escapeHtml(opts.cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const footer = opts.footerNote
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(opts.footerNote)}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:20px 28px;background:${BRAND.ink};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:36px;height:36px;border-radius:10px;background:${BRAND.primary};text-align:center;vertical-align:middle;color:${BRAND.white};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;">
                    S
                  </td>
                  <td style="padding-left:12px;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:${BRAND.white};">
                    Shopper
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 28px;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:600;color:${BRAND.ink};">
                ${escapeHtml(opts.title)}
              </h1>
              <div style="font-size:14px;line-height:1.65;color:${BRAND.muted};">
                ${opts.bodyHtml}
              </div>
              ${cta}
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 22px;border-top:1px solid ${BRAND.border};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:${BRAND.muted};">
              © Shopper · Building Africa’s marketplace from Rwanda.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;')
}

export { BRAND as EMAIL_BRAND }
