const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');

test.describe('活动管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity');
  });

  test('活动列表显示', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h2.page-title')).toBeVisible();
    
    // 检查搜索框
    await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible();
    
    // 检查添加按钮
    await expect(page.locator('button:has-text("添加活动")')).toBeVisible();
    
    // 检查表格
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('添加活动功能', async ({ page }) => {
    // 点击添加按钮
    await page.click('button:has-text("添加活动")');
    
    // 检查对话框
    await expect(page.locator('.el-dialog')).toBeVisible();
    
    // 填写表单
    await page.fill('input[placeholder*="活动名称"]', '测试活动');
    await page.fill('textarea[placeholder*="活动简介"]', '这是一个测试活动');
    
    // 选择活动类型
    await page.click('.el-select');
    await page.click('.el-option:first-child');
    
    // 选择开始时间
    await page.click('input[placeholder*="开始时间"]');
    await page.click('.el-date-picker__header button:has-text("今天")');
    
    // 选择结束时间
    await page.click('input[placeholder*="结束时间"]');
    await page.click('.el-date-picker__header button:has-text("今天")');
    
    // 点击保存
    await page.click('button:has-text("保存")');
    
    // 检查成功消息
    await expect(page.locator('.el-message--success')).toBeVisible();
  });

  test('活动详情功能', async ({ page }) => {
    // 点击第一个活动的详情按钮
    await page.click('.el-button:has-text("详情")').first();
    
    // 检查详情页面
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('活动编辑功能', async ({ page }) => {
    // 点击第一个活动的编辑按钮
    await page.click('.el-button:has-text("编辑")').first();
    
    // 检查编辑页面
    await expect(page.locator('.app-container')).toBeVisible();
  });
});