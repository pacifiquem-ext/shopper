/**
 * Print utilities for generating PDFs from HTML content
 */

export interface PrintOptions {
  title?: string
  selector?: string
  hideSelector?: string
  customStyles?: string
}

/**
 * Opens a print dialog for the specified HTML content
 * @param options - Configuration options for printing
 */
export function printContent(options: PrintOptions = {}): void {
  const {
    title = 'Print',
    selector = '[data-print]',
    hideSelector = '[data-hide-print]',
    customStyles = '',
  } = options

  const win = window.open('', '_blank')
  if (!win) {
    console.error('Failed to open print window. Please check popup blocker settings.')
    return
  }

  const content = document.querySelector(selector)
  if (!content) {
    console.error(`No content found with selector: ${selector}`)
    win.close()
    return
  }

  const defaultStyles = `
    @media print {
      body { margin: 0; }
      ${hideSelector} { display: none !important; }
    }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      line-height: 1.5;
      color: #111827;
    }
    * {
      box-sizing: border-box;
    }
  `

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          ${defaultStyles}
          ${customStyles}
        </style>
      </head>
      <body>
        ${content.outerHTML}
      </body>
    </html>
  `)
  
  win.document.close()
  win.focus()
  
  // Small delay to ensure content is loaded before printing
  setTimeout(() => {
    win.print()
  }, 250)
}

/**
 * Downloads HTML content as PDF (opens print dialog)
 * This is a convenience wrapper around printContent
 */
export function downloadAsPdf(options: PrintOptions = {}): void {
  printContent(options)
}
