import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3232'
const ADMIN_EMAIL = 'admin@soundstash.local'
const ADMIN_PASSWORD = 'AdminPass123!'
const MUSIC_DIR = '/home/cdeschenes/Projects/SoundStash/ideas/music'

test.describe('SoundStash Upload Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ])
  })

  test('1. Upload "Adventure" track (first upload)', async ({ page }) => {
    // Navigate to upload page
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'load' })
    expect(page.url()).toContain('/upload')

    // Set file input with audio file (hidden input in UploadDropzone)
    const audioFileInput = page.locator('input[type="file"]:not([id="artwork"])')
    await page.waitForTimeout(500) // Give JS time to mount

    const adventureFile = `${MUSIC_DIR}/01 Adventure.mp3`
    await audioFileInput.setInputFiles(adventureFile)

    // Wait for file to be selected and dropzone to update
    await page.waitForTimeout(500)

    // Fill title via id="title"
    const titleInput = page.locator('#title')
    await titleInput.fill('Adventure')

    // Fill description via id="description"
    const descInput = page.locator('#description')
    await descInput.fill('Test upload 1')

    // Fill genre via id="genre"
    const genreInput = page.locator('#genre')
    await genreInput.fill('Electronic')

    // Click upload button
    const uploadButton = page.getByRole('button', { name: /upload track/i })
    await expect(uploadButton).toBeEnabled({ timeout: 5000 })
    await uploadButton.click()

    // Wait for processing — poll status for up to 30 seconds
    let uploadSuccess = false
    let statusMessage = ''

    // Check URL for track ID or watch for success message
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000)

      // Check if we're redirected to a track detail page
      const currentUrl = page.url()
      if (currentUrl.includes('/track/')) {
        uploadSuccess = true
        statusMessage = `Redirected to track page: ${currentUrl}`
        break
      }

      // Check for success toast message
      const successMessage = page.locator('text=/ready|success/i')
      if (await successMessage.isVisible({ timeout: 100 }).catch(() => false)) {
        uploadSuccess = true
        statusMessage = await successMessage.textContent() || 'Success'
        break
      }

      // Check for error message
      const errorMessage = page.locator('text=/failed|error/i')
      if (await errorMessage.isVisible({ timeout: 100 }).catch(() => false)) {
        statusMessage = await errorMessage.textContent() || 'Error'
        break
      }
    }

    console.log(`✓ Adventure upload completed. Success: ${uploadSuccess}, Message: ${statusMessage}`)
    expect(uploadSuccess).toBe(true)
  })

  test('2. Upload "Running Free" track (second upload)', async ({ page }) => {
    // Navigate to upload page
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'load' })
    expect(page.url()).toContain('/upload')

    // Set file input with audio file
    const audioFileInput = page.locator('input[type="file"]:not([id="artwork"])')
    await page.waitForTimeout(500)

    const runningFreeFile = `${MUSIC_DIR}/Cody - Running Free.mp3`
    await audioFileInput.setInputFiles(runningFreeFile)

    // Wait for file to be selected and dropzone to update
    await page.waitForTimeout(500)

    // Fill title via id="title"
    const titleInput = page.locator('#title')
    await titleInput.fill('Running Free')

    // Fill genre via id="genre"
    const genreInput = page.locator('#genre')
    await genreInput.fill('Rock')

    // Click upload button
    const uploadButton = page.getByRole('button', { name: /upload track/i })
    await expect(uploadButton).toBeEnabled({ timeout: 5000 })
    await uploadButton.click()

    // Wait for processing — poll status for up to 30 seconds
    let uploadSuccess = false
    let statusMessage = ''

    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000)

      const currentUrl = page.url()
      if (currentUrl.includes('/track/')) {
        uploadSuccess = true
        statusMessage = `Redirected to track page: ${currentUrl}`
        break
      }

      const successMessage = page.locator('text=/ready|success/i')
      if (await successMessage.isVisible({ timeout: 100 }).catch(() => false)) {
        uploadSuccess = true
        statusMessage = await successMessage.textContent() || 'Success'
        break
      }

      const errorMessage = page.locator('text=/failed|error/i')
      if (await errorMessage.isVisible({ timeout: 100 }).catch(() => false)) {
        statusMessage = await errorMessage.textContent() || 'Error'
        break
      }
    }

    console.log(`✓ Running Free upload completed. Success: ${uploadSuccess}, Message: ${statusMessage}`)
    expect(uploadSuccess).toBe(true)
  })

  test('3. Verify uploaded tracks appear in /feed', async ({ page }) => {
    // Navigate to feed page
    await page.goto(`${BASE_URL}/feed`, { waitUntil: 'load' })
    expect(page.url()).toContain('/feed')

    // Wait for feed to load
    await page.waitForLoadState('networkidle')

    // Look for uploaded tracks in the feed
    const adventureTrack = page.locator('text=/Adventure/i').first()
    const runningFreeTrack = page.locator('text=/Running Free/i').first()

    const adventureVisible = await adventureTrack.isVisible({ timeout: 5000 }).catch(() => false)
    const runningFreeVisible = await runningFreeTrack.isVisible({ timeout: 5000 }).catch(() => false)

    console.log(`✓ Feed page loaded`)
    console.log(`  - Adventure track visible: ${adventureVisible}`)
    console.log(`  - Running Free track visible: ${runningFreeVisible}`)

    // At least one should be visible
    expect(adventureVisible || runningFreeVisible).toBe(true)
  })

  test('4. Open track detail page and verify waveform player renders', async ({ page }) => {
    // Navigate to feed page
    await page.goto(`${BASE_URL}/feed`, { waitUntil: 'load' })
    expect(page.url()).toContain('/feed')

    await page.waitForLoadState('networkidle')

    // Try to find and click on a track
    const adventureTrack = page.locator('text=/Adventure/i').first()
    const trackLink = adventureTrack.locator('..').getByRole('link')

    let trackFound = false
    let detailPageUrl = ''

    // Try clicking track or container
    if (await trackLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await Promise.all([
        page.waitForNavigation({ timeout: 10000 }),
        trackLink.click(),
      ])
      trackFound = true
      detailPageUrl = page.url()
    } else {
      // Try clicking the track text itself
      if (await adventureTrack.isVisible({ timeout: 2000 }).catch(() => false)) {
        await adventureTrack.click()
        await page.waitForLoadState('networkidle')
        trackFound = true
        detailPageUrl = page.url()
      }
    }

    if (trackFound) {
      console.log(`✓ Navigated to track detail page: ${detailPageUrl}`)
      expect(detailPageUrl).toContain('/track/')

      // Look for waveform player
      const waveformCanvas = page.locator('canvas').first()
      const waveformContainer = page.locator('[class*="waveform"], [data-testid*="waveform"]').first()
      const audioElement = page.locator('audio').first()
      const playerControls = page.getByRole('button', { name: /play|pause/i }).first()

      const waveformVisible = await waveformCanvas.isVisible({ timeout: 3000 }).catch(() => false) ||
                             await waveformContainer.isVisible({ timeout: 3000 }).catch(() => false)
      const playerVisible = await playerControls.isVisible({ timeout: 3000 }).catch(() => false) ||
                           await audioElement.isVisible({ timeout: 3000 }).catch(() => false)

      console.log(`  - Waveform/canvas visible: ${waveformVisible}`)
      console.log(`  - Player controls visible: ${playerVisible}`)

      expect(waveformVisible || playerVisible).toBe(true)
    } else {
      console.log('✗ Could not find track link to navigate to detail page')
      expect(trackFound).toBe(true)
    }
  })
})
