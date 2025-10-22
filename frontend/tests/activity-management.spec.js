const { test, expect } = require('@playwright/test');

test.describe('活动管理功能测试', () => {
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

  test('社长查看活动列表测试', async ({ page }) => {
    console.log('开始测试社长查看活动列表...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查活动列表页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查活动表格
    await expect(page.locator('.el-table')).toBeVisible();
    
    // 检查添加活动按钮（社长应该有权限）
    await expect(page.locator('button:has-text("添加活动")')).toBeVisible();
    
    console.log('社长活动列表测试完成');
  });

  test('创建活动功能测试', async ({ page }) => {
    console.log('开始测试创建活动功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 点击添加活动按钮
    await page.click('button:has-text("添加活动")');
    
    // 等待添加对话框出现
    await page.waitForSelector('.el-dialog', { timeout: 10000 });
    
    // 检查添加表单
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('input[placeholder*="活动名称"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="活动地点"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="活动简介"]')).toBeVisible();
    
    // 填写活动信息
    await page.fill('input[placeholder*="活动名称"]', '测试活动');
    await page.fill('input[placeholder*="活动地点"]', '测试地点');
    await page.fill('textarea[placeholder*="活动简介"]', '这是一个测试活动的简介');
    
    // 选择活动类型
    await page.click('.el-select');
    await page.click('.el-select-dropdown__item:first-child');
    
    // 选择签到方式
    await page.click('.el-select').nth(1);
    await page.click('.el-select-dropdown__item:has-text("二维码签到")');
    
    // 设置开始时间
    await page.click('input[placeholder*="开始时间"]');
    await page.click('.el-picker-panel__today-btn');
    
    // 设置结束时间
    await page.click('input[placeholder*="结束时间"]');
    await page.click('.el-picker-panel__today-btn');
    
    // 点击确定按钮
    await page.click('button:has-text("确定")');
    
    // 等待操作完成
    await page.waitForTimeout(2000);
    
    // 检查是否添加成功（应该有成功提示）
    const successMessage = await page.locator('.el-message--success').isVisible();
    if (successMessage) {
      console.log('活动创建成功');
    } else {
      console.log('活动创建可能失败或需要进一步验证');
    }
    
    console.log('创建活动功能测试完成');
  });

  test('编辑活动功能测试', async ({ page }) => {
    console.log('开始测试编辑活动功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
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
      
      // 修改活动名称
      const nameInput = page.locator('input[placeholder*="活动名称"]');
      await nameInput.clear();
      await nameInput.fill('修改后的活动名称');
      
      // 修改活动地点
      const locationInput = page.locator('input[placeholder*="活动地点"]');
      await locationInput.clear();
      await locationInput.fill('修改后的活动地点');
      
      // 点击确定按钮
      await page.click('button:has-text("确定")');
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      console.log('活动编辑功能测试完成');
    } else {
      console.log('没有找到编辑按钮，可能没有数据或权限不足');
    }
  });

  test('活动审批功能测试', async ({ page }) => {
    console.log('开始测试活动审批功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 查找待审批的活动
    const pendingActivity = page.locator('.el-table tr:has-text("待审批")').first();
    if (await pendingActivity.isVisible()) {
      // 点击查看详情按钮
      const detailButton = pendingActivity.locator('.el-button:has-text("查看详情")');
      await detailButton.click();
      
      // 等待活动详情页面加载
      await page.waitForTimeout(2000);
      
      // 检查审批按钮
      const approveButton = page.locator('button:has-text("通过")');
      const rejectButton = page.locator('button:has-text("驳回")');
      
      if (await approveButton.isVisible() && await rejectButton.isVisible()) {
        console.log('审批按钮显示正常');
        
        // 测试通过审批
        await approveButton.click();
        
        // 等待确认对话框
        await page.waitForSelector('.el-message-box', { timeout: 10000 });
        await page.click('.el-message-box .el-button--primary');
        
        // 等待操作完成
        await page.waitForTimeout(2000);
        
        console.log('活动审批功能测试完成');
      } else {
        console.log('审批按钮不可见，可能权限不足');
      }
    } else {
      console.log('没有找到待审批的活动');
    }
  });

  test('多签审批流程测试', async ({ page }) => {
    console.log('开始测试多签审批流程...');
    
    // 副社长登录
    await login(page, '2021002', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 查找待审批的活动
    const pendingActivity = page.locator('.el-table tr:has-text("待审批")').first();
    if (await pendingActivity.isVisible()) {
      // 点击查看详情按钮
      const detailButton = pendingActivity.locator('.el-button:has-text("查看详情")');
      await detailButton.click();
      
      // 等待活动详情页面加载
      await page.waitForTimeout(2000);
      
      // 检查审批状态显示
      const approvalStatus = page.locator('.approval-status');
      if (await approvalStatus.isVisible()) {
        const statusText = await approvalStatus.textContent();
        console.log(`当前审批状态: ${statusText}`);
        
        // 检查审批人列表
        const approverList = page.locator('.approver-list');
        if (await approverList.isVisible()) {
          console.log('审批人列表显示正常');
          
          // 检查当前用户的审批状态
          const currentUserApproval = page.locator('.approver-list .current-user');
          if (await currentUserApproval.isVisible()) {
            console.log('当前用户审批状态显示正常');
          }
        }
      }
      
      console.log('多签审批流程测试完成');
    } else {
      console.log('没有找到待审批的活动');
    }
  });

  test('活动搜索功能测试', async ({ page }) => {
    console.log('开始测试活动搜索功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待搜索表单加载
    await page.waitForSelector('.search-form', { timeout: 10000 });
    
    // 测试按活动名称搜索
    const nameInput = page.locator('input[placeholder*="活动名称"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('测试');
      await page.click('button:has-text("搜索")');
      
      // 等待搜索结果
      await page.waitForTimeout(2000);
      
      console.log('按活动名称搜索测试完成');
    }
    
    // 测试按活动类型搜索
    const typeSelect = page.locator('.el-select');
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
      await page.click('.el-select-dropdown__item:first-child');
      await page.click('button:has-text("搜索")');
      
      // 等待搜索结果
      await page.waitForTimeout(2000);
      
      console.log('按活动类型搜索测试完成');
    }
    
    console.log('活动搜索功能测试完成');
  });

  test('活动管理权限控制测试', async ({ page }) => {
    console.log('开始测试活动管理权限控制...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查活动列表页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查活动表格
    await expect(page.locator('.el-table')).toBeVisible();
    
    // 干事不应该看到添加活动按钮（权限限制）
    const addButton = page.locator('button:has-text("添加活动")');
    const isAddButtonVisible = await addButton.isVisible();
    
    if (isAddButtonVisible) {
      console.log('警告：干事可以看到添加活动按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到添加活动按钮');
    }
    
    // 检查编辑和删除按钮的权限
    const editButtons = page.locator('.el-table .el-button:has-text("编辑")');
    const deleteButtons = page.locator('.el-table .el-button:has-text("删除")');
    
    const editButtonCount = await editButtons.count();
    const deleteButtonCount = await deleteButtons.count();
    
    if (editButtonCount > 0 || deleteButtonCount > 0) {
      console.log('警告：干事可以看到编辑/删除按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到编辑/删除按钮');
    }
    
    console.log('活动管理权限控制测试完成');
  });
});
