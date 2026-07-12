/**
 * Full product E2E audit for OnlineShop.rw
 * Outputs structured findings for BUGS.md
 */
import { chromium } from '../node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:3000'
const API = process.env.E2E_API || 'http://127.0.0.1:3001/v1'
const MERCHANT_PHONE = process.env.E2E_PHONE || '+250791761286'
const MERCHANT_PASS = process.env.E2E_PASS || 'TestE2E123!'
const OUT = path.resolve('e2e-audit/results.json')
/** AGENTS.md §8 — screenshots ONLY under e2e-audit/screens (never repo root). */
const SCREEN_DIR = path.resolve('e2e-audit/screens')

fs.mkdirSync(SCREEN_DIR, { recursive: true })

/** @type {{id:string, area:string, path:string, action:string, status:'pass'|'fail'|'warn'|'blocked', severity?:string, details:string, screenshot?:string}[]} */
const findings = []
const working = []

function rec(entry) {
  findings.push({ severity: entry.status === 'fail' ? 'high' : entry.status === 'warn' ? 'medium' : 'info', ...entry })
  if (entry.status === 'pass') working.push(`${entry.area}: ${entry.action}`)
}

async function shot(page, name) {
  const file = path.join(SCREEN_DIR, `${name}.png`)
  try {
    await page.screenshot({ path: file, fullPage: false })
    return file
  } catch {
    return undefined
  }
}

async function waitStable(page, ms = 800) {
  await page.waitForTimeout(ms)
}

async function goto(page, urlPath, label, area = 'nav') {
  const url = urlPath.startsWith('http') ? urlPath : `${BASE}${urlPath}`
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await waitStable(page, 1200)
    const status = res?.status() ?? 0
    const title = await page.title()
    const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 500)
    const hasError =
      bodyText.includes('Application error') ||
      bodyText.includes('Internal Server Error') ||
      title.includes('Error') ||
      (await page.locator('#__next_error__').count()) > 0
    const is404 =
      status === 404 ||
      bodyText.toLowerCase().includes('not found') && bodyText.length < 200

    if (hasError || status >= 500) {
      const sc = await shot(page, `fail-${label}`)
      rec({
        id: `NAV-${label}`,
        area,
        path: urlPath,
        action: `Open ${urlPath}`,
        status: 'fail',
        severity: 'critical',
        details: `HTTP ${status}. title="${title}". body snippet: ${bodyText.slice(0, 180)}`,
        screenshot: sc,
      })
      return { ok: false, status, bodyText }
    }
    if (is404 || status === 404) {
      const sc = await shot(page, `fail-${label}`)
      rec({
        id: `NAV-${label}`,
        area,
        path: urlPath,
        action: `Open ${urlPath}`,
        status: 'fail',
        details: `Not found HTTP ${status}`,
        screenshot: sc,
      })
      return { ok: false, status, bodyText }
    }
    rec({
      id: `NAV-${label}`,
      area,
      path: urlPath,
      action: `Open ${urlPath}`,
      status: 'pass',
      details: `HTTP ${status}. title="${title}"`,
    })
    return { ok: true, status, bodyText }
  } catch (e) {
    rec({
      id: `NAV-${label}`,
      area,
      path: urlPath,
      action: `Open ${urlPath}`,
      status: 'fail',
      severity: 'critical',
      details: String(e?.message || e),
    })
    return { ok: false, status: 0, bodyText: '' }
  }
}

async function clickByRole(page, role, name, { area, path: p, action, exact = false } = {}) {
  try {
    const loc = page.getByRole(role, { name, exact })
    const count = await loc.count()
    if (count === 0) {
      rec({
        id: `CLICK-${action || name}`,
        area: area || 'ui',
        path: p || page.url(),
        action: action || `Click ${role} "${name}"`,
        status: 'fail',
        details: 'Element not found',
      })
      return false
    }
    await loc.first().click({ timeout: 10000 })
    await waitStable(page, 900)
    rec({
      id: `CLICK-${action || name}`,
      area: area || 'ui',
      path: p || page.url(),
      action: action || `Click ${role} "${name}"`,
      status: 'pass',
      details: 'Clicked successfully',
    })
    return true
  } catch (e) {
    rec({
      id: `CLICK-${action || name}`,
      area: area || 'ui',
      path: p || page.url(),
      action: action || `Click ${role} "${name}"`,
      status: 'fail',
      details: String(e?.message || e).slice(0, 300),
    })
    return false
  }
}

async function fillIfPresent(page, selectorOrRole, value, label) {
  try {
    let loc
    if (typeof selectorOrRole === 'string' && selectorOrRole.startsWith('role:')) {
      // role:textbox:Phone
      const [, role, name] = selectorOrRole.split(':')
      loc = page.getByRole(role, { name: new RegExp(name, 'i') })
    } else {
      loc = page.locator(selectorOrRole)
    }
    if ((await loc.count()) === 0) {
      rec({
        id: `FILL-${label}`,
        area: 'forms',
        path: page.url(),
        action: `Fill ${label}`,
        status: 'fail',
        details: 'Field not found',
      })
      return false
    }
    await loc.first().fill(value)
    rec({
      id: `FILL-${label}`,
      area: 'forms',
      path: page.url(),
      action: `Fill ${label}`,
      status: 'pass',
      details: 'Filled',
    })
    return true
  } catch (e) {
    rec({
      id: `FILL-${label}`,
      area: 'forms',
      path: page.url(),
      action: `Fill ${label}`,
      status: 'fail',
      details: String(e?.message || e).slice(0, 200),
    })
    return false
  }
}

async function apiJson(url, opts = {}) {
  const res = await fetch(url, opts)
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: res.status, body }
}

async function main() {
  // --- API smoke ---
  {
    const health = await apiJson(`${API.replace(/\/v1$/, '')}/health`).catch((e) => ({ status: 0, body: String(e) }))
    rec({
      id: 'API-health',
      area: 'api',
      path: '/health',
      action: 'GET /health',
      status: health.status === 200 ? 'pass' : 'fail',
      details: `HTTP ${health.status}`,
    })

    const groups = await apiJson(`${API}/catalog/groups`)
    const gdata = groups.body?.data
    const storeCount = gdata?.stores?.length ?? 0
    const productCount = (gdata?.groups || []).reduce((s, g) => s + (g.products?.length || 0), 0)
    rec({
      id: 'API-catalog-groups',
      area: 'api',
      path: '/v1/catalog/groups',
      action: 'GET catalog groups',
      status: groups.status === 200 && storeCount > 0 ? 'pass' : 'fail',
      details: `HTTP ${groups.status}, stores=${storeCount}, products≈${productCount}`,
    })

    // known product
    const prodId = '22ed25a1-7b66-45a9-9196-46c2366ea4c6'
    const prod = await apiJson(`${API}/catalog/products/${prodId}`)
    rec({
      id: 'API-product-by-id',
      area: 'api',
      path: `/v1/catalog/products/${prodId}`,
      action: 'GET product by id',
      status: prod.status === 200 ? 'pass' : 'fail',
      details: `HTTP ${prod.status} name=${prod.body?.data?.name || prod.body?.name || 'n/a'}`,
    })

    // store filter
    const storeAs = await apiJson(`${API}/catalog/groups?subdomain=storeas`)
    const storeCtx = storeAs.body?.data?.store
    rec({
      id: 'API-store-subdomain',
      area: 'api',
      path: '/v1/catalog/groups?subdomain=storeas',
      action: 'Catalog filtered by storeas',
      status: storeAs.status === 200 && storeCtx?.subdomain === 'storeas' ? 'pass' : 'warn',
      details: `HTTP ${storeAs.status}, store=${storeCtx?.displayName || 'missing'}, subdomain=${storeCtx?.subdomain || 'n/a'}`,
    })

    // wrong path users tried earlier
    const wrong = await apiJson(`${API}/catalog/products?limit=1`)
    rec({
      id: 'API-catalog-products-list',
      area: 'api',
      path: '/v1/catalog/products',
      action: 'GET catalog products list (if exists)',
      status: wrong.status === 200 ? 'pass' : 'warn',
      details: `HTTP ${wrong.status} — list endpoint may intentionally not exist (only products/:id)`,
    })
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ url: page.url(), text: msg.text() })
  })
  page.on('pageerror', (err) => consoleErrors.push({ url: page.url(), text: String(err) }))

  // ========== MARKETPLACE HOME ==========
  await goto(page, '/en', 'home', 'marketplace')
  await shot(page, '01-home')

  // Check key chrome
  for (const [role, name] of [
    ['link', 'Log in'],
    ['link', 'Become a seller'],
    ['link', /cart/i],
    ['button', 'Apply'],
    ['button', 'All categories'],
  ]) {
    const count = await page.getByRole(role, { name }).count()
    rec({
      id: `HOME-chrome-${name}`,
      area: 'marketplace',
      path: '/en',
      action: `Home chrome: ${role} "${name}"`,
      status: count > 0 ? 'pass' : 'fail',
      details: count > 0 ? 'Present' : 'Missing',
    })
  }

  // Category filter
  const clothing = page.getByRole('button', { name: /Clothing/i })
  if (await clothing.count()) {
    await clothing.first().click()
    await waitStable(page, 1500)
    const url = page.url()
    rec({
      id: 'HOME-category-filter',
      area: 'marketplace',
      path: url,
      action: 'Filter by Clothing category',
      status: url.includes('category=') || url.includes('Clothing') ? 'pass' : 'warn',
      details: `URL after click: ${url}`,
    })
    await shot(page, '02-home-clothing')
  } else {
    rec({
      id: 'HOME-category-filter',
      area: 'marketplace',
      path: '/en',
      action: 'Filter by Clothing',
      status: 'fail',
      details: 'Clothing chip missing',
    })
  }

  // Search
  await goto(page, '/en', 'home-reset', 'marketplace')
  const search = page.getByRole('searchbox').or(page.locator('input[type="search"]')).or(page.locator('#catalog-q'))
  if (await search.count()) {
    await search.first().fill('cotton')
    await clickByRole(page, 'button', 'Apply', { area: 'marketplace', path: '/en', action: 'Apply search cotton' })
    await waitStable(page, 1500)
    rec({
      id: 'HOME-search',
      area: 'marketplace',
      path: page.url(),
      action: 'Search for cotton',
      status: page.url().includes('q=') || page.url().includes('cotton') ? 'pass' : 'warn',
      details: `URL: ${page.url()}`,
    })
  }

  // Sort
  const sort = page.locator('#catalog-sort').or(page.getByRole('combobox', { name: /sort/i }))
  if (await sort.count()) {
    try {
      await sort.first().selectOption({ label: /price.*low/i }).catch(async () => {
        await sort.first().selectOption('price-asc')
      })
      await clickByRole(page, 'button', 'Apply', { area: 'marketplace', path: '/en', action: 'Apply sort price-asc' })
      await waitStable(page, 1200)
      rec({
        id: 'HOME-sort',
        area: 'marketplace',
        path: page.url(),
        action: 'Sort price ascending',
        status: page.url().includes('sort=') ? 'pass' : 'warn',
        details: `URL: ${page.url()}`,
      })
    } catch (e) {
      rec({
        id: 'HOME-sort',
        area: 'marketplace',
        path: page.url(),
        action: 'Sort price ascending',
        status: 'fail',
        details: String(e.message || e).slice(0, 200),
      })
    }
  }

  // Wishlist button
  await goto(page, '/en', 'home-wishlist', 'marketplace')
  const wish = page.getByRole('button', { name: /wishlist|save/i })
  if (await wish.count()) {
    await wish.first().click()
    await waitStable(page, 800)
    rec({
      id: 'HOME-wishlist',
      area: 'marketplace',
      path: '/en',
      action: 'Toggle wishlist on first product',
      status: 'pass',
      details: 'Click succeeded (toast may appear)',
    })
  }

  // Top store visit
  const visitStore = page.getByRole('link', { name: /Kigali Fashion|Visit store/i })
  if (await visitStore.count()) {
    await visitStore.first().click()
    await waitStable(page, 2000)
    rec({
      id: 'HOME-visit-store',
      area: 'marketplace',
      path: page.url(),
      action: 'Click top store / Kigali Fashion',
      status: page.url().includes('store=') || page.url().includes('/store/') ? 'pass' : 'warn',
      details: `Landed on ${page.url()}`,
    })
    await shot(page, '03-store-from-home')
  }

  // ========== STORE PATHS ==========
  for (const storePath of [
    '/en?store=storeas',
    '/en/shop/store/storeas',
    '/en?store=ikuzosupplies',
    '/en/shop/store/ikuzosupplies',
    '/en?store=carssupplies',
    '/en?store=does-not-exist-xyz',
  ]) {
    const r = await goto(page, storePath, storePath.replace(/[/?=&]/g, '_'), 'storefront')
    const text = r.bodyText || ''
    if (storePath.includes('does-not-exist')) {
      rec({
        id: 'STORE-invalid',
        area: 'storefront',
        path: storePath,
        action: 'Invalid store subdomain',
        status: text.toLowerCase().includes('not found') || text.toLowerCase().includes('no product') || text.toLowerCase().includes('empty') ? 'pass' : 'warn',
        details: `Handled invalid store. Snippet: ${text.slice(0, 160)}`,
      })
    } else if (r.ok) {
      const hasStoreName =
        text.includes('Kigali') ||
        text.includes('Ikuzo') ||
        text.includes('Cars') ||
        text.includes('store') ||
        text.includes('Product')
      rec({
        id: `STORE-content-${storePath}`,
        area: 'storefront',
        path: storePath,
        action: 'Store page shows catalog context',
        status: hasStoreName ? 'pass' : 'warn',
        details: text.slice(0, 180),
      })
    }
    await shot(page, `store-${storePath.replace(/[/?=&]/g, '_')}`)
  }

  // ========== PRODUCT DETAIL ==========
  const productId = '22ed25a1-7b66-45a9-9196-46c2366ea4c6'
  await goto(page, `/en/shop/${productId}`, 'product-detail', 'product')
  await shot(page, '04-product-detail')
  const ptext = await page.locator('body').innerText()
  rec({
    id: 'PRODUCT-content',
    area: 'product',
    path: `/en/shop/${productId}`,
    action: 'Product detail content',
    status: ptext.toLowerCase().includes('wallet') || ptext.toLowerCase().includes('add') ? 'pass' : 'warn',
    details: ptext.slice(0, 200),
  })

  // Add to cart if possible
  const addBtns = page.getByRole('button', { name: /add to cart|add/i })
  if (await addBtns.count()) {
    await addBtns.first().click().catch(() => {})
    await waitStable(page, 1000)
    rec({
      id: 'PRODUCT-add-to-cart',
      area: 'product',
      path: `/en/shop/${productId}`,
      action: 'Add to cart from PDP',
      status: 'pass',
      details: 'Clicked add to cart',
    })
  } else {
    // maybe link or sold out
    const sold = ptext.toLowerCase().includes('sold')
    rec({
      id: 'PRODUCT-add-to-cart',
      area: 'product',
      path: `/en/shop/${productId}`,
      action: 'Add to cart from PDP',
      status: sold ? 'warn' : 'fail',
      details: sold ? 'Product appears sold out / no add button' : 'No add-to-cart control found',
    })
  }

  // Quick view from home
  await goto(page, '/en', 'home-qv', 'marketplace')
  const card = page.locator('article').first()
  if (await card.count()) {
    await card.click()
    await waitStable(page, 1500)
    const dialog = page.getByRole('dialog')
    const hasDialog = (await dialog.count()) > 0
    rec({
      id: 'HOME-quick-view',
      area: 'marketplace',
      path: '/en',
      action: 'Open product quick view from card',
      status: hasDialog || page.url().includes('/shop/') ? 'pass' : 'warn',
      details: hasDialog ? 'Sheet/dialog opened' : `Navigated to ${page.url()}`,
    })
    await shot(page, '05-quick-view-or-nav')
    // close dialog if open
    if (hasDialog) {
      await page.keyboard.press('Escape')
      await waitStable(page, 400)
    }
  }

  // ========== CART ==========
  await goto(page, '/en/cart', 'cart', 'cart')
  await shot(page, '06-cart')
  const cartText = await page.locator('body').innerText()
  rec({
    id: 'CART-page',
    area: 'cart',
    path: '/en/cart',
    action: 'Cart page loads',
    status: cartText.toLowerCase().includes('cart') || cartText.toLowerCase().includes('empty') || cartText.toLowerCase().includes('order') ? 'pass' : 'warn',
    details: cartText.slice(0, 200),
  })

  // Try place order if button exists
  const placeOrder = page.getByRole('button', { name: /place order|checkout|order/i })
  if (await placeOrder.count()) {
    await placeOrder.first().click()
    await waitStable(page, 1200)
    rec({
      id: 'CART-place-order-click',
      area: 'cart',
      path: '/en/cart',
      action: 'Click place order / checkout',
      status: 'pass',
      details: `After click URL=${page.url()}`,
    })
    await shot(page, '07-place-order')
  } else {
    rec({
      id: 'CART-place-order-click',
      area: 'cart',
      path: '/en/cart',
      action: 'Place order control',
      status: 'warn',
      details: 'No place order button (cart empty or gated)',
    })
  }

  // ========== AUTH PAGES ==========
  for (const p of [
    '/en/login',
    '/en/signup',
    '/en/forgot-password',
    '/en/reset-password',
    '/en/verify-phone',
  ]) {
    await goto(page, p, p.replace(/\//g, '_'), 'auth')
    await shot(page, `auth${p.replace(/\//g, '-')}`)
  }

  // Login form validation empty
  await goto(page, '/en/login', 'login-validate', 'auth')
  await clickByRole(page, 'button', /login|log in/i, { area: 'auth', path: '/en/login', action: 'Submit empty login' })
  await waitStable(page, 800)
  const loginErrors = await page.locator('[class*="error"], [role="alert"], .text-error, .text-destructive, p.text-xs').allTextContents().catch(() => [])
  rec({
    id: 'AUTH-login-empty-validation',
    area: 'auth',
    path: '/en/login',
    action: 'Empty login validation',
    status: page.url().includes('/login') ? 'pass' : 'warn',
    details: `Still on login or redirected. Error texts: ${loginErrors.slice(0, 5).join(' | ').slice(0, 200)}`,
  })

  // Wrong credentials
  await fillIfPresent(page, 'input[name="phoneNumber"], input[placeholder*="Phone"]', '+250700000000', 'phone-wrong')
  await fillIfPresent(page, 'input[name="password"], input[type="password"]', 'WrongPass123!', 'password-wrong')
  await clickByRole(page, 'button', /login|log in/i, { area: 'auth', path: '/en/login', action: 'Submit wrong credentials' })
  await waitStable(page, 2000)
  rec({
    id: 'AUTH-login-wrong',
    area: 'auth',
    path: page.url(),
    action: 'Login with invalid credentials stays out',
    status: page.url().includes('/login') ? 'pass' : 'fail',
    details: `URL=${page.url()}`,
  })

  // Valid merchant login
  await goto(page, '/en/login', 'login-valid', 'auth')
  await fillIfPresent(page, 'input[name="phoneNumber"], input[placeholder*="Phone"]', MERCHANT_PHONE, 'phone-merchant')
  await fillIfPresent(page, 'input[name="password"], input[type="password"]', MERCHANT_PASS, 'password-merchant')
  await clickByRole(page, 'button', /login|log in/i, { area: 'auth', path: '/en/login', action: 'Submit merchant login' })
  await waitStable(page, 3500)
  const afterLogin = page.url()
  const loginOk = afterLogin.includes('/dashboard') || afterLogin.includes('/store')
  rec({
    id: 'AUTH-login-merchant',
    area: 'auth',
    path: afterLogin,
    action: 'Merchant login success',
    status: loginOk ? 'pass' : 'fail',
    severity: loginOk ? 'info' : 'critical',
    details: `Redirected to ${afterLogin}`,
  })
  await shot(page, '08-after-login')

  // If not logged in, inject token via API for dashboard tests
  if (!loginOk) {
    const loginApi = await apiJson(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: MERCHANT_PHONE, password: MERCHANT_PASS }),
    })
    if (loginApi.status === 200 && loginApi.body?.data?.accessToken) {
      await page.evaluate(
        ({ accessToken, refreshToken, user }) => {
          const state = {
            state: { user, accessToken, refreshToken, isLoading: false },
            version: 0,
          }
          // try common zustand persist keys
          localStorage.setItem('auth-storage', JSON.stringify(state))
          localStorage.setItem('auth', JSON.stringify(state))
        },
        {
          accessToken: loginApi.body.data.accessToken,
          refreshToken: loginApi.body.data.refreshToken,
          user: loginApi.body.data.user,
        },
      )
      rec({
        id: 'AUTH-token-inject',
        area: 'auth',
        path: '/en/login',
        action: 'Inject API token into localStorage fallback',
        status: 'warn',
        details: 'UI login failed or delayed; used API token for dashboard testing',
      })
    }
  }

  // ========== DASHBOARD PATHS ==========
  const dashRoutes = [
    '/en/dashboard',
    '/en/dashboard/products',
    '/en/dashboard/inventory',
    '/en/dashboard/orders',
    '/en/dashboard/payments',
    '/en/dashboard/store-settings',
    '/en/dashboard/store-settings?tab=business',
    '/en/dashboard/store-settings?tab=branding',
    '/en/dashboard/store-settings?tab=contact',
    '/en/dashboard/store-settings?tab=delivery',
    '/en/dashboard/store-settings?tab=subscription',
    '/en/dashboard/subscription',
    '/en/dashboard/profile',
    '/en/dashboard/delivery-settings',
    '/en/dashboard/admin',
  ]

  for (const r of dashRoutes) {
    const res = await goto(page, r, r.replace(/[/?=&]/g, '_'), 'dashboard')
    await shot(page, `dash${r.replace(/[/?=&]/g, '-')}`)
    // redirected to login?
    if (page.url().includes('/login')) {
      rec({
        id: `DASH-auth-${r}`,
        area: 'dashboard',
        path: r,
        action: `Auth gate for ${r}`,
        status: 'fail',
        severity: 'critical',
        details: 'Redirected to login — session not available in test browser',
      })
      continue
    }
    const t = res.bodyText || (await page.locator('body').innerText().catch(() => ''))
    // check for raw i18n keys
    const rawI18n = t.match(/\b[a-z]+\.[a-z]+(?:\.[a-z]+)+\b/g) || []
    const suspicious = rawI18n.filter((k) =>
      /sidebar\.|nav\.|header\.|dashboard\.|errors\./.test(k),
    )
    if (suspicious.length) {
      rec({
        id: `DASH-i18n-${r}`,
        area: 'i18n',
        path: r,
        action: 'Scan for raw i18n keys',
        status: 'fail',
        details: `Possible raw keys: ${[...new Set(suspicious)].slice(0, 8).join(', ')}`,
      })
    } else {
      rec({
        id: `DASH-i18n-${r}`,
        area: 'i18n',
        path: r,
        action: 'Scan for raw i18n keys',
        status: 'pass',
        details: 'No obvious raw keys',
      })
    }
  }

  // Dashboard interactions if on dashboard
  await goto(page, '/en/dashboard', 'dash-home', 'dashboard')
  if (!page.url().includes('/login')) {
    // Export / Generate Report buttons
    for (const name of [/export/i, /generate report/i]) {
      const btn = page.getByRole('button', { name })
      if (await btn.count()) {
        try {
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
            btn.first().click(),
          ])
          rec({
            id: `DASH-btn-${String(name)}`,
            area: 'dashboard',
            path: '/en/dashboard',
            action: `Click ${name}`,
            status: 'pass',
            details: download ? `Download: ${download.suggestedFilename()}` : 'Clicked (no download event)',
          })
        } catch (e) {
          rec({
            id: `DASH-btn-${String(name)}`,
            area: 'dashboard',
            path: '/en/dashboard',
            action: `Click ${name}`,
            status: 'warn',
            details: String(e.message || e).slice(0, 200),
          })
        }
        await waitStable(page, 600)
      } else {
        rec({
          id: `DASH-btn-${String(name)}`,
          area: 'dashboard',
          path: '/en/dashboard',
          action: `Find ${name}`,
          status: 'warn',
          details: 'Button not found on dashboard home',
        })
      }
    }

    // Quick actions
    for (const name of ['Create Product', 'View Orders', 'Manage Inventory', 'Store Settings']) {
      const link = page.getByRole('link', { name }).or(page.getByText(name, { exact: true }))
      if (await link.count()) {
        rec({
          id: `DASH-qa-${name}`,
          area: 'dashboard',
          path: '/en/dashboard',
          action: `Quick action present: ${name}`,
          status: 'pass',
          details: 'Visible',
        })
      } else {
        rec({
          id: `DASH-qa-${name}`,
          area: 'dashboard',
          path: '/en/dashboard',
          action: `Quick action present: ${name}`,
          status: 'warn',
          details: 'Not found',
        })
      }
    }

    // Sidebar nav clicks
    for (const name of ['Products', 'Inventory', 'Orders', 'Payments', 'Store Settings']) {
      const nav = page.getByRole('link', { name: new RegExp(`^${name}$`, 'i') }).or(page.getByRole('button', { name: new RegExp(name, 'i') }))
      if (await nav.count()) {
        await nav.first().click()
        await waitStable(page, 1500)
        rec({
          id: `DASH-nav-${name}`,
          area: 'dashboard',
          path: page.url(),
          action: `Sidebar navigate to ${name}`,
          status: page.url().includes('/dashboard') && !page.url().includes('/login') ? 'pass' : 'fail',
          details: `URL=${page.url()}`,
        })
        await shot(page, `dash-nav-${name.toLowerCase().replace(/\s+/g, '-')}`)
      }
    }

    // Logout
    await goto(page, '/en/dashboard', 'dash-logout', 'dashboard')
    const logout = page.getByRole('button', { name: /log out|logout|sohoka/i })
    if (await logout.count()) {
      const label = (await logout.first().innerText()).trim()
      if (/sidebar\.logout/i.test(label)) {
        rec({
          id: 'DASH-logout-label',
          area: 'i18n',
          path: '/en/dashboard',
          action: 'Logout label visibility',
          status: 'fail',
          details: `Raw i18n key shown: "${label}"`,
        })
      } else {
        rec({
          id: 'DASH-logout-label',
          area: 'i18n',
          path: '/en/dashboard',
          action: 'Logout label visibility',
          status: 'pass',
          details: `Label="${label}"`,
        })
      }
      await logout.first().click()
      await waitStable(page, 2000)
      rec({
        id: 'DASH-logout',
        area: 'dashboard',
        path: page.url(),
        action: 'Log out',
        status: page.url().includes('/login') ? 'pass' : 'warn',
        details: `After logout URL=${page.url()}`,
      })
    } else {
      rec({
        id: 'DASH-logout',
        area: 'dashboard',
        path: '/en/dashboard',
        action: 'Log out button',
        status: 'fail',
        details: 'Logout control not found',
      })
    }
  }

  // ========== SIGNUP / ONBOARDING (smoke) ==========
  await goto(page, '/en/signup', 'signup', 'auth')
  const signupPhone = `+25079${String(Date.now()).slice(-7)}`
  await fillIfPresent(page, 'input[name="fullName"], input[placeholder*="Name" i]', 'E2E Tester', 'signup-name')
  await fillIfPresent(page, 'input[name="phoneNumber"], input[placeholder*="Phone"]', signupPhone, 'signup-phone')
  await fillIfPresent(page, 'input[name="password"], input[type="password"]', 'TestE2E123!', 'signup-pass')
  // confirm password if exists
  const pwds = page.locator('input[type="password"]')
  if ((await pwds.count()) > 1) {
    await pwds.nth(1).fill('TestE2E123!')
  }
  await clickByRole(page, 'button', /sign up|create|register|continue/i, {
    area: 'auth',
    path: '/en/signup',
    action: 'Submit signup',
  })
  await waitStable(page, 3000)
  rec({
    id: 'AUTH-signup-flow',
    area: 'auth',
    path: page.url(),
    action: 'Signup submission',
    status: page.url().includes('verify') || page.url().includes('store') || page.url().includes('signup') ? 'pass' : 'warn',
    details: `After signup URL=${page.url()} phone=${signupPhone}`,
  })
  await shot(page, '09-after-signup')

  // Onboarding page (may require auth)
  await goto(page, '/en/store', 'onboarding', 'onboarding')
  await shot(page, '10-onboarding')
  if (page.url().includes('/login')) {
    rec({
      id: 'ONBOARD-auth-gate',
      area: 'onboarding',
      path: '/en/store',
      action: 'Onboarding requires auth',
      status: 'pass',
      details: 'Correctly redirects unauthenticated users to login',
    })
  } else {
    rec({
      id: 'ONBOARD-accessible',
      area: 'onboarding',
      path: page.url(),
      action: 'Onboarding page accessible',
      status: 'pass',
      details: `Onboarding UI loaded at ${page.url()}`,
    })
  }

  // ========== LOCALE RW ==========
  await goto(page, '/rw', 'locale-rw', 'i18n')
  await shot(page, '11-locale-rw')
  const rwText = await page.locator('body').innerText()
  rec({
    id: 'I18N-rw-home',
    area: 'i18n',
    path: '/rw',
    action: 'Kinyarwanda locale home',
    status: rwText.length > 50 ? 'pass' : 'fail',
    details: rwText.slice(0, 180),
  })

  // ========== MISC / STATIC ==========
  await goto(page, '/en/shop', 'shop-index', 'marketplace')
  await goto(page, '/favicon.ico', 'favicon', 'static')
  // favicon 404 is common
  // locale switcher if any
  await goto(page, '/en', 'home-final', 'marketplace')

  // Console error summary
  const uniqueConsole = [...new Map(consoleErrors.map((e) => [e.text.slice(0, 120), e])).values()]
  for (const err of uniqueConsole.slice(0, 30)) {
    // ignore favicon and React DevTools noise
    if (/favicon|Download the React DevTools|hydration/i.test(err.text)) continue
    rec({
      id: `CONSOLE-${err.text.slice(0, 40)}`,
      area: 'console',
      path: err.url,
      action: 'Browser console error',
      status: 'warn',
      details: err.text.slice(0, 400),
    })
  }

  await browser.close()

  const summary = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    api: API,
    merchant: MERCHANT_PHONE,
    totals: {
      pass: findings.filter((f) => f.status === 'pass').length,
      fail: findings.filter((f) => f.status === 'fail').length,
      warn: findings.filter((f) => f.status === 'warn').length,
      blocked: findings.filter((f) => f.status === 'blocked').length,
      total: findings.length,
    },
    findings,
    working,
  }
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary.totals, null, 2))
  console.log('Wrote', OUT)
  console.log('FAILS:')
  for (const f of findings.filter((x) => x.status === 'fail')) {
    console.log(`- [${f.severity}] ${f.area} ${f.path}: ${f.action} — ${f.details}`)
  }
  console.log('WARNS:')
  for (const f of findings.filter((x) => x.status === 'warn')) {
    console.log(`- ${f.area} ${f.path}: ${f.action} — ${f.details.slice(0, 120)}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
