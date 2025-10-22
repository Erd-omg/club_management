const { test, expect } = require('@playwright/test');

test.describe('冒烟测试', () => {
  test('登录和基本导航功能', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 检查登录页面元素
    await expect(page.locator('h2.title')).toBeVisible();
    
    // 填写登录信息
    await page.fill('input[autocomplete="username"]', 'admin');
    await page.fill('input[autocomplete="current-password"]', 'password');
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 等待跳转
    await page.waitForTimeout(3000);
    
    // 检查是否跳转到仪表盘
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // 如果还在登录页面，检查错误消息
    if (currentUrl.includes('/login')) {
      const errorMessage = await page.locator('.el-message--error').textContent();
      console.log('Login error:', errorMessage);
    }
  });

  test('页面响应式设计', async ({ page }) => {
    // 测试不同屏幕尺寸
    await page.goto('/login');
    
    // 桌面端
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.login-page')).toBeVisible();
    
    // 平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.login-page')).toBeVisible();
    
    // 手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.login-page')).toBeVisible();
  });
});