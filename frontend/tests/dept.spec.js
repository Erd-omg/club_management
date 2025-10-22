// @ts-check
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');

test.describe('部门管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到部门管理
    await page.goto('/dept');
    await page.waitForLoadState('networkidle');
  });

  test('部门列表页面基本显示', async ({ page }) => {
    // 检查页面容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查操作按钮
    await expect(page.locator('button:has-text("新增"), button:has-text("添加")')).toBeVisible();
    
    // 检查部门卡片或表格
    await expect(page.locator('.dept-card, .el-card, .el-table')).toBeVisible();
  });

  test('部门列表数据加载', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 检查部门卡片或表格是否有数据
    const deptCards = page.locator('.dept-card, .el-card');
    const tableRows = page.locator('.el-table__row, tbody tr');
    
    if (await deptCards.count() > 0) {
      await expect(deptCards.first()).toBeVisible();
      
      // 检查部门名称
      await expect(deptCards.first().locator('.dept-name, .card-title')).toBeVisible();
      
      // 检查成员数量
      const memberCount = deptCards.first().locator('.member-count, .el-tag');
      if (await memberCount.count() > 0) {
        await expect(memberCount).toBeVisible();
      }
    } else if (await tableRows.count() > 0) {
      await expect(tableRows.first()).toBeVisible();
    } else {
      // 如果没有数据，检查空状态提示
      await expect(page.locator('.el-empty, .no-data')).toBeVisible();
    }
  });

  test('新增部门功能', async ({ page }) => {
    // 点击新增按钮
    const addButton = page.locator('button:has-text("新增"), button:has-text("添加")');
    await addButton.click();
    
    // 等待对话框打开
    await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
    
    // 填写部门信息
    await page.fill('input[placeholder*="部门名称"], input[name="name"]', '测试部门');
    await page.fill('textarea[placeholder*="部门简介"], textarea[name="intro"]', '这是一个测试部门的简介');
    
    // 提交表单
    const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
    await submitButton.click();
    
    // 等待操作完成
    await page.waitForTimeout(2000);
    
    // 检查成功提示
    await expect(page.locator('.el-message--success')).toBeVisible();
  });

  test('编辑部门功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 查找编辑按钮
    const editButton = page.locator('button:has-text("编辑"), .el-icon-edit');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      
      // 等待编辑对话框打开
      await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
      
      // 修改部门名称
      const nameInput = page.locator('input[placeholder*="部门名称"], input[name="name"]');
      await nameInput.clear();
      await nameInput.fill('修改后的部门名称');
      
      // 修改部门简介
      const introTextarea = page.locator('textarea[placeholder*="部门简介"], textarea[name="intro"]');
      await introTextarea.clear();
      await introTextarea.fill('修改后的部门简介');
      
      // 提交修改
      const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
      await submitButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查成功提示
      await expect(page.locator('.el-message--success')).toBeVisible();
    }
  });

  test('删除部门功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 查找删除按钮
    const deleteButton = page.locator('button:has-text("删除"), .el-icon-delete');
    if (await deleteButton.count() > 0) {
      await deleteButton.first().click();
      
      // 等待确认对话框
      await expect(page.locator('.el-message-box, .el-dialog')).toBeVisible();
      
      // 确认删除
      const confirmButton = page.locator('.el-message-box button:has-text("确定"), .el-dialog button:has-text("确定")');
      await confirmButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查成功提示或错误提示
      const successMessage = page.locator('.el-message--success');
      const errorMessage = page.locator('.el-message--error');
      
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
      } else if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
        // 如果有错误，可能是部门下还有成员
        await expect(errorMessage).toContainText('部门下还有成员');
      }
    }
  });

  test('部门详情页面', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 查找查看详情按钮或点击部门卡片
    const detailButton = page.locator('button:has-text("详情"), button:has-text("查看")');
    const deptCard = page.locator('.dept-card, .el-card');
    
    if (await detailButton.count() > 0) {
      await detailButton.first().click();
    } else if (await deptCard.count() > 0) {
      await deptCard.first().click();
    }
    
    // 等待跳转到详情页面
    await page.waitForURL('**/dept/detail/**', { timeout: 5000 });
    
    // 检查详情页面元素
    await expect(page.locator('h1, .page-title')).toContainText('部门详情');
    
    // 检查部门基本信息
    await expect(page.locator('.dept-info, .el-card')).toBeVisible();
    
    // 检查成员列表
    await expect(page.locator('.member-list, .el-table')).toBeVisible();
    
    // 检查相关活动
    await expect(page.locator('.activity-list, .el-table')).toBeVisible();
  });

  test('部门成员管理', async ({ page }) => {
    // 先进入部门详情页面
    await page.waitForTimeout(2000);
    const deptCard = page.locator('.dept-card, .el-card');
    if (await deptCard.count() > 0) {
      await deptCard.first().click();
      await page.waitForURL('**/dept/detail/**', { timeout: 5000 });
    }
    
    // 检查成员列表
    const memberList = page.locator('.member-list, .el-table');
    if (await memberList.count() > 0) {
      await expect(memberList).toBeVisible();
      
      // 检查成员信息
      const memberRows = page.locator('.el-table__row, tbody tr');
      if (await memberRows.count() > 0) {
        await expect(memberRows.first()).toBeVisible();
        
        // 检查成员姓名、角色等信息
        await expect(memberRows.first().locator('td')).toHaveCount.greaterThan(0);
      }
    }
  });

  test('部门活动关联', async ({ page }) => {
    // 先进入部门详情页面
    await page.waitForTimeout(2000);
    const deptCard = page.locator('.dept-card, .el-card');
    if (await deptCard.count() > 0) {
      await deptCard.first().click();
      await page.waitForURL('**/dept/detail/**', { timeout: 5000 });
    }
    
    // 检查相关活动列表
    const activityList = page.locator('.activity-list, .el-table');
    if (await activityList.count() > 0) {
      await expect(activityList).toBeVisible();
      
      // 检查活动信息
      const activityRows = page.locator('.el-table__row, tbody tr');
      if (await activityRows.count() > 0) {
        await expect(activityRows.first()).toBeVisible();
      }
    }
  });

  test('权限控制', async ({ page }) => {
    // 检查不同角色的操作权限
    const userRole = await page.evaluate(() => {
      return localStorage.getItem('userRole') || 'admin';
    });
    
    if (userRole === '干事') {
      // 干事只能查看部门信息
      await expect(page.locator('button:has-text("新增"), button:has-text("编辑")')).toHaveCount(0);
    } else if (userRole === '部长') {
      // 部长可以管理本部门
      await expect(page.locator('button:has-text("编辑")')).toBeVisible();
    } else if (userRole === '社长' || userRole === 'admin') {
      // 社长可以管理所有部门
      await expect(page.locator('button:has-text("新增"), button:has-text("编辑"), button:has-text("删除")')).toBeVisible();
    }
  });

  test('响应式设计', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.dept-container, .main-content')).toBeVisible();
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.dept-container, .main-content')).toBeVisible();
    
    // 测试手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.dept-container, .main-content')).toBeVisible();
    
    // 检查移动端卡片布局
    const deptCards = page.locator('.dept-card, .el-card');
    if (await deptCards.count() > 0) {
      await expect(deptCards.first()).toBeVisible();
    }
  });

  test('部门统计信息', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 检查部门统计信息
    const deptCards = page.locator('.dept-card, .el-card');
    if (await deptCards.count() > 0) {
      const firstCard = deptCards.first();
      
      // 检查成员数量显示
      const memberCount = firstCard.locator('.member-count, .el-tag, .stat-number');
      if (await memberCount.count() > 0) {
        await expect(memberCount).toBeVisible();
      }
      
      // 检查部门简介显示
      const intro = firstCard.locator('.dept-intro, .card-content');
      if (await intro.count() > 0) {
        await expect(intro).toBeVisible();
      }
    }
  });
});
