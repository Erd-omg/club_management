// @ts-check
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');

test.describe('消息系统功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到消息中心
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
  });

  test('消息中心页面基本显示', async ({ page }) => {
    // 检查页面容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查消息列表
    await expect(page.locator('.message-list, .el-table, .el-card')).toBeVisible();
    
    // 检查操作按钮
    await expect(page.locator('button:has-text("全部标记已读"), button:has-text("清空")')).toBeVisible();
  });

  test('消息列表数据加载', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 检查消息列表是否有数据
    const messageItems = page.locator('.message-item, .el-table__row, .el-card');
    if (await messageItems.count() > 0) {
      await expect(messageItems.first()).toBeVisible();
      
      // 检查消息标题
      await expect(messageItems.first().locator('.message-title, .el-card__header')).toBeVisible();
      
      // 检查消息内容
      await expect(messageItems.first().locator('.message-content, .el-card__body')).toBeVisible();
      
      // 检查消息时间
      await expect(messageItems.first().locator('.message-time, .el-card__time')).toBeVisible();
    } else {
      // 如果没有数据，检查空状态提示
      await expect(page.locator('.el-empty, .no-data')).toBeVisible();
    }
  });

  test('未读消息提醒', async ({ page }) => {
    // 检查未读消息数量显示
    const unreadCount = page.locator('.unread-count, .el-badge__content');
    if (await unreadCount.count() > 0) {
      await expect(unreadCount).toBeVisible();
      
      // 检查未读消息的样式
      const unreadMessage = page.locator('.message-item.unread, .el-table__row.unread');
      if (await unreadMessage.count() > 0) {
        await expect(unreadMessage.first()).toBeVisible();
      }
    }
  });

  test('消息详情查看', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 点击第一条消息
    const messageItem = page.locator('.message-item, .el-table__row, .el-card');
    if (await messageItem.count() > 0) {
      await messageItem.first().click();
      
      // 等待消息详情显示
      await page.waitForTimeout(1000);
      
      // 检查消息详情内容
      const messageDetail = page.locator('.message-detail, .el-dialog, .el-drawer');
      if (await messageDetail.count() > 0) {
        await expect(messageDetail).toBeVisible();
        
        // 检查消息标题
        await expect(messageDetail.locator('.message-title, .el-dialog__title')).toBeVisible();
        
        // 检查消息内容
        await expect(messageDetail.locator('.message-content, .el-dialog__body')).toBeVisible();
        
        // 检查发送者信息
        await expect(messageDetail.locator('.message-sender, .sender-info')).toBeVisible();
        
        // 检查发送时间
        await expect(messageDetail.locator('.message-time, .send-time')).toBeVisible();
      }
    }
  });

  test('标记消息已读', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 查找未读消息
    const unreadMessage = page.locator('.message-item.unread, .el-table__row.unread');
    if (await unreadMessage.count() > 0) {
      // 查找标记已读按钮
      const markReadButton = unreadMessage.first().locator('button:has-text("标记已读"), .el-icon-check');
      if (await markReadButton.count() > 0) {
        await markReadButton.click();
        
        // 等待操作完成
        await page.waitForTimeout(1000);
        
        // 检查成功提示
        await expect(page.locator('.el-message--success')).toBeVisible();
        
        // 检查消息状态变化
        await expect(unreadMessage.first()).not.toHaveClass('unread');
      }
    }
  });

  test('全部标记已读功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 点击全部标记已读按钮
    const markAllReadButton = page.locator('button:has-text("全部标记已读"), button:has-text("全部已读")');
    if (await markAllReadButton.count() > 0) {
      await markAllReadButton.click();
      
      // 等待确认对话框
      await expect(page.locator('.el-message-box, .el-dialog')).toBeVisible();
      
      // 确认操作
      const confirmButton = page.locator('.el-message-box button:has-text("确定"), .el-dialog button:has-text("确定")');
      await confirmButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查成功提示
      await expect(page.locator('.el-message--success')).toBeVisible();
      
      // 检查未读消息数量变为0
      const unreadCount = page.locator('.unread-count, .el-badge__content');
      if (await unreadCount.count() > 0) {
        await expect(unreadCount).toContainText('0');
      }
    }
  });

  test('删除消息功能', async ({ page }) => {
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
      
      // 检查成功提示
      await expect(page.locator('.el-message--success')).toBeVisible();
    }
  });

  test('清空消息功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 点击清空按钮
    const clearButton = page.locator('button:has-text("清空"), button:has-text("清空所有")');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      // 等待确认对话框
      await expect(page.locator('.el-message-box, .el-dialog')).toBeVisible();
      
      // 确认清空
      const confirmButton = page.locator('.el-message-box button:has-text("确定"), .el-dialog button:has-text("确定")');
      await confirmButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查成功提示
      await expect(page.locator('.el-message--success')).toBeVisible();
      
      // 检查消息列表为空
      await expect(page.locator('.el-empty, .no-data')).toBeVisible();
    }
  });

  test('消息筛选功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 测试按状态筛选
    const statusFilter = page.locator('.el-select:has-text("状态"), select[name="status"]');
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      await page.click('.el-select-dropdown__item:has-text("未读")');
      await page.waitForTimeout(1000);
    }
    
    // 测试按类型筛选
    const typeFilter = page.locator('.el-select:has-text("类型"), select[name="type"]');
    if (await typeFilter.count() > 0) {
      await typeFilter.click();
      await page.click('.el-select-dropdown__item:has-text("活动通知")');
      await page.waitForTimeout(1000);
    }
  });

  test('消息搜索功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 输入搜索关键词
    const searchInput = page.locator('input[placeholder*="搜索"], .el-input__inner');
    if (await searchInput.count() > 0) {
      await searchInput.fill('活动');
      
      // 点击搜索按钮或按回车
      const searchButton = page.locator('button:has-text("搜索"), .el-icon-search');
      if (await searchButton.count() > 0) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }
      
      // 等待搜索结果
      await page.waitForTimeout(1000);
      
      // 检查搜索结果
      const messageItems = page.locator('.message-item, .el-table__row, .el-card');
      await expect(messageItems).toHaveCount.greaterThanOrEqual(0);
    }
  });

  test('侧边栏消息提醒', async ({ page }) => {
    // 检查侧边栏的消息提醒
    const sidebarMessageIcon = page.locator('.sidebar .message-icon, .el-menu .message-badge');
    if (await sidebarMessageIcon.count() > 0) {
      await expect(sidebarMessageIcon).toBeVisible();
      
      // 检查未读消息徽章
      const messageBadge = page.locator('.el-badge__content, .unread-badge');
      if (await messageBadge.count() > 0) {
        await expect(messageBadge).toBeVisible();
      }
    }
  });

  test('权限控制', async ({ page }) => {
    // 检查不同角色的消息权限
    const userRole = await page.evaluate(() => {
      return localStorage.getItem('userRole') || 'admin';
    });
    
    // 所有角色都应该能查看消息
    await expect(page.locator('.message-list, .el-table, .el-card')).toBeVisible();
    
    // 检查操作权限
    if (userRole === '干事') {
      // 干事只能查看和标记已读
      await expect(page.locator('button:has-text("清空")')).toHaveCount(0);
    } else {
      // 其他角色可以清空消息
      await expect(page.locator('button:has-text("清空"), button:has-text("全部标记已读")')).toBeVisible();
    }
  });

  test('响应式设计', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.message-container, .main-content')).toBeVisible();
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.message-container, .main-content')).toBeVisible();
    
    // 测试手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.message-container, .main-content')).toBeVisible();
    
    // 检查移动端消息列表
    const messageList = page.locator('.message-list, .el-table, .el-card');
    await expect(messageList).toBeVisible();
  });

  test('消息实时更新', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 检查是否有自动刷新功能
    const refreshButton = page.locator('button:has-text("刷新"), .el-icon-refresh');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      
      // 等待数据重新加载
      await page.waitForTimeout(2000);
      
      // 检查数据是否更新
      await expect(page.locator('.message-list, .el-table, .el-card')).toBeVisible();
    }
  });
});
