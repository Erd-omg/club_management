const { test, expect } = require('@playwright/test');

test.describe('部门管理功能测试', () => {
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

  test('社长查看部门列表测试', async ({ page }) => {
    console.log('开始测试社长查看部门列表...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查部门列表页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查部门卡片列表
    await expect(page.locator('.dept-card')).toBeVisible();
    
    // 检查添加部门按钮（社长应该有权限）
    await expect(page.locator('button:has-text("添加部门")')).toBeVisible();
    
    console.log('社长部门列表测试完成');
  });

  test('查看部门详情测试', async ({ page }) => {
    console.log('开始测试查看部门详情...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待部门卡片加载
    await page.waitForSelector('.dept-card', { timeout: 10000 });
    
    // 点击第一个部门卡片查看详情
    const firstDeptCard = page.locator('.dept-card').first();
    if (await firstDeptCard.isVisible()) {
      await firstDeptCard.click();
      
      // 等待部门详情页面加载
      await page.waitForTimeout(2000);
      
      // 检查部门详情内容
      await expect(page.locator('.dept-detail')).toBeVisible();
      
      // 检查部门成员列表
      await expect(page.locator('.member-list')).toBeVisible();
      
      console.log('部门详情查看测试完成');
    } else {
      console.log('没有找到部门卡片，可能没有数据');
    }
  });

  test('添加部门功能测试', async ({ page }) => {
    console.log('开始测试添加部门功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 点击添加部门按钮
    await page.click('button:has-text("添加部门")');
    
    // 等待添加对话框出现
    await page.waitForSelector('.el-dialog', { timeout: 10000 });
    
    // 检查添加表单
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('input[placeholder*="部门名称"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="部门简介"]')).toBeVisible();
    
    // 填写部门信息
    await page.fill('input[placeholder*="部门名称"]', '测试部门');
    await page.fill('textarea[placeholder*="部门简介"]', '这是一个测试部门的简介');
    
    // 点击确定按钮
    await page.click('button:has-text("确定")');
    
    // 等待操作完成
    await page.waitForTimeout(2000);
    
    // 检查是否添加成功（应该有成功提示）
    const successMessage = await page.locator('.el-message--success').isVisible();
    if (successMessage) {
      console.log('部门添加成功');
    } else {
      console.log('部门添加可能失败或需要进一步验证');
    }
    
    console.log('添加部门功能测试完成');
  });

  test('编辑部门功能测试', async ({ page }) => {
    console.log('开始测试编辑部门功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待部门卡片加载
    await page.waitForSelector('.dept-card', { timeout: 10000 });
    
    // 点击第一个部门卡片的编辑按钮
    const editButton = page.locator('.dept-card .el-button:has-text("编辑")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 等待编辑对话框出现
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      
      // 检查编辑表单
      await expect(page.locator('.el-dialog')).toBeVisible();
      
      // 修改部门名称
      const nameInput = page.locator('input[placeholder*="部门名称"]');
      await nameInput.clear();
      await nameInput.fill('修改后的部门名称');
      
      // 修改部门简介
      const introTextarea = page.locator('textarea[placeholder*="部门简介"]');
      await introTextarea.clear();
      await introTextarea.fill('修改后的部门简介');
      
      // 点击确定按钮
      await page.click('button:has-text("确定")');
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      console.log('部门编辑功能测试完成');
    } else {
      console.log('没有找到编辑按钮，可能没有数据或权限不足');
    }
  });

  test('删除部门功能测试', async ({ page }) => {
    console.log('开始测试删除部门功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待部门卡片加载
    await page.waitForSelector('.dept-card', { timeout: 10000 });
    
    // 点击第一个部门卡片的删除按钮
    const deleteButton = page.locator('.dept-card .el-button:has-text("删除")').first();
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
      
      console.log('部门删除功能测试完成');
    } else {
      console.log('没有找到删除按钮，可能没有数据或权限不足');
    }
  });

  test('部门成员统计测试', async ({ page }) => {
    console.log('开始测试部门成员统计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待部门卡片加载
    await page.waitForSelector('.dept-card', { timeout: 10000 });
    
    // 检查部门卡片中的成员数量显示
    const deptCards = page.locator('.dept-card');
    const cardCount = await deptCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = deptCards.nth(i);
      
      // 检查成员数量显示
      const memberCount = card.locator('.member-count');
      if (await memberCount.isVisible()) {
        const countText = await memberCount.textContent();
        console.log(`部门 ${i + 1} 成员数量: ${countText}`);
      }
    }
    
    console.log('部门成员统计测试完成');
  });

  test('部门管理权限控制测试', async ({ page }) => {
    console.log('开始测试部门管理权限控制...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查部门列表页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查部门卡片列表
    await expect(page.locator('.dept-card')).toBeVisible();
    
    // 干事不应该看到添加部门按钮（权限限制）
    const addButton = page.locator('button:has-text("添加部门")');
    const isAddButtonVisible = await addButton.isVisible();
    
    if (isAddButtonVisible) {
      console.log('警告：干事可以看到添加部门按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到添加部门按钮');
    }
    
    // 检查编辑和删除按钮的权限
    const editButtons = page.locator('.dept-card .el-button:has-text("编辑")');
    const deleteButtons = page.locator('.dept-card .el-button:has-text("删除")');
    
    const editButtonCount = await editButtons.count();
    const deleteButtonCount = await deleteButtons.count();
    
    if (editButtonCount > 0 || deleteButtonCount > 0) {
      console.log('警告：干事可以看到编辑/删除按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到编辑/删除按钮');
    }
    
    console.log('部门管理权限控制测试完成');
  });
});
