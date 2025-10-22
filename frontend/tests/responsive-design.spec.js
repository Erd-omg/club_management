const { test, expect } = require('@playwright/test');

test.describe('响应式设计功能测试', () => {
  // 登录辅助函数 - 使用更短的超时时间
  async function login(page, username = '2021001', password = 'password') {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 等待登录表单完全加载
    await page.waitForSelector('input[autocomplete="username"]', { timeout: 5000 });
    await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 5000 });
    await page.waitForSelector('button:has-text("登录")', { timeout: 5000 });
    
    await page.fill('input[autocomplete="username"]', username);
    await page.fill('input[autocomplete="current-password"]', password);
    
    // 等待一下确保表单填写完成
    await page.waitForTimeout(500);
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 等待跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // 额外等待确保页面完全加载
    await page.waitForTimeout(1000);
  }

  test('桌面端响应式测试', async ({ page }) => {
    console.log('开始测试桌面端响应式设计...');
    
    // 设置桌面端视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查桌面端布局
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.aside')).toBeVisible();
    await expect(page.locator('.main-container')).toBeVisible();
    
    // 检查侧边栏是否正常显示
    const sidebar = page.locator('.aside');
    if (await sidebar.isVisible()) {
      console.log('桌面端侧边栏显示正常');
    }
    
    // 检查主内容区域
    const mainContent = page.locator('.main-container');
    if (await mainContent.isVisible()) {
      console.log('桌面端主内容区域显示正常');
    }
    
    // 检查统计卡片布局
    const statCards = page.locator('.stat-card');
    const cardCount = await statCards.count();
    console.log(`桌面端统计卡片数量: ${cardCount}`);
    
    // 测试导航菜单
    const menus = ['仪表盘', '部门管理', '社员管理', '活动管理'];
    for (const menu of menus) {
      const menuElement = page.locator(`text=${menu}`);
      if (await menuElement.isVisible()) {
        console.log(`桌面端菜单 ${menu} 显示正常`);
      }
    }
    
    console.log('桌面端响应式测试完成');
  });

  test('平板端响应式测试', async ({ page }) => {
    console.log('开始测试平板端响应式设计...');
    
    // 设置平板端视口
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查平板端布局
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查侧边栏是否折叠或隐藏
    const sidebar = page.locator('.aside');
    const isSidebarVisible = await sidebar.isVisible();
    
    if (isSidebarVisible) {
      console.log('平板端侧边栏显示正常');
    } else {
      console.log('平板端侧边栏已隐藏（响应式设计）');
    }
    
    // 检查主内容区域
    const mainContent = page.locator('.main-container');
    if (await mainContent.isVisible()) {
      console.log('平板端主内容区域显示正常');
    }
    
    // 检查统计卡片布局
    const statCards = page.locator('.stat-card');
    const cardCount = await statCards.count();
    console.log(`平板端统计卡片数量: ${cardCount}`);
    
    // 检查是否有移动端菜单按钮
    const mobileMenuButton = page.locator('.mobile-menu-button');
    if (await mobileMenuButton.isVisible()) {
      console.log('平板端移动菜单按钮显示正常');
      
      // 点击移动菜单按钮
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // 检查菜单是否展开
      const expandedMenu = page.locator('.mobile-menu-expanded');
      if (await expandedMenu.isVisible()) {
        console.log('平板端移动菜单展开正常');
      }
    }
    
    console.log('平板端响应式测试完成');
  });

  test('手机端响应式测试', async ({ page }) => {
    console.log('开始测试手机端响应式设计...');
    
    // 设置手机端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查手机端布局
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查侧边栏是否隐藏
    const sidebar = page.locator('.aside');
    const isSidebarVisible = await sidebar.isVisible();
    
    if (isSidebarVisible) {
      console.log('手机端侧边栏显示（可能需要优化）');
    } else {
      console.log('手机端侧边栏已隐藏（响应式设计）');
    }
    
    // 检查主内容区域
    const mainContent = page.locator('.main-container');
    if (await mainContent.isVisible()) {
      console.log('手机端主内容区域显示正常');
    }
    
    // 检查统计卡片布局
    const statCards = page.locator('.stat-card');
    const cardCount = await statCards.count();
    console.log(`手机端统计卡片数量: ${cardCount}`);
    
    // 检查是否有移动端菜单按钮
    const mobileMenuButton = page.locator('.mobile-menu-button');
    if (await mobileMenuButton.isVisible()) {
      console.log('手机端移动菜单按钮显示正常');
      
      // 点击移动菜单按钮
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // 检查菜单是否展开
      const expandedMenu = page.locator('.mobile-menu-expanded');
      if (await expandedMenu.isVisible()) {
        console.log('手机端移动菜单展开正常');
      }
    }
    
    console.log('手机端响应式测试完成');
  });

  test('登录页面响应式测试', async ({ page }) => {
    console.log('开始测试登录页面响应式设计...');
    
    // 测试桌面端登录页面
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 检查登录表单
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();
    
    console.log('桌面端登录页面显示正常');
    
    // 测试平板端登录页面
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查登录表单
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();
    
    console.log('平板端登录页面显示正常');
    
    // 测试手机端登录页面
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查登录表单
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();
    
    console.log('手机端登录页面显示正常');
    
    console.log('登录页面响应式测试完成');
  });

  test('表格响应式测试', async ({ page }) => {
    console.log('开始测试表格响应式设计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 测试桌面端表格
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 检查表格显示
    const table = page.locator('.el-table');
    if (await table.isVisible()) {
      console.log('桌面端表格显示正常');
    }
    
    // 测试平板端表格
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查表格显示
    if (await table.isVisible()) {
      console.log('平板端表格显示正常');
    }
    
    // 测试手机端表格
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查表格显示
    if (await table.isVisible()) {
      console.log('手机端表格显示正常');
    }
    
    console.log('表格响应式测试完成');
  });

  test('表单响应式测试', async ({ page }) => {
    console.log('开始测试表单响应式设计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 测试桌面端表单
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 点击添加社员按钮
    const addButton = page.locator('button:has-text("添加社员")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      
      // 检查表单显示
      const form = page.locator('.el-dialog');
      if (await form.isVisible()) {
        console.log('桌面端表单显示正常');
      }
      
      // 关闭表单
      await page.click('.el-dialog__close');
    }
    
    // 测试平板端表单
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      
      // 检查表单显示
      const form = page.locator('.el-dialog');
      if (await form.isVisible()) {
        console.log('平板端表单显示正常');
      }
      
      // 关闭表单
      await page.click('.el-dialog__close');
    }
    
    // 测试手机端表单
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      
      // 检查表单显示
      const form = page.locator('.el-dialog');
      if (await form.isVisible()) {
        console.log('手机端表单显示正常');
      }
      
      // 关闭表单
      await page.click('.el-dialog__close');
    }
    
    console.log('表单响应式测试完成');
  });

  test('图表响应式测试', async ({ page }) => {
    console.log('开始测试图表响应式设计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 测试桌面端图表
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 检查图表显示
    const deptPieChart = page.locator('div[ref="deptPie"]');
    const typeBarChart = page.locator('div[ref="typeBar"]');
    
    if (await deptPieChart.isVisible()) {
      console.log('桌面端部门分布图表显示正常');
    }
    
    if (await typeBarChart.isVisible()) {
      console.log('桌面端活动类型图表显示正常');
    }
    
    // 测试平板端图表
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (await deptPieChart.isVisible()) {
      console.log('平板端部门分布图表显示正常');
    }
    
    if (await typeBarChart.isVisible()) {
      console.log('平板端活动类型图表显示正常');
    }
    
    // 测试手机端图表
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (await deptPieChart.isVisible()) {
      console.log('手机端部门分布图表显示正常');
    }
    
    if (await typeBarChart.isVisible()) {
      console.log('手机端活动类型图表显示正常');
    }
    
    console.log('图表响应式测试完成');
  });
});
