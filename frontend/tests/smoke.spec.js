import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173'; // Vite default

test.describe('Frontend Smoke Test', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${BASE_URL}/`);
    });

    test('Dashboard renders correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);
        await expect(page.locator('h2')).toContainText('ড্যাশবোর্ড');
        await expect(page.locator('.grid')).toBeVisible();
    });

    test('Member List renders correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/members`);
        await expect(page.locator('h2')).toContainText('সদস্য তালিকা');
    });

    test('Member Admission renders correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/admission`);
        await expect(page.locator('h2')).toContainText('নতুন সদস্য ভর্তি ফর্ম');
    });

    test('Daily Collection renders correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/collection`);
        await expect(page.locator('h2')).toContainText('দৈনিক কালেকশন');
    });

    test('Share Page renders correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/shares`);
        await expect(page.locator('h2')).toContainText('শেয়ার মূলধন');
    });
});
