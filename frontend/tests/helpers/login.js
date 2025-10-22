/**
 * 登录辅助函数
 * @param {import('@playwright/test').Page} page 
 * @param {string} username 
 * @param {string} password 
 */
async function login(page, username = 'admin', password = 'password') {
  // 启用控制台日志
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // 访问登录页面
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // 填写登录表单
  await page.fill('input[autocomplete="username"]', username);
  await page.fill('input[autocomplete="current-password"]', password);
  
  // 等待一下确保表单填写完成
  await page.waitForTimeout(1000);
  
  // 点击登录按钮
  await page.click('button:has-text("登录")');
  
  // 等待跳转到仪表盘
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
}

module.exports = { login };
