const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');

test.describe('成员管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member');
  });

  test('成员列表显示', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 检查页面容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查搜索框
    await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible();
    
    // 检查添加按钮
    await expect(page.locator('button:has-text("添加社员")')).toBeVisible();
    
    // 检查表格
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('添加成员功能', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 点击添加按钮
    await page.click('button:has-text("添加社员")');
    
    // 检查对话框（使用更具体的选择器）
    await expect(page.locator('.el-dialog:has-text("新增社员")')).toBeVisible();
    
    // 填写表单
    await page.fill('input[placeholder*="学号"]', 'test001');
    await page.fill('input[placeholder*="姓名"]', '测试用户');
    await page.fill('input[placeholder*="手机"]', '13800138000');
    await page.fill('input[placeholder*="邮箱"]', 'test@example.com');
    
    // 选择部门
    await page.click('.el-select').first();
    await page.click('.el-option:first-child');
    
    // 选择角色
    await page.click('.el-select').nth(1);
    await page.click('.el-option:first-child');
    
    // 点击保存
    await page.click('button:has-text("保存")');
    
    // 检查成功消息
    await expect(page.locator('.el-message--success')).toBeVisible();
  });

  test('成员详情功能', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 点击第一个成员的详情按钮
    await page.locator('.el-button:has-text("详情")').first().click();
    
    // 检查详情页面
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('批量导入功能', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 点击批量导入按钮
    await page.click('button:has-text("批量导入")');
    
    // 检查导入对话框（使用更具体的选择器）
    await expect(page.locator('.el-dialog:has-text("批量导入社员")')).toBeVisible();
    
    // 检查下载模板按钮
    await expect(page.locator('button:has-text("下载模板")')).toBeVisible();
  });
});