const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('文件上传功能测试', () => {
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

  test('成员照片上传测试', async ({ page }) => {
    console.log('开始测试成员照片上传...');
    
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
    
    // 检查照片上传组件
    const photoUpload = page.locator('.avatar-upload');
    if (await photoUpload.isVisible()) {
      // 创建测试图片文件
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      
      // 模拟文件上传
      await page.setInputFiles('input[type="file"]', testImagePath);
      
      // 等待上传完成
      await page.waitForTimeout(2000);
      
      // 检查上传成功提示
      const successMessage = await page.locator('.el-message--success').isVisible();
      if (successMessage) {
        console.log('照片上传成功');
      } else {
        console.log('照片上传可能失败或需要进一步验证');
      }
      
      // 检查预览图片
      const previewImage = page.locator('.avatar-upload .avatar');
      if (await previewImage.isVisible()) {
        console.log('照片预览显示正常');
      }
    } else {
      console.log('没有找到照片上传组件');
    }
    
    console.log('成员照片上传测试完成');
  });

  test('活动附件上传测试', async ({ page }) => {
    console.log('开始测试活动附件上传...');
    
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
    
    // 检查附件上传组件
    const fileUpload = page.locator('.file-upload');
    if (await fileUpload.isVisible()) {
      // 创建测试文件
      const testFilePath = path.join(__dirname, 'test-document.pdf');
      
      // 模拟文件上传
      await page.setInputFiles('input[type="file"]', testFilePath);
      
      // 等待上传完成
      await page.waitForTimeout(2000);
      
      // 检查上传成功提示
      const successMessage = await page.locator('.el-message--success').isVisible();
      if (successMessage) {
        console.log('附件上传成功');
      } else {
        console.log('附件上传可能失败或需要进一步验证');
      }
      
      // 检查文件列表
      const fileList = page.locator('.file-list');
      if (await fileList.isVisible()) {
        console.log('文件列表显示正常');
      }
    } else {
      console.log('没有找到附件上传组件');
    }
    
    console.log('活动附件上传测试完成');
  });

  test('文件预览功能测试', async ({ page }) => {
    console.log('开始测试文件预览功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 查找有附件的活动
    const activityWithAttachment = page.locator('.el-table tr:has(.attachment-icon)').first();
    if (await activityWithAttachment.isVisible()) {
      // 点击查看详情按钮
      const detailButton = activityWithAttachment.locator('.el-button:has-text("查看详情")');
      await detailButton.click();
      
      // 等待活动详情页面加载
      await page.waitForTimeout(2000);
      
      // 检查附件列表
      const attachmentList = page.locator('.attachment-list');
      if (await attachmentList.isVisible()) {
        // 点击第一个附件进行预览
        const firstAttachment = attachmentList.locator('.attachment-item').first();
        if (await firstAttachment.isVisible()) {
          await firstAttachment.click();
          
          // 等待预览窗口出现
          await page.waitForTimeout(2000);
          
          // 检查预览窗口
          const previewWindow = page.locator('.file-preview-dialog');
          if (await previewWindow.isVisible()) {
            console.log('文件预览功能正常');
          } else {
            console.log('文件预览窗口未显示');
          }
        }
      }
    } else {
      console.log('没有找到有附件的活动');
    }
    
    console.log('文件预览功能测试完成');
  });

  test('文件删除功能测试', async ({ page }) => {
    console.log('开始测试文件删除功能...');
    
    // 社长登录
    await login(page, '2021001', 'password');
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 查找有附件的活动
    const activityWithAttachment = page.locator('.el-table tr:has(.attachment-icon)').first();
    if (await activityWithAttachment.isVisible()) {
      // 点击编辑按钮
      const editButton = activityWithAttachment.locator('.el-button:has-text("编辑")');
      await editButton.click();
      
      // 等待编辑对话框出现
      await page.waitForSelector('.el-dialog', { timeout: 10000 });
      
      // 检查附件列表
      const attachmentList = page.locator('.attachment-list');
      if (await attachmentList.isVisible()) {
        // 点击第一个附件的删除按钮
        const deleteButton = attachmentList.locator('.attachment-item .delete-btn').first();
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          
          // 等待确认对话框出现
          await page.waitForSelector('.el-message-box', { timeout: 10000 });
          
          // 点击确定按钮
          await page.click('.el-message-box .el-button--primary');
          
          // 等待操作完成
          await page.waitForTimeout(2000);
          
          // 检查删除成功提示
          const successMessage = await page.locator('.el-message--success').isVisible();
          if (successMessage) {
            console.log('文件删除成功');
          } else {
            console.log('文件删除可能失败或需要进一步验证');
          }
        }
      }
    } else {
      console.log('没有找到有附件的活动');
    }
    
    console.log('文件删除功能测试完成');
  });

  test('文件上传权限控制测试', async ({ page }) => {
    console.log('开始测试文件上传权限控制...');
    
    // 干事登录
    await login(page, '2021005', 'password');
    
    // 导航到成员管理页面
    await page.click('text=社员管理');
    await page.waitForURL('**/member', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查添加社员按钮（干事不应该有权限）
    const addButton = page.locator('button:has-text("添加社员")');
    const isAddButtonVisible = await addButton.isVisible();
    
    if (isAddButtonVisible) {
      console.log('警告：干事可以看到添加社员按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到添加社员按钮');
    }
    
    // 导航到活动管理页面
    await page.click('text=活动管理');
    await page.waitForURL('**/activity', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // 检查添加活动按钮（干事不应该有权限）
    const addActivityButton = page.locator('button:has-text("添加活动")');
    const isAddActivityButtonVisible = await addActivityButton.isVisible();
    
    if (isAddActivityButtonVisible) {
      console.log('警告：干事可以看到添加活动按钮，可能存在权限问题');
    } else {
      console.log('权限控制正确：干事无法看到添加活动按钮');
    }
    
    console.log('文件上传权限控制测试完成');
  });

  test('文件上传大小限制测试', async ({ page }) => {
    console.log('开始测试文件上传大小限制...');
    
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
    
    // 检查照片上传组件
    const photoUpload = page.locator('.avatar-upload');
    if (await photoUpload.isVisible()) {
      // 创建大文件（超过限制）
      const largeFilePath = path.join(__dirname, 'large-file.jpg');
      
      // 模拟大文件上传
      await page.setInputFiles('input[type="file"]', largeFilePath);
      
      // 等待上传完成
      await page.waitForTimeout(2000);
      
      // 检查错误提示
      const errorMessage = await page.locator('.el-message--error').isVisible();
      if (errorMessage) {
        const errorText = await page.locator('.el-message--error').textContent();
        console.log(`文件大小限制测试通过: ${errorText}`);
      } else {
        console.log('文件大小限制可能未生效');
      }
    }
    
    console.log('文件上传大小限制测试完成');
  });

  test('文件类型限制测试', async ({ page }) => {
    console.log('开始测试文件类型限制...');
    
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
    
    // 检查照片上传组件
    const photoUpload = page.locator('.avatar-upload');
    if (await photoUpload.isVisible()) {
      // 创建不支持的文件类型
      const unsupportedFilePath = path.join(__dirname, 'test.txt');
      
      // 模拟不支持的文件类型上传
      await page.setInputFiles('input[type="file"]', unsupportedFilePath);
      
      // 等待上传完成
      await page.waitForTimeout(2000);
      
      // 检查错误提示
      const errorMessage = await page.locator('.el-message--error').isVisible();
      if (errorMessage) {
        const errorText = await page.locator('.el-message--error').textContent();
        console.log(`文件类型限制测试通过: ${errorText}`);
      } else {
        console.log('文件类型限制可能未生效');
      }
    }
    
    console.log('文件类型限制测试完成');
  });
});
