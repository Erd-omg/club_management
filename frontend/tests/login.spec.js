const { test, expect } = require('@playwright/test');

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('正常登录流程', async ({ page }) => {
    // 检查登录页面元素
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();

    // 填写登录信息
    await page.fill('input[autocomplete="username"]', 'admin');
    await page.fill('input[autocomplete="current-password"]', 'password');

    // 点击登录按钮
    await page.click('button:has-text("登录")');

    // 等待跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    
    // 验证跳转成功
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('空用户名登录', async ({ page }) => {
    // 只填写密码
    await page.fill('input[autocomplete="current-password"]', 'password');
    await page.click('button:has-text("登录")');

    // 检查错误提示
    await expect(page.locator('.el-message--error')).toBeVisible();
  });

  test('空密码登录', async ({ page }) => {
    // 只填写用户名
    await page.fill('input[autocomplete="username"]', 'admin');
    await page.click('button:has-text("登录")');

    // 检查错误提示
    await expect(page.locator('.el-message--error')).toBeVisible();
  });

  test('错误密码登录', async ({ page }) => {
    // 填写错误的密码
    await page.fill('input[autocomplete="username"]', 'admin');
    await page.fill('input[autocomplete="current-password"]', 'wrongpassword');
    await page.click('button:has-text("登录")');

    // 检查错误提示
    await expect(page.locator('.el-message--error')).toBeVisible();
  });

  test('不存在的用户登录', async ({ page }) => {
    // 填写不存在的用户
    await page.fill('input[autocomplete="username"]', 'nonexistent');
    await page.fill('input[autocomplete="current-password"]', 'password');
    await page.click('button:has-text("登录")');

    // 检查错误提示
    await expect(page.locator('.el-message--error')).toBeVisible();
  });

  test('登录页面响应式设计', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.login-page')).toBeVisible();

    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.login-page')).toBeVisible();

    // 测试手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.login-page')).toBeVisible();
  });
});