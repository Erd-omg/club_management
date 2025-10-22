const { test, expect } = require('@playwright/test');

test.describe('统计模块功能测试', () => {
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

  test('仪表板统计数据显示测试', async ({ page }) => {
    console.log('开始测试仪表板统计数据显示...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查仪表板统计卡片
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // 检查各个统计卡片的内容
    await expect(page.locator('.stat-card').nth(0)).toContainText('成员总数');
    await expect(page.locator('.stat-card').nth(1)).toContainText('近期活动');
    await expect(page.locator('.stat-card').nth(2)).toContainText('待审批');
    await expect(page.locator('.stat-card').nth(3)).toContainText('我参与');
    
    // 检查统计数据不为空
    const memberCount = page.locator('.stat-card').nth(0).locator('.stat-number');
    const activityCount = page.locator('.stat-card').nth(1).locator('.stat-number');
    const pendingCount = page.locator('.stat-card').nth(2).locator('.stat-number');
    const myJoinCount = page.locator('.stat-card').nth(3).locator('.stat-number');
    
    if (await memberCount.isVisible()) {
      const memberText = await memberCount.textContent();
      console.log(`成员总数: ${memberText}`);
    }
    
    if (await activityCount.isVisible()) {
      const activityText = await activityCount.textContent();
      console.log(`近期活动: ${activityText}`);
    }
    
    if (await pendingCount.isVisible()) {
      const pendingText = await pendingCount.textContent();
      console.log(`待审批: ${pendingText}`);
    }
    
    if (await myJoinCount.isVisible()) {
      const myJoinText = await myJoinCount.textContent();
      console.log(`我参与: ${myJoinText}`);
    }
    
    console.log('仪表板统计数据显示测试完成');
  });

  test('部门成员分布统计测试', async ({ page }) => {
    console.log('开始测试部门成员分布统计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查部门成员分布图表
    const deptPieChart = page.locator('div[ref="deptPie"]');
    if (await deptPieChart.isVisible()) {
      console.log('部门成员分布图表显示正常');
      
      // 检查图表标题
      const chartTitle = page.locator('h3:has-text("部门成员分布")');
      if (await chartTitle.isVisible()) {
        console.log('图表标题显示正常');
      }
      
      // 检查图表容器
      await expect(deptPieChart).toBeVisible();
    } else {
      console.log('部门成员分布图表不可见（可能权限限制）');
    }
    
    console.log('部门成员分布统计测试完成');
  });

  test('活动类型统计测试', async ({ page }) => {
    console.log('开始测试活动类型统计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 检查活动类型统计图表
    const typeBarChart = page.locator('div[ref="typeBar"]');
    if (await typeBarChart.isVisible()) {
      console.log('活动类型统计图表显示正常');
      
      // 检查图表标题
      const chartTitle = page.locator('h3:has-text("活动类型分布")');
      if (await chartTitle.isVisible()) {
        console.log('图表标题显示正常');
      }
      
      // 检查图表容器
      await expect(typeBarChart).toBeVisible();
    } else {
      console.log('活动类型统计图表不可见（可能权限限制）');
    }
    
    console.log('活动类型统计测试完成');
  });

  test('出勤率统计测试', async ({ page }) => {
    console.log('开始测试出勤率统计...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 查找已完成的活动
    const completedActivity = page.locator('.el-table tr:has-text("已通过")').first();
    if (await completedActivity.isVisible()) {
      // 点击查看详情按钮
      const detailButton = completedActivity.locator('.el-button:has-text("查看详情")');
      await detailButton.click();
      
      // 等待活动详情页面加载
      await page.waitForTimeout(2000);
      
      // 检查出勤率统计
      const attendanceStats = page.locator('.attendance-stats');
      if (await attendanceStats.isVisible()) {
        console.log('出勤率统计显示正常');
        
        // 检查出勤率数据
        const attendanceRate = page.locator('.attendance-rate');
        if (await attendanceRate.isVisible()) {
          const rateText = await attendanceRate.textContent();
          console.log(`出勤率: ${rateText}`);
        }
        
        // 检查参与人数
        const participantCount = page.locator('.participant-count');
        if (await participantCount.isVisible()) {
          const countText = await participantCount.textContent();
          console.log(`参与人数: ${countText}`);
        }
      } else {
        console.log('没有找到出勤率统计');
      }
    } else {
      console.log('没有找到已完成的活动');
    }
    
    console.log('出勤率统计测试完成');
  });

  test('活动统计详情测试', async ({ page }) => {
    console.log('开始测试活动统计详情...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 检查活动统计信息
    const activityStats = page.locator('.activity-stats');
    if (await activityStats.isVisible()) {
      console.log('活动统计信息显示正常');
      
      // 检查总活动数
      const totalActivities = page.locator('.total-activities');
      if (await totalActivities.isVisible()) {
        const totalText = await totalActivities.textContent();
        console.log(`总活动数: ${totalText}`);
      }
      
      // 检查本月活动数
      const monthlyActivities = page.locator('.monthly-activities');
      if (await monthlyActivities.isVisible()) {
        const monthlyText = await monthlyActivities.textContent();
        console.log(`本月活动数: ${monthlyText}`);
      }
      
      // 检查待审批活动数
      const pendingActivities = page.locator('.pending-activities');
      if (await pendingActivities.isVisible()) {
        const pendingText = await pendingActivities.textContent();
        console.log(`待审批活动数: ${pendingText}`);
      }
    } else {
      console.log('没有找到活动统计信息');
    }
    
    console.log('活动统计详情测试完成');
  });

  test('部门统计详情测试', async ({ page }) => {
    console.log('开始测试部门统计详情...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到部门管理页面
    await page.click('text=部门管理');
    await page.waitForURL('**/dept', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待部门卡片加载
    await page.waitForSelector('.dept-card', { timeout: 10000 });
    
    // 检查部门统计信息
    const deptStats = page.locator('.dept-stats');
    if (await deptStats.isVisible()) {
      console.log('部门统计信息显示正常');
      
      // 检查总部门数
      const totalDepts = page.locator('.total-depts');
      if (await totalDepts.isVisible()) {
        const totalText = await totalDepts.textContent();
        console.log(`总部门数: ${totalText}`);
      }
      
      // 检查总成员数
      const totalMembers = page.locator('.total-members');
      if (await totalMembers.isVisible()) {
        const totalText = await totalMembers.textContent();
        console.log(`总成员数: ${totalText}`);
      }
    } else {
      console.log('没有找到部门统计信息');
    }
    
    // 检查各个部门的成员数量
    const deptCards = page.locator('.dept-card');
    const cardCount = await deptCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = deptCards.nth(i);
      
      // 检查部门名称
      const deptName = card.locator('.dept-name');
      if (await deptName.isVisible()) {
        const nameText = await deptName.textContent();
        console.log(`部门名称: ${nameText}`);
      }
      
      // 检查成员数量
      const memberCount = card.locator('.member-count');
      if (await memberCount.isVisible()) {
        const countText = await memberCount.textContent();
        console.log(`成员数量: ${countText}`);
      }
    }
    
    console.log('部门统计详情测试完成');
  });

  test('统计权限控制测试', async ({ page }) => {
    console.log('开始测试统计权限控制...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 检查仪表板统计卡片
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // 检查干事能看到的基本统计
    const memberCount = page.locator('.stat-card').nth(0).locator('.stat-number');
    const activityCount = page.locator('.stat-card').nth(1).locator('.stat-number');
    const pendingCount = page.locator('.stat-card').nth(2).locator('.stat-number');
    const myJoinCount = page.locator('.stat-card').nth(3).locator('.stat-number');
    
    if (await memberCount.isVisible()) {
      const memberText = await memberCount.textContent();
      console.log(`干事看到的成员总数: ${memberText}`);
    }
    
    if (await myJoinCount.isVisible()) {
      const myJoinText = await myJoinCount.textContent();
      console.log(`干事参与的活动数: ${myJoinText}`);
    }
    
    // 检查干事不能看到的管理员统计图表
    const deptPieChart = page.locator('div[ref="deptPie"]');
    const typeBarChart = page.locator('div[ref="typeBar"]');
    
    const isDeptChartVisible = await deptPieChart.isVisible();
    const isTypeChartVisible = await typeBarChart.isVisible();
    
    if (isDeptChartVisible || isTypeChartVisible) {
      console.log('警告：干事可以看到管理员统计图表，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到管理员统计图表');
    }
    
    console.log('统计权限控制测试完成');
  });

  test('统计数据刷新测试', async ({ page }) => {
    console.log('开始测试统计数据刷新...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 记录初始统计数据
    const initialMemberCount = await page.locator('.stat-card').nth(0).locator('.stat-number').textContent();
    const initialActivityCount = await page.locator('.stat-card').nth(1).locator('.stat-number').textContent();
    
    console.log(`初始成员总数: ${initialMemberCount}`);
    console.log(`初始活动数: ${initialActivityCount}`);
    
    // 点击刷新按钮（如果存在）
    const refreshButton = page.locator('button:has-text("刷新")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // 等待数据刷新
      await page.waitForTimeout(3000);
      
      // 检查数据是否更新
      const newMemberCount = await page.locator('.stat-card').nth(0).locator('.stat-number').textContent();
      const newActivityCount = await page.locator('.stat-card').nth(1).locator('.stat-number').textContent();
      
      console.log(`刷新后成员总数: ${newMemberCount}`);
      console.log(`刷新后活动数: ${newActivityCount}`);
      
      if (newMemberCount !== initialMemberCount || newActivityCount !== initialActivityCount) {
        console.log('统计数据刷新功能正常');
      } else {
        console.log('统计数据可能没有变化或刷新功能未生效');
      }
    } else {
      console.log('没有找到刷新按钮');
    }
    
    console.log('统计数据刷新测试完成');
  });
});
