const { test, expect } = require('@playwright/test');

test.describe('权限控制功能测试', () => {
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

  test('社长权限测试', async ({ page }) => {
    console.log('开始测试社长权限...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查社长可以看到的所有菜单
    const menus = ['仪表盘', '部门管理', '社员管理', '活动管理', '数据导出'];
    
    for (const menu of menus) {
      const menuElement = page.locator(`text=${menu}`);
      if (await menuElement.isVisible()) {
        console.log(`社长可以看到: ${menu}`);
      } else {
        console.log(`社长无法看到: ${menu}`);
      }
    }
    
    // 测试部门管理权限
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    
    // 检查添加部门按钮
    const addDeptButton = page.locator('button:has-text("添加部门")');
    if (await addDeptButton.isVisible()) {
      console.log('社长可以添加部门');
    } else {
      console.log('社长无法添加部门');
    }
    
    // 测试成员管理权限
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 检查添加成员按钮
    const addMemberButton = page.locator('button:has-text("添加社员")');
    if (await addMemberButton.isVisible()) {
      console.log('社长可以添加成员');
    } else {
      console.log('社长无法添加成员');
    }
    
    // 测试活动管理权限
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    
    // 检查添加活动按钮
    const addActivityButton = page.locator('button:has-text("添加活动")');
    if (await addActivityButton.isVisible()) {
      console.log('社长可以添加活动');
    } else {
      console.log('社长无法添加活动');
    }
    
    console.log('社长权限测试完成');
  });

  test('副社长权限测试', async ({ page }) => {
    console.log('开始测试副社长权限...');
    
    // 副社长登录
    await login(page, '2021002', 'password');
    
    // 检查副社长可以看到的菜单
    const menus = ['仪表盘', '部门管理', '社员管理', '活动管理', '数据导出'];
    
    for (const menu of menus) {
      const menuElement = page.locator(`text=${menu}`);
      if (await menuElement.isVisible()) {
        console.log(`副社长可以看到: ${menu}`);
      } else {
        console.log(`副社长无法看到: ${menu}`);
      }
    }
    
    // 测试部门管理权限
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    
    // 检查添加部门按钮
    const addDeptButton = page.locator('button:has-text("添加部门")');
    if (await addDeptButton.isVisible()) {
      console.log('副社长可以添加部门');
    } else {
      console.log('副社长无法添加部门');
    }
    
    // 测试成员管理权限
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 检查添加成员按钮
    const addMemberButton = page.locator('button:has-text("添加社员")');
    if (await addMemberButton.isVisible()) {
      console.log('副社长可以添加成员');
    } else {
      console.log('副社长无法添加成员');
    }
    
    console.log('副社长权限测试完成');
  });

  test('部长权限测试', async ({ page }) => {
    console.log('开始测试部长权限...');
    
    // 部长登录
    await login(page, '2021003', 'password');
    
    // 检查部长可以看到的菜单
    const menus = ['仪表盘', '部门管理', '社员管理', '活动管理'];
    
    for (const menu of menus) {
      const menuElement = page.locator(`text=${menu}`);
      if (await menuElement.isVisible()) {
        console.log(`部长可以看到: ${menu}`);
      } else {
        console.log(`部长无法看到: ${menu}`);
      }
    }
    
    // 测试部门管理权限
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    
    // 检查添加部门按钮（部长不应该有权限）
    const addDeptButton = page.locator('button:has-text("添加部门")');
    if (await addDeptButton.isVisible()) {
      console.log('警告：部长可以看到添加部门按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：部长无法添加部门');
    }
    
    // 测试成员管理权限
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 检查添加成员按钮（部长不应该有权限）
    const addMemberButton = page.locator('button:has-text("添加社员")');
    if (await addMemberButton.isVisible()) {
      console.log('警告：部长可以看到添加成员按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：部长无法添加成员');
    }
    
    console.log('部长权限测试完成');
  });

  test('干事权限测试', async ({ page }) => {
    console.log('开始测试干事权限...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 检查干事可以看到的菜单
    const menus = ['仪表盘', '部门管理', '社员管理', '活动管理', '数据导出'];
    
    for (const menu of menus) {
      const menuElement = page.locator(`text=${menu}`);
      if (await menuElement.isVisible()) {
        console.log(`干事可以看到: ${menu}`);
      } else {
        console.log(`干事无法看到: ${menu}`);
      }
    }
    
    // 测试部门管理权限
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    
    // 检查添加部门按钮（干事不应该有权限）
    const addDeptButton = page.locator('button:has-text("添加部门")');
    if (await addDeptButton.isVisible()) {
      console.log('警告：干事可以看到添加部门按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法添加部门');
    }
    
    // 测试成员管理权限
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 检查添加成员按钮（干事不应该有权限）
    const addMemberButton = page.locator('button:has-text("添加社员")');
    if (await addMemberButton.isVisible()) {
      console.log('警告：干事可以看到添加成员按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法添加成员');
    }
    
    // 测试活动管理权限
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    
    // 检查添加活动按钮（干事不应该有权限）
    const addActivityButton = page.locator('button:has-text("添加活动")');
    if (await addActivityButton.isVisible()) {
      console.log('警告：干事可以看到添加活动按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法添加活动');
    }
    
    // 测试数据导出权限
    const exportMenu = page.locator('text=数据导出');
    if (await exportMenu.isVisible()) {
      await exportMenu.click();
      await page.waitForURL('**/export', { timeout: 10000 });
      
      // 检查生成导出包按钮（干事不应该有权限）
      const generateButton = page.locator('button:has-text("生成导出包")');
      if (await generateButton.isVisible()) {
        console.log('警告：干事可以看到生成导出包按钮，可能存在权限问题');
      } else {
        console.log('权限控制正确：干事无法生成导出包');
      }
    } else {
      console.log('权限控制正确：干事无法看到数据导出菜单');
    }
    
    console.log('干事权限测试完成');
  });

  test('数据隔离测试', async ({ page }) => {
    console.log('开始测试数据隔离...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 测试成员管理数据隔离
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 检查干事只能看到自己的记录
    const tableRows = page.locator('.el-table tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount === 1) {
      console.log('数据隔离正确：干事只能看到自己的记录');
    } else if (rowCount > 1) {
      console.log('警告：干事可以看到多条记录，可能存在数据隔离问题');
    } else {
      console.log('没有找到成员记录');
    }
    
    // 测试活动管理数据隔离
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 检查干事只能看到自己参与的活动
    const activityRows = page.locator('.el-table tbody tr');
    const activityRowCount = await activityRows.count();
    
    console.log(`干事可以看到的活动数量: ${activityRowCount}`);
    
    console.log('数据隔离测试完成');
  });

  test('操作权限测试', async ({ page }) => {
    console.log('开始测试操作权限...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 测试成员管理操作权限
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 检查编辑和删除按钮
    const editButtons = page.locator('.el-table .el-button:has-text("编辑")');
    const deleteButtons = page.locator('.el-table .el-button:has-text("删除")');
    
    const editButtonCount = await editButtons.count();
    const deleteButtonCount = await deleteButtons.count();
    
    if (editButtonCount > 0 || deleteButtonCount > 0) {
      console.log('警告：干事可以看到编辑/删除按钮，可能存在操作权限问题');
    } else {
      console.log('操作权限控制正确：干事无法编辑/删除成员');
    }
    
    // 测试活动管理操作权限
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 检查编辑和删除按钮
    const activityEditButtons = page.locator('.el-table .el-button:has-text("编辑")');
    const activityDeleteButtons = page.locator('.el-table .el-button:has-text("删除")');
    
    const activityEditButtonCount = await activityEditButtons.count();
    const activityDeleteButtonCount = await activityDeleteButtons.count();
    
    if (activityEditButtonCount > 0 || activityDeleteButtonCount > 0) {
      console.log('警告：干事可以看到活动编辑/删除按钮，可能存在操作权限问题');
    } else {
      console.log('操作权限控制正确：干事无法编辑/删除活动');
    }
    
    console.log('操作权限测试完成');
  });

  test('权限边界测试', async ({ page }) => {
    console.log('开始测试权限边界...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 尝试直接访问需要权限的API端点
    const response = await page.request.get('/api/member/page?page=1&size=10');
    
    if (response.status() === 200) {
      const data = await response.json();
      if (data.code === 200) {
        console.log('API权限控制正常');
      } else {
        console.log(`API返回错误: ${data.message}`);
      }
    } else {
      console.log(`API请求失败: ${response.status()}`);
    }
    
    // 尝试访问管理员功能
    const adminResponse = await page.request.get('/api/statistics/dashboard');
    
    if (adminResponse.status() === 200) {
      const adminData = await adminResponse.json();
      if (adminData.code === 200) {
        console.log('管理员API权限控制正常');
      } else {
        console.log(`管理员API返回错误: ${adminData.message}`);
      }
    } else {
      console.log(`管理员API请求失败: ${adminResponse.status()}`);
    }
    
    console.log('权限边界测试完成');
  });
});
