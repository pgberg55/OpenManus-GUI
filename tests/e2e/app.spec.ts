import { test, expect } from '@playwright/test';

test('app loads and shows dashboard', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:1420/');
  
  // Check that the dashboard title is visible
  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  
  // Check that the sidebar contains all navigation items
  await expect(page.locator('nav')).toContainText('Dashboard');
  await expect(page.locator('nav')).toContainText('Run Task');
  await expect(page.locator('nav')).toContainText('History');
  await expect(page.locator('nav')).toContainText('Settings');
});

test('can navigate to run task page', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:1420/');
  
  // Click on the Run Task link in the sidebar
  await page.click('nav >> text=Run Task');
  
  // Check that we're on the Run Task page
  await expect(page.locator('h1:has-text("Run Task")')).toBeVisible();
  
  // Check that the prompt textarea is visible
  await expect(page.locator('textarea#prompt')).toBeVisible();
  
  // Check that the Run Task button is visible but disabled (since no prompt is entered)
  const runButton = page.locator('button:has-text("Run Task")');
  await expect(runButton).toBeVisible();
  await expect(runButton).toBeDisabled();
});

test('can run a simple task', async ({ page }) => {
  // Navigate to the Run Task page
  await page.goto('http://localhost:1420/run');
  
  // Enter a prompt
  await page.fill('textarea#prompt', 'Hello, OpenManus!');
  
  // Check that the Run Task button is now enabled
  const runButton = page.locator('button:has-text("Run Task")');
  await expect(runButton).toBeEnabled();
  
  // Click the Run Task button
  await runButton.click();
  
  // Wait for some output to appear (this assumes the API is running and responding)
  await expect(page.locator('div.bg-card')).not.toContainText('Task output will appear here...');
  
  // Wait for the task to complete (button text changes back from "Running..." to "Run Task")
  await expect(runButton).toHaveText('Run Task', { timeout: 10000 });
});

test('can view task history', async ({ page }) => {
  // Navigate to the History page
  await page.goto('http://localhost:1420/history');
  
  // Check that the history title is visible
  await expect(page.locator('h1:has-text("Task History")')).toBeVisible();
  
  // Check that the refresh button is visible
  await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
});

test('can view and interact with settings', async ({ page }) => {
  // Navigate to the Settings page
  await page.goto('http://localhost:1420/settings');
  
  // Check that the settings title is visible
  await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  
  // Check that the Save Changes button is visible
  await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
});