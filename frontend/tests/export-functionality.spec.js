const { test, expect } = require('@playwright/test');

test.describe('导出功能测试', () => {
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

  test('Excel导出功能测试', async ({ page }) => {
    console.log('开始测试Excel导出功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到导出页面
    await page.click('text=数据导出');
    await page.waitForURL('**/export', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查导出页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查导出表单
    await expect(page.locator('.export-form')).toBeVisible();
    
    // 选择导出类型
    const typeCheckboxes = page.locator('.export-form input[type="checkbox"]');
    const typeCount = await typeCheckboxes.count();
    
    for (let i = 0; i < Math.min(typeCount, 3); i++) {
      await typeCheckboxes.nth(i).check();
    }
    
    // 选择导出格式为Excel
    await page.click('.el-radio:has-text("Excel")');
    
    // 设置导出时间范围
    const startDateInput = page.locator('input[placeholder*="开始日期"]');
    const endDateInput = page.locator('input[placeholder*="结束日期"]');
    
    if (await startDateInput.isVisible()) {
      await startDateInput.click();
      await page.click('.el-picker-panel__today-btn');
    }
    
    if (await endDateInput.isVisible()) {
      await endDateInput.click();
      await page.click('.el-picker-panel__today-btn');
    }
    
    // 点击生成导出包按钮
    await page.click('button:has-text("生成导出包")');
    
    // 等待导出完成
    await page.waitForTimeout(5000);
    
    // 检查导出状态
    const exportStatus = page.locator('.export-status');
    if (await exportStatus.isVisible()) {
      const statusText = await exportStatus.textContent();
      console.log(`导出状态: ${statusText}`);
    }
    
    // 检查下载按钮
    const downloadButton = page.locator('button:has-text("下载")');
    if (await downloadButton.isVisible()) {
      console.log('Excel导出功能正常，可以下载');
    } else {
      console.log('Excel导出可能失败或仍在处理中');
    }
    
    console.log('Excel导出功能测试完成');
  });

  test('PDF导出功能测试', async ({ page }) => {
    console.log('开始测试PDF导出功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到导出页面
    await page.click('text=数据导出');
    await page.waitForURL('**/export', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查导出页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查导出表单
    await expect(page.locator('.export-form')).toBeVisible();
    
    // 选择导出类型
    const typeCheckboxes = page.locator('.export-form input[type="checkbox"]');
    const typeCount = await typeCheckboxes.count();
    
    for (let i = 0; i < Math.min(typeCount, 3); i++) {
      await typeCheckboxes.nth(i).check();
    }
    
    // 选择导出格式为PDF
    await page.click('.el-radio:has-text("PDF")');
    
    // 设置导出时间范围
    const startDateInput = page.locator('input[placeholder*="开始日期"]');
    const endDateInput = page.locator('input[placeholder*="结束日期"]');
    
    if (await startDateInput.isVisible()) {
      await startDateInput.click();
      await page.click('.el-picker-panel__today-btn');
    }
    
    if (await endDateInput.isVisible()) {
      await endDateInput.click();
      await page.click('.el-picker-panel__today-btn');
    }
    
    // 点击生成导出包按钮
    await page.click('button:has-text("生成导出包")');
    
    // 等待导出完成
    await page.waitForTimeout(5000);
    
    // 检查导出状态
    const exportStatus = page.locator('.export-status');
    if (await exportStatus.isVisible()) {
      const statusText = await exportStatus.textContent();
      console.log(`导出状态: ${statusText}`);
    }
    
    // 检查下载按钮
    const downloadButton = page.locator('button:has-text("下载")');
    if (await downloadButton.isVisible()) {
      console.log('PDF导出功能正常，可以下载');
    } else {
      console.log('PDF导出可能失败或仍在处理中');
    }
    
    console.log('PDF导出功能测试完成');
  });

  test('导出历史查看测试', async ({ page }) => {
    console.log('开始测试导出历史查看...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到导出页面
    await page.click('text=数据导出');
    await page.waitForURL('**/export', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查导出页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 切换到导出历史标签
    const historyTab = page.locator('.el-tabs__item:has-text("导出历史")');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      
      // 等待历史列表加载
      await page.waitForTimeout(2000);
      
      // 检查历史列表
      const historyList = page.locator('.export-history-list');
      if (await historyList.isVisible()) {
        // 检查历史记录
        const historyItems = page.locator('.export-history-item');
        const itemCount = await historyItems.count();
        
        if (itemCount > 0) {
          console.log(`找到 ${itemCount} 条导出历史记录`);
          
          // 检查第一条记录
          const firstItem = historyItems.first();
          await expect(firstItem).toBeVisible();
          
          // 检查记录信息
          const fileName = firstItem.locator('.file-name');
          const exportTime = firstItem.locator('.export-time');
          const fileSize = firstItem.locator('.file-size');
          const status = firstItem.locator('.export-status');
          
          if (await fileName.isVisible()) {
            const nameText = await fileName.textContent();
            console.log(`文件名: ${nameText}`);
          }
          
          if (await exportTime.isVisible()) {
            const timeText = await exportTime.textContent();
            console.log(`导出时间: ${timeText}`);
          }
          
          if (await fileSize.isVisible()) {
            const sizeText = await fileSize.textContent();
            console.log(`文件大小: ${sizeText}`);
          }
          
          if (await status.isVisible()) {
            const statusText = await status.textContent();
            console.log(`状态: ${statusText}`);
          }
        } else {
          console.log('没有找到导出历史记录');
        }
      }
    } else {
      console.log('没有找到导出历史标签');
    }
    
    console.log('导出历史查看测试完成');
  });

  test('导出权限控制测试', async ({ page }) => {
    console.log('开始测试导出权限控制...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 检查是否能看到数据导出菜单
    const exportMenu = page.locator('text=数据导出');
    const isExportMenuVisible = await exportMenu.isVisible();
    
    if (isExportMenuVisible) {
      // 点击数据导出菜单
      await exportMenu.click();
      await page.waitForURL('**/export', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // 检查导出页面
      await expect(page.locator('.app-container')).toBeVisible();
      
      // 检查导出表单
      const exportForm = page.locator('.export-form');
      if (await exportForm.isVisible()) {
        // 检查生成导出包按钮
        const generateButton = page.locator('button:has-text("生成导出包")');
        const isGenerateButtonVisible = await generateButton.isVisible();
        
        if (isGenerateButtonVisible) {
          console.log('警告：干事可以看到生成导出包按钮，可能存在权限问题');
        } else {
          console.log('权限控制正确：干事无法看到生成导出包按钮');
        }
      }
    } else {
      console.log('权限控制正确：干事无法看到数据导出菜单');
    }
    
    console.log('导出权限控制测试完成');
  });

  test('导出文件下载测试', async ({ page }) => {
    console.log('开始测试导出文件下载...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到导出页面
    await page.click('text=数据导出');
    await page.waitForURL('**/export', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 切换到导出历史标签
    const historyTab = page.locator('.el-tabs__item:has-text("导出历史")');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      
      // 等待历史列表加载
      await page.waitForTimeout(2000);
      
      // 检查历史记录
      const historyItems = page.locator('.export-history-item');
      const itemCount = await historyItems.count();
      
      if (itemCount > 0) {
        // 点击第一条记录的下载按钮
        const downloadButton = historyItems.first().locator('button:has-text("下载")');
        if (await downloadButton.isVisible()) {
          // 设置下载监听
          const downloadPromise = page.waitForEvent('download');
          
          // 点击下载按钮
          await downloadButton.click();
          
          // 等待下载开始
          const download = await downloadPromise;
          
          console.log(`下载文件: ${download.suggestedFilename()}`);
          console.log('导出文件下载功能正常');
        } else {
          console.log('没有找到下载按钮');
        }
      } else {
        console.log('没有找到可下载的导出文件');
      }
    }
    
    console.log('导出文件下载测试完成');
  });

  test('导出进度显示测试', async ({ page }) => {
    console.log('开始测试导出进度显示...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到导出页面
    await page.click('text=数据导出');
    await page.waitForURL('**/export', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查导出页面
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 选择导出类型
    const typeCheckboxes = page.locator('.export-form input[type="checkbox"]');
    const typeCount = await typeCheckboxes.count();
    
    for (let i = 0; i < Math.min(typeCount, 3); i++) {
      await typeCheckboxes.nth(i).check();
    }
    
    // 选择导出格式
    await page.click('.el-radio:has-text("Excel")');
    
    // 点击生成导出包按钮
    await page.click('button:has-text("生成导出包")');
    
    // 检查进度条
    const progressBar = page.locator('.el-progress');
    if (await progressBar.isVisible()) {
      console.log('导出进度条显示正常');
      
      // 等待进度更新
      await page.waitForTimeout(3000);
      
      // 检查进度百分比
      const progressText = page.locator('.el-progress__text');
      if (await progressText.isVisible()) {
        const progressValue = await progressText.textContent();
        console.log(`当前进度: ${progressValue}`);
      }
    } else {
      console.log('没有找到导出进度条');
    }
    
    console.log('导出进度显示测试完成');
  });
});
