// @ts-check
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');

test.describe('个人中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 导航到个人中心
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('个人中心页面基本显示', async ({ page }) => {
    // 检查页面容器
    await expect(page.locator('.app-container')).toBeVisible();
    
    // 检查个人信息区域
    await expect(page.locator('.profile-info, .el-card')).toBeVisible();
    
    // 检查头像区域
    await expect(page.locator('.avatar-container, .el-avatar')).toBeVisible();
    
    // 检查编辑按钮
    await expect(page.locator('button:has-text("编辑"), button:has-text("修改")')).toBeVisible();
  });

  test('个人信息显示', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 检查个人信息字段
    await expect(page.locator('.user-name, .name-field')).toBeVisible();
    await expect(page.locator('.user-role, .role-field')).toBeVisible();
    await expect(page.locator('.user-dept, .dept-field')).toBeVisible();
    await expect(page.locator('.user-phone, .phone-field')).toBeVisible();
    await expect(page.locator('.user-email, .email-field')).toBeVisible();
    
    // 检查头像显示
    const avatar = page.locator('.el-avatar, .avatar-img');
    if (await avatar.count() > 0) {
      await expect(avatar).toBeVisible();
    }
  });

  test('编辑个人信息', async ({ page }) => {
    // 点击编辑按钮
    const editButton = page.locator('button:has-text("编辑"), button:has-text("修改")');
    await editButton.click();
    
    // 等待编辑对话框打开
    await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
    
    // 修改姓名
    const nameInput = page.locator('input[placeholder*="姓名"], input[name="name"]');
    if (await nameInput.count() > 0) {
      await nameInput.clear();
      await nameInput.fill('修改后的姓名');
    }
    
    // 修改手机号
    const phoneInput = page.locator('input[placeholder*="手机"], input[name="phone"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.clear();
      await phoneInput.fill('13800138001');
    }
    
    // 修改邮箱
    const emailInput = page.locator('input[placeholder*="邮箱"], input[name="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.clear();
      await emailInput.fill('newemail@example.com');
    }
    
    // 提交修改
    const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
    await submitButton.click();
    
    // 等待操作完成
    await page.waitForTimeout(2000);
    
    // 检查成功提示
    await expect(page.locator('.el-message--success')).toBeVisible();
  });

  test('头像上传功能', async ({ page }) => {
    // 查找头像上传区域
    const avatarUpload = page.locator('.avatar-upload, .el-upload');
    if (await avatarUpload.count() > 0) {
      await expect(avatarUpload).toBeVisible();
      
      // 点击上传按钮
      const uploadButton = avatarUpload.locator('button:has-text("上传"), .el-upload__input');
      if (await uploadButton.count() > 0) {
        await uploadButton.click();
        
        // 等待上传对话框
        await page.waitForTimeout(1000);
      }
    }
  });

  test('密码修改功能', async ({ page }) => {
    // 查找密码修改按钮
    const changePasswordButton = page.locator('button:has-text("修改密码"), button:has-text("更改密码")');
    if (await changePasswordButton.count() > 0) {
      await changePasswordButton.click();
      
      // 等待密码修改对话框打开
      await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
      
      // 输入原密码
      const oldPasswordInput = page.locator('input[placeholder*="原密码"], input[name="oldPassword"]');
      if (await oldPasswordInput.count() > 0) {
        await oldPasswordInput.fill('123456');
      }
      
      // 输入新密码
      const newPasswordInput = page.locator('input[placeholder*="新密码"], input[name="newPassword"]');
      if (await newPasswordInput.count() > 0) {
        await newPasswordInput.fill('newpassword123');
      }
      
      // 确认新密码
      const confirmPasswordInput = page.locator('input[placeholder*="确认密码"], input[name="confirmPassword"]');
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill('newpassword123');
      }
      
      // 提交修改
      const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
      await submitButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查成功提示
      await expect(page.locator('.el-message--success')).toBeVisible();
    }
  });

  test('密码修改验证', async ({ page }) => {
    // 查找密码修改按钮
    const changePasswordButton = page.locator('button:has-text("修改密码"), button:has-text("更改密码")');
    if (await changePasswordButton.count() > 0) {
      await changePasswordButton.click();
      
      // 等待密码修改对话框打开
      await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
      
      // 输入错误的原密码
      const oldPasswordInput = page.locator('input[placeholder*="原密码"], input[name="oldPassword"]');
      if (await oldPasswordInput.count() > 0) {
        await oldPasswordInput.fill('wrongpassword');
      }
      
      // 输入新密码
      const newPasswordInput = page.locator('input[placeholder*="新密码"], input[name="newPassword"]');
      if (await newPasswordInput.count() > 0) {
        await newPasswordInput.fill('newpassword123');
      }
      
      // 确认新密码
      const confirmPasswordInput = page.locator('input[placeholder*="确认密码"], input[name="confirmPassword"]');
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill('newpassword123');
      }
      
      // 提交修改
      const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
      await submitButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查错误提示
      await expect(page.locator('.el-message--error')).toBeVisible();
    }
  });

  test('密码确认不匹配', async ({ page }) => {
    // 查找密码修改按钮
    const changePasswordButton = page.locator('button:has-text("修改密码"), button:has-text("更改密码")');
    if (await changePasswordButton.count() > 0) {
      await changePasswordButton.click();
      
      // 等待密码修改对话框打开
      await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
      
      // 输入原密码
      const oldPasswordInput = page.locator('input[placeholder*="原密码"], input[name="oldPassword"]');
      if (await oldPasswordInput.count() > 0) {
        await oldPasswordInput.fill('123456');
      }
      
      // 输入新密码
      const newPasswordInput = page.locator('input[placeholder*="新密码"], input[name="newPassword"]');
      if (await newPasswordInput.count() > 0) {
        await newPasswordInput.fill('newpassword123');
      }
      
      // 输入不匹配的确认密码
      const confirmPasswordInput = page.locator('input[placeholder*="确认密码"], input[name="confirmPassword"]');
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill('differentpassword');
      }
      
      // 提交修改
      const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
      await submitButton.click();
      
      // 等待操作完成
      await page.waitForTimeout(2000);
      
      // 检查错误提示
      await expect(page.locator('.el-message--error, .el-form-item__error')).toBeVisible();
    }
  });

  test('表单验证', async ({ page }) => {
    // 点击编辑按钮
    const editButton = page.locator('button:has-text("编辑"), button:has-text("修改")');
    await editButton.click();
    
    // 等待编辑对话框打开
    await expect(page.locator('.el-dialog, .el-drawer')).toBeVisible();
    
    // 清空必填字段
    const nameInput = page.locator('input[placeholder*="姓名"], input[name="name"]');
    if (await nameInput.count() > 0) {
      await nameInput.clear();
    }
    
    // 提交表单
    const submitButton = page.locator('.el-dialog button:has-text("确定"), .el-dialog button:has-text("保存")');
    await submitButton.click();
    
    // 检查验证错误
    await expect(page.locator('.el-form-item__error')).toBeVisible();
  });

  test('退出登录功能', async ({ page }) => {
    // 查找退出登录按钮
    const logoutButton = page.locator('button:has-text("退出"), button:has-text("登出")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // 等待确认对话框
      await expect(page.locator('.el-message-box, .el-dialog')).toBeVisible();
      
      // 确认退出
      const confirmButton = page.locator('.el-message-box button:has-text("确定"), .el-dialog button:has-text("确定")');
      await confirmButton.click();
      
      // 等待跳转到登录页面
      await page.waitForURL('**/login', { timeout: 5000 });
      
      // 检查是否在登录页面
      await expect(page.locator('h1')).toContainText('社团管理系统');
    }
  });

  test('权限控制', async ({ page }) => {
    // 检查不同角色的编辑权限
    const userRole = await page.evaluate(() => {
      return localStorage.getItem('userRole') || 'admin';
    });
    
    // 所有角色都应该能查看和编辑自己的信息
    await expect(page.locator('button:has-text("编辑"), button:has-text("修改")')).toBeVisible();
    
    // 检查部门角色字段是否只读
    const deptField = page.locator('.user-dept, .dept-field');
    if (await deptField.count() > 0) {
      // 部门字段应该是只读的
      const deptInput = deptField.locator('input');
      if (await deptInput.count() > 0) {
        await expect(deptInput).toBeDisabled();
      }
    }
    
    // 检查角色字段是否只读
    const roleField = page.locator('.user-role, .role-field');
    if (await roleField.count() > 0) {
      // 角色字段应该是只读的
      const roleInput = roleField.locator('input');
      if (await roleInput.count() > 0) {
        await expect(roleInput).toBeDisabled();
      }
    }
  });

  test('响应式设计', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.profile-container, .main-content')).toBeVisible();
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.profile-container, .main-content')).toBeVisible();
    
    // 测试手机端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.profile-container, .main-content')).toBeVisible();
    
    // 检查移动端头像显示
    const avatar = page.locator('.el-avatar, .avatar-img');
    if (await avatar.count() > 0) {
      await expect(avatar).toBeVisible();
    }
  });

  test('个人信息完整性', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 检查所有必要信息是否显示
    const profileInfo = page.locator('.profile-info, .el-card');
    await expect(profileInfo).toBeVisible();
    
    // 检查用户基本信息
    const userInfo = page.locator('.user-info, .profile-details');
    if (await userInfo.count() > 0) {
      await expect(userInfo).toBeVisible();
      
      // 检查是否有用户ID或学号
      const userId = page.locator('.user-id, .stu-id');
      if (await userId.count() > 0) {
        await expect(userId).toBeVisible();
      }
      
      // 检查加入时间
      const joinDate = page.locator('.join-date, .join-time');
      if (await joinDate.count() > 0) {
        await expect(joinDate).toBeVisible();
      }
    }
  });

  test('头像预览功能', async ({ page }) => {
    // 检查头像预览
    const avatar = page.locator('.el-avatar, .avatar-img');
    if (await avatar.count() > 0) {
      await expect(avatar).toBeVisible();
      
      // 点击头像查看大图
      await avatar.click();
      
      // 等待预览对话框
      const previewDialog = page.locator('.el-dialog, .avatar-preview');
      if (await previewDialog.count() > 0) {
        await expect(previewDialog).toBeVisible();
        
        // 关闭预览
        const closeButton = page.locator('.el-dialog__close, button:has-text("关闭")');
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      }
    }
  });
});
