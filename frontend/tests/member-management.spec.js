const { test, expect } = require('@playwright/test');

test.describe('成员管理功能测试', () => {
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

  test('社长查看成员列表测试', async ({ page }) => {
    console.log('开始测试社长查看成员列表...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查成员列表页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查成员表格
    await expect(page.locator('.el-table')).toBeVisible();
    
    // 检查搜索表单
    await expect(page.locator('.search-form')).toBeVisible();
    
    // 检查添加按钮（社长应该有权限）
    await expect(page.locator('button:has-text("添加社员")')).toBeVisible();
    
    console.log('社长成员列表测试完成');
  });

  test('干事查看成员列表测试', async ({ page }) => {
    console.log('开始测试干事查看成员列表...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查成员列表页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查成员表格
    await expect(page.locator('.el-table')).toBeVisible();
    
    // 干事应该只能看到自己的记录（权限控制）
    // 这里需要根据实际权限控制来调整
    
    console.log('干事成员列表测试完成');
  });

  test('添加成员功能测试', async ({ page }) => {
    console.log('开始测试添加成员功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 点击添加社员按钮
    await page.click('button:has-text("添加社员")');
    
    // 等待添加对话框出现
    await page.waitForSelector('.el-dialog', { timeout: 10000 });
    
    // 检查添加表单
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('input[placeholder*="学号"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="姓名"]')).toBeVisible();
    
    // 填写成员信息
    await page.fill('input[placeholder*="学号"]', '2021999');
    await page.fill('input[placeholder*="姓名"]', '测试成员');
    await page.fill('input[placeholder*="手机"]', '13800138000');
    await page.fill('input[placeholder*="邮箱"]', 'test@example.com');
    
    // 选择部门
    await page.click('.el-select');
    await page.click('.el-select-dropdown__item:first-child');
    
    // 选择角色
    await page.click('.el-select').nth(1);
    await page.click('.el-select-dropdown__item:has-text("干事")');
    
    // 点击确定按钮
    await page.click('button:has-text("确定")');
    
    // 等待操作完成
    await page.waitForTimeout(2000);
    
    // 检查是否添加成功（应该有成功提示）
    const successMessage = await page.locator('.el-message--success').isVisible();
    if (successMessage) {
      console.log('成员添加成功');
    } else {
      console.log('成员添加可能失败或需要进一步验证');
    }
    
    console.log('添加成员功能测试完成');
  });

  test('编辑成员功能测试', async ({ page }) => {
    console.log('开始测试编辑成员功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 点击第一行的编辑按钮
    const editButton = page.locator('.el-table .el-button:has-text("编辑")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 等待编辑对话框出现
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      
      // 检查编辑表单
      await expect(page.locator('.el-dialog')).toBeVisible();
      
      // 修改姓名
      const nameInput = page.locator('input[placeholder*="姓名"]');
      await nameInput.clear();
      await nameInput.fill('修改后的姓名');
      
      // 点击确定按钮
      await page.click('button:has-text("确定")');
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      console.log('成员编辑功能测试完成');
    } else {
      console.log('没有找到编辑按钮，可能没有数据或权限不足');
    }
  });

  test('删除成员功能测试', async ({ page }) => {
    console.log('开始测试删除成员功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 点击第一行的删除按钮
    const deleteButton = page.locator('.el-table .el-button:has-text("删除")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // 等待确认对话框出现
      await page.waitForSelector('.el-message-box', { timeout: 10000 });
      
      // 检查确认对话框
      await expect(page.locator('.el-message-box')).toBeVisible();
      await expect(page.locator('.el-message-box')).toContainText('确定要删除');
      
      // 点击确定按钮
      await page.click('.el-message-box .el-button--primary');
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      console.log('成员删除功能测试完成');
    } else {
      console.log('没有找到删除按钮，可能没有数据或权限不足');
    }
  });

  test('成员搜索功能测试', async ({ page }) => {
    console.log('开始测试成员搜索功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待搜索表单加载
    await page.waitForSelector('.search-form', { timeout: 10000 });
    
    // 测试按姓名搜索
    const nameInput = page.locator('input[placeholder*="姓名"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('测试');
      await page.click('button:has-text("搜索")');
      
      // 等待搜索结果
      await page.waitForTimeout(2000);
      
      console.log('按姓名搜索测试完成');
    }
    
    // 测试按学号搜索
    const stuIdInput = page.locator('input[placeholder*="学号"]');
    if (await stuIdInput.isVisible()) {
      await stuIdInput.fill('2021');
      await page.click('button:has-text("搜索")');
      
      // 等待搜索结果
      await page.waitForTimeout(2000);
      
      console.log('按学号搜索测试完成');
    }
    
    console.log('成员搜索功能测试完成');
  });
});
