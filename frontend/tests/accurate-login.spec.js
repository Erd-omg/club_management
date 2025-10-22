const { test, expect } = require('@playwright/test');

test.describe('准确登录测试', () => {
  test('社长登录测试', async ({ page }) => {
    console.log('开始测试社长登录...');
    
    // 启用控制台日志
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // 访问登录页面
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 检查登录页面元素
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();
    
    console.log('登录页面元素检查通过');
    
    // 填写社长登录信息
    await page.fill('input[autocomplete="username"]', '2021001');
    await page.fill('input[autocomplete="current-password"]', 'password');
    
    console.log('登录信息填写完成');
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    console.log('点击登录按钮');
    
    // 等待跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    
    console.log('跳转到仪表盘成功');
    
    // 验证跳转成功
    await expect(page.locator('.app-container')).toBeVisible();
    
    console.log('社长登录测试完成');
  });

  test('错误密码登录测试', async ({ page }) => {
    console.log('开始测试错误密码登录...');
    
    // 访问登录页面
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 填写错误的密码
    await page.fill('input[autocomplete="username"]', '2021001');
    await page.fill('input[autocomplete="current-password"]', 'wrongpassword');
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 等待错误消息出现
    await page.waitForSelector('.el-message--error', { timeout: 10000 });
    
    // 验证错误提示
    await expect(page.locator('.el-message--error')).toBeVisible();
    
    console.log('错误密码登录测试完成');
  });
});
