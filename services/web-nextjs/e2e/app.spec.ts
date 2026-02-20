import { test, expect } from '@playwright/test';

test.describe('VanguardHealth E2E Tests', () => {

    test('Dashboard loads and shows stats', async ({ page }) => {
        await page.goto('/');

        // Wait for dashboard to load
        await expect(page.locator('h2')).toContainText(/แดชบอร์ด|Dashboard/);

        // Check stats cards are visible
        await expect(page.locator('.border-l-4.border-sky-500')).toBeVisible();

        // Refresh button works
        await page.click('button:has-text("🔄")');
        await page.waitForTimeout(500);
    });

    test('Language toggle switches between TH and EN', async ({ page }) => {
        await page.goto('/');

        // Default is Thai
        await expect(page.locator('button:has-text("🇹🇭 TH")')).toBeVisible();

        // Click to switch to English
        await page.click('button:has-text("🇹🇭 TH")');
        await expect(page.locator('button:has-text("🇺🇸 EN")')).toBeVisible();

        // Verify English text appears
        await expect(page.locator('text=System Online')).toBeVisible();

        // Switch back to Thai
        await page.click('button:has-text("🇺🇸 EN")');
        await expect(page.locator('text=ระบบออนไลน์')).toBeVisible();
    });

    test('Tab navigation works', async ({ page }) => {
        await page.goto('/');

        // Click on Chat tab
        await page.click('button:has-text("AI Chat")');
        await expect(page.locator('input[placeholder*="AI"]')).toBeVisible();

        // Click on Search tab
        await page.click('button:has-text(/ค้นหา|Search/)');
        await expect(page.locator('h2')).toContainText(/ค้นหา|Search/);

        // Click on Ingest tab
        await page.click('button:has-text(/เพิ่มข้อมูล|Input Data/)');
        await expect(page.locator('h2')).toContainText(/เพิ่มข้อมูล|Input/);

        // Click on Timeline tab
        await page.click('button:has-text(/ไทม์ไลน์|Timeline/)');
        await expect(page.locator('h2')).toContainText(/ไทม์ไลน์|Timeline/);
    });

    test('All Patients mode toggle', async ({ page }) => {
        await page.goto('/');

        // Toggle to All Patients mode
        await page.click('button:has-text(/รายบุคคล|Single/)');
        await expect(page.locator('button:has-text(/ผู้ป่วยทั้งหมด|All Patients/)')).toBeVisible();

        // Patient ID input should be hidden
        await expect(page.locator('input[value="P001"]')).not.toBeVisible();

        // Toggle back
        await page.click('button:has-text(/ผู้ป่วยทั้งหมด|All Patients/)');
        await expect(page.locator('input[value="P001"]')).toBeVisible();
    });

    test('Search functionality', async ({ page }) => {
        await page.goto('/');

        // Navigate to Search tab
        await page.click('button:has-text(/ค้นหา|Search/)');

        // Type search query
        await page.fill('input[type="text"]', 'diabetes');

        // Click search button
        await page.click('button:has-text(/ค้นหา|Search/):not([disabled])');

        // Wait for results (or empty state)
        await page.waitForTimeout(2000);
    });

    test('Chat sends message', async ({ page }) => {
        await page.goto('/');

        // Navigate to Chat tab
        await page.click('button:has-text("AI Chat")');

        // Type message
        await page.fill('input[placeholder*="AI"]', 'สวัสดี');

        // Send message
        await page.click('button:has-text(/ส่ง|Send/)');

        // Wait for response
        await page.waitForTimeout(3000);
    });
});
