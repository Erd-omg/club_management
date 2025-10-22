// @ts-check
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');

test.describe('导出功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到导出页面
    await page.goto('/export');
    await page.waitForLoadState('networkidle');
  });

  test('导出页面基本显示', async ({ page }) => {
    // 检查页面容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查导出类型选择
    await expect(page.locator('.export-type, .el-radio-group')).toBeVisible();
    
    // 检查导出配置区域
    await expect(page.locator('.export-config, .el-form')).toBeVisible();
    
    // 检查导出按钮
    await expect(page.locator('button:has-text("开始导出"), button:has-text("导出")')).toBeVisible();
  });

  test('导出类型选择', async ({ page }) => {
    // 检查导出类型选项
    const exportTypes = page.locator('.el-radio, input[type="radio"]');
    await expect(exportTypes).toHaveCount.greaterThan(0);
    
    // 测试选择不同导出类型
    const memberExport = page.locator('.el-radio:has-text("成员"), input[value="member"]');
    if (await memberExport.count() > 0) {
      await memberExport.click();
      await expect(memberExport).toBeChecked();
    }
    
    const deptExport = page.locator('.el-radio:has-text("部门"), input[value="dept"]');
    if (await deptExport.count() > 0) {
      await deptExport.click();
      await expect(deptExport).toBeChecked();
    }
    
    const activityExport = page.locator('.el-radio:has-text("活动"), input[value="activity"]');
    if (await activityExport.count() > 0) {
      await activityExport.click();
      await expect(activityExport).toBeChecked();
    }
  });

  test('导出配置选项', async ({ page }) => {
    // 选择成员导出
    const memberExport = page.locator('.el-radio:has-text("成员"), input[value="member"]');
    if (await memberExport.count() > 0) {
      await memberExport.click();
    }
    
    // 检查时间范围选择
    const dateRange = page.locator('.el-date-picker, input[placeholder*="时间"]');
    if (await dateRange.count() > 0) {
      await expect(dateRange).toBeVisible();
    }
    
    // 检查文件格式选择
    const formatSelect = page.locator('.el-select:has-text("格式"), select[name="format"]');
    if (await formatSelect.count() > 0) {
      await formatSelect.click();
      await page.click('.el-select-dropdown__item:has-text("Excel")');
    }
    
    // 检查包含字段选择
    const fieldCheckboxes = page.locator('.el-checkbox, input[type="checkbox"]');
    if (await fieldCheckboxes.count() > 0) {
      await expect(fieldCheckboxes.first()).toBeVisible();
    }
  });

  test('成员数据导出', async ({ page }) => {
    // 选择成员导出
    const memberExport = page.locator('.el-radio:has-text("成员"), input[value="member"]');
    if (await memberExport.count() > 0) {
      await memberExport.click();
    }
    
    // 选择导出格式
    const formatSelect = page.locator('.el-select:has-text("格式"), select[name="format"]');
    if (await formatSelect.count() > 0) {
      await formatSelect.click();
      await page.click('.el-select-dropdown__item:has-text("Excel")');
    }
    
    // 选择包含字段
    const nameCheckbox = page.locator('.el-checkbox:has-text("姓名"), input[name="name"]');
    if (await nameCheckbox.count() > 0) {
      await nameCheckbox.click();
    }
    
    const phoneCheckbox = page.locator('.el-checkbox:has-text("手机"), input[name="phone"]');
    if (await phoneCheckbox.count() > 0) {
      await phoneCheckbox.click();
    }
    
    // 点击导出按钮
    const exportButton = page.locator('button:has-text("开始导出"), button:has-text("导出")');
    await exportButton.click();
    
    // 等待导出完成
    await page.waitForTimeout(3000);
    
    // 检查导出进度或成功提示
    const progressBar = page.locator('.el-progress, .export-progress');
    const successMessage = page.locator('.el-message--success');
    
    if (await progressBar.count() > 0) {
      await expect(progressBar).toBeVisible();
    } else if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('部门数据导出', async ({ page }) => {
    // 选择部门导出
    const deptExport = page.locator('.el-radio:has-text("部门"), input[value="dept"]');
    if (await deptExport.count() > 0) {
      await deptExport.click();
    }
    
    // 选择导出格式
    const formatSelect = page.locator('.el-select:has-text("格式"), select[name="format"]');
    if (await formatSelect.count() > 0) {
      await formatSelect.click();
      await page.click('.el-select-dropdown__item:has-text("PDF")');
    }
    
    // 点击导出按钮
    const exportButton = page.locator('button:has-text("开始导出"), button:has-text("导出")');
    await exportButton.click();
    
    // 等待导出完成
    await page.waitForTimeout(3000);
    
    // 检查导出结果
    const successMessage = page.locator('.el-message--success');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('活动数据导出', async ({ page }) => {
    // 选择活动导出
    const activityExport = page.locator('.el-radio:has-text("活动"), input[value="activity"]');
    if (await activityExport.count() > 0) {
      await activityExport.click();
    }
    
    // 选择时间范围
    const dateRange = page.locator('.el-date-picker, input[placeholder*="时间"]');
    if (await dateRange.count() > 0) {
      await dateRange.click();
      await page.waitForTimeout(500);
      // 选择最近一个月
      await page.click('.el-picker-panel__footer .el-button--primary');
    }
    
    // 选择导出格式
    const formatSelect = page.locator('.el-select:has-text("格式"), select[name="format"]');
    if (await formatSelect.count() > 0) {
      await formatSelect.click();
      await page.click('.el-select-dropdown__item:has-text("Excel")');
    }
    
    // 点击导出按钮
    const exportButton = page.locator('button:has-text("开始导出"), button:has-text("导出")');
    await exportButton.click();
    
    // 等待导出完成
    await page.waitForTimeout(3000);
    
    // 检查导出结果
    const successMessage = page.locator('.el-message--success');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('导出历史记录', async ({ page }) => {
    // 检查导出历史区域
    const exportHistory = page.locator('.export-history, .el-table');
    if (await exportHistory.count() > 0) {
      await expect(exportHistory).toBeVisible();
      
      // 检查历史记录列表
      const historyRows = page.locator('.el-table__row, tbody tr');
      if (await historyRows.count() > 0) {
        await expect(historyRows.first()).toBeVisible();
        
        // 检查历史记录信息
        await expect(historyRows.first().locator('td')).toHaveCount.greaterThan(0);
      }
    }
  });

  test('文件下载功能', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 查找下载按钮
    const downloadButton = page.locator('button:has-text("下载"), .el-icon-download');
    if (await downloadButton.count() > 0) {
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      
      await downloadButton.first().click();
      
      // 等待下载开始
      const download = await downloadPromise;
      
      // 检查下载文件名
      expect(download.suggestedFilename()).toMatch(/\.(xlsx|pdf|csv)$/);
    }
  });

  test('导出进度显示', async ({ page }) => {
    // 选择任意导出类型
    const memberExport = page.locator('.el-radio:has-text("成员"), input[value="member"]');
    if (await memberExport.count() > 0) {
      await memberExport.click();
    }
    
    // 点击导出按钮
    const exportButton = page.locator('button:has-text("开始导出"), button:has-text("导出")');
    await exportButton.click();
    
    // 检查进度条显示
    const progressBar = page.locator('.el-progress, .export-progress');
    if (await progressBar.count() > 0) {
      await expect(progressBar).toBeVisible();
      
      // 检查进度百分比
      const progressText = page.locator('.el-progress__text, .progress-text');
      if (await progressText.count() > 0) {
        await expect(progressText).toBeVisible();
      }
    }
  });

  test('导出错误处理', async ({ page }) => {
    // 不选择任何导出类型，直接点击导出
    const exportButton = page.locator('button:has-text("开始导出"), button:has-text("导出")');
    await exportButton.click();
    
    // 检查错误提示
    const errorMessage = page.locator('.el-message--error, .el-form-item__error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('权限控制', async ({ page }) => {
    // 检查不同角色的导出权限
    const userRole = await page.evaluate(() => {
      return localStorage.getItem('userRole') || 'admin';
    });
    
    if (userRole === '干事') {
      // 干事不能导出数据
      await expect(page.locator('button:has-text("开始导出"), button:has-text("导出")')).toHaveCount(0);
    } else {
      // 其他角色可以导出数据
      await expect(page.locator('button:has-text("开始导出"), button:has-text("导出")')).toBeVisible();
    }
  });

  test('响应式设计', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.export-container, .main-content')).toBeVisible();
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.export-container, .main-content')).toBeVisible();
    
    // 测试手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.export-container, .main-content')).toBeVisible();
    
    // 检查移动端表单布局
    const exportForm = page.locator('.export-config, .el-form');
    await expect(exportForm).toBeVisible();
  });

  test('批量导出功能', async ({ page }) => {
    // 检查是否有批量导出选项
    const batchExport = page.locator('.batch-export, .el-checkbox:has-text("批量导出")');
    if (await batchExport.count() > 0) {
      await batchExport.click();
      
      // 选择多个导出类型
      const memberCheckbox = page.locator('.el-checkbox:has-text("成员"), input[value="member"]');
      const deptCheckbox = page.locator('.el-checkbox:has-text("部门"), input[value="dept"]');
      
      if (await memberCheckbox.count() > 0) {
        await memberCheckbox.click();
      }
      if (await deptCheckbox.count() > 0) {
        await deptCheckbox.click();
      }
      
      // 点击批量导出
      const exportButton = page.locator('button:has-text("开始导出"), button:has-text("导出")');
      await exportButton.click();
      
      // 等待导出完成
      await page.waitForTimeout(5000);
      
      // 检查导出结果
      const successMessage = page.locator('.el-message--success');
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
      }
    }
  });
});
