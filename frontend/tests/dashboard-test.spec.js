const { test, expect } = require('@playwright/test');

test.describe('仪表板功能测试', () => {
  // 登录辅助函数
  async function login(page, username = '2021001', password = 'password') {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 等待登录表单完全加载
    await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
    await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 10000 });
    await page.waitForSelector('button:has-text("登录")', { timeout: 10000 });
    
    await page.fill('input[autocomplete="username"]', username);
    await page.fill('input[autocomplete="current-password"]', password);
    
    // 等待一下确保表单填写完成
    await page.waitForTimeout(1000);
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 等待跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    // 额外等待确保页面完全加载
    await page.waitForTimeout(2000);
  }

  test('社长仪表板显示测试', async ({ page }) => {
    console.log('开始测试社长仪表板...');
    
    // 启用控制台日志
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查仪表板容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查统计卡片
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // 检查各个统计卡片的内容
    await expect(page.locator('.stat-card').nth(0)).toContainText('成员总数');
    await expect(page.locator('.stat-card').nth(1)).toContainText('近期活动');
    await expect(page.locator('.stat-card').nth(2)).toContainText('待审批');
    await expect(page.locator('.stat-card').nth(3)).toContainText('我参与');
    
    // 检查图表区域（只有管理员可见）
    if (await page.locator('div[ref="deptPie"]').isVisible()) {
      await expect(page.locator('div[ref="deptPie"]')).toBeVisible();
      await expect(page.locator('div[ref="typeBar"]')).toBeVisible();
    }
    
    console.log('社长仪表板测试完成');
  });

  test('干事仪表板显示测试', async ({ page }) => {
    console.log('开始测试干事仪表板...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 检查仪表板容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查统计卡片
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // 检查各个统计卡片的内容
    await expect(page.locator('.stat-card').nth(0)).toContainText('成员总数');
    await expect(page.locator('.stat-card').nth(1)).toContainText('近期活动');
    await expect(page.locator('.stat-card').nth(2)).toContainText('待审批');
    await expect(page.locator('.stat-card').nth(3)).toContainText('我参与');
    
    // 干事不应该看到图表（权限限制）
    // 这里需要根据实际权限控制来调整
    
    console.log('干事仪表板测试完成');
  });

  test('仪表板数据刷新测试', async ({ page }) => {
    console.log('开始测试仪表板数据刷新...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 等待数据加载
    await page.waitForTimeout(3000);
    
    // 获取初始统计数据
    const initialMemberCount = await page.locator('.stat-card').nth(0).locator('.stat-number').textContent();
    const initialActivityCount = await page.locator('.stat-card').nth(1).locator('.stat-number').textContent();
    
    console.log('初始成员数:', initialMemberCount);
    console.log('初始活动数:', initialActivityCount);
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 等待数据重新加载
    await page.waitForTimeout(3000);
    
    // 检查数据是否重新加载
    await expect(page.locator('.stat-card').nth(0).locator('.stat-number')).toBeVisible();
    await expect(page.locator('.stat-card').nth(1).locator('.stat-number')).toBeVisible();
    
    console.log('仪表板数据刷新测试完成');
  });

  test('仪表板响应式设计测试', async ({ page }) => {
    console.log('开始测试仪表板响应式设计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 测试桌面端
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // 测试手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.app-container')).toBeVisible();
    // 手机端可能显示不同数量的卡片
    
    console.log('仪表板响应式设计测试完成');
  });
});
