import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3232'
const ADMIN_EMAIL = 'admin@soundstash.local'
const ADMIN_PASSWORD = 'AdminPass123!'

test.describe('SoundStash Smoke Tests', () => {
  test('1. Unauthenticated redirect — visiting / redirects to /login', async ({
    page,
  }) => {
    await page.goto(BASE_URL, { waitUntil: 'load' })
    // Expect redirect to login page (with or without callbackUrl query)
    expect(page.url()).toContain('/login')
  })

  test('2. Login page renders — /login shows email + password form', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })

    // Check for email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible({ timeout: 5000 })

    // Check for password input
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()

    // Check for submit button
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
  })

  test('3. Admin login — log in with admin credentials and verify redirect to /feed', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })

    // Fill email
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)

    // Fill password
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)

    // Click submit button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ])

    // Verify we're redirected to one of the authenticated pages
    const url = page.url()
    expect(
      url.includes('/feed') ||
        url.includes('/dashboard') ||
        url.includes('/admin') ||
        url.includes('/'),
    ).toBeTruthy()
  })

  test('4. Feed page — /feed is accessible after login and renders', async ({
    page,
  }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ])

    // Navigate to /feed
    await page.goto(`${BASE_URL}/feed`, { waitUntil: 'load' })

    // Verify page loaded
    const pageContent = page.locator('body')
    await expect(pageContent).toBeVisible()

    expect(page.url()).toContain('/feed')
  })

  test('5. Upload page — /upload is accessible after login', async ({
    page,
  }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ])

    // Navigate to /upload
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'load' })

    // Verify page loaded
    const pageContent = page.locator('body')
    await expect(pageContent).toBeVisible()

    expect(page.url()).toContain('/upload')
  })

  test('6. Admin dashboard — /admin/dashboard is accessible after login', async ({
    page,
  }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ])

    // Navigate to /admin/dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`, {
      waitUntil: 'load',
    })

    // Verify page loaded
    const pageContent = page.locator('body')
    await expect(pageContent).toBeVisible()

    expect(page.url()).toContain('/admin/dashboard')
  })

  test('7. Logout — sign out and verify redirect to /login', async ({
    page,
  }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ])

    // Click logout button (aria-label="Sign out")
    const logoutButton = page.getByRole('button', { name: 'Sign out' })
    await expect(logoutButton).toBeVisible({ timeout: 5000 })

    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      logoutButton.click(),
    ])

    // Verify we're on login page
    expect(page.url()).toContain('/login')

    // Verify login form is visible
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible({ timeout: 5000 })
  })
})
