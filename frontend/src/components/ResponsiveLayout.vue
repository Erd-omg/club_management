<template>
  <div class="responsive-layout">
    <!-- 移动端顶部栏 -->
    <div class="mobile-header" v-if="isMobile">
      <div class="mobile-header-content">
        <div class="mobile-logo">
          <span class="logo-icon">CM</span>
          <span class="logo-text">社团管理系统</span>
        </div>
        <el-button 
          type="text" 
          @click="toggleSidebar"
          class="menu-toggle"
        >
          <i class="el-icon-menu"></i>
        </el-button>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div 
      class="sidebar-container" 
      :class="{ 
        'sidebar-mobile': isMobile, 
        'sidebar-collapsed': isMobile && !sidebarVisible 
      }"
    >
      <Sidebar 
        :collapsed="isMobile ? false : collapsed" 
        @toggle="toggleSidebar"
      />
    </div>

    <!-- 主内容区域 -->
    <div 
      class="main-content" 
      :class="{ 
        'main-mobile': isMobile,
        'main-collapsed': !isMobile && collapsed 
      }"
    >
      <!-- 移动端遮罩层 -->
      <div 
        v-if="isMobile && sidebarVisible" 
        class="mobile-overlay"
        @click="closeSidebar"
      ></div>
      
      <!-- 页面内容 -->
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue';

export default {
  name: 'ResponsiveLayout',
  components: {
    Sidebar
  },
  data() {
    return {
      collapsed: false,
      sidebarVisible: false,
      isMobile: false,
      windowWidth: window.innerWidth
    };
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    checkScreenSize() {
      this.windowWidth = window.innerWidth;
      this.isMobile = this.windowWidth < 768;
      
      if (this.isMobile) {
        this.sidebarVisible = false;
      }
    },
    handleResize() {
      this.checkScreenSize();
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.sidebarVisible = !this.sidebarVisible;
      } else {
        this.collapsed = !this.collapsed;
      }
    },
    closeSidebar() {
      if (this.isMobile) {
        this.sidebarVisible = false;
      }
    }
  }
};
</script>

<style scoped>
.responsive-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 移动端顶部栏 */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  z-index: 1001;
  display: none;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.mobile-logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #4167b1;
  color: #fff;
  border-radius: 6px;
  margin-right: 8px;
  font-weight: 600;
}

.logo-text {
  color: #4167b1;
  font-weight: 600;
  font-size: 16px;
}

.menu-toggle {
  font-size: 20px;
  color: #333;
}

/* 侧边栏 */
.sidebar-container {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sidebar-mobile {
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transform: translateX(-100%);
}

.sidebar-mobile.sidebar-collapsed {
  transform: translateX(0);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  overflow: hidden;
}

.main-mobile {
  margin-left: 0;
  padding-top: 56px;
}

.main-collapsed {
  margin-left: 0;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 响应式断点 */
@media (max-width: 768px) {
  .mobile-header {
    display: block;
  }
  
  .sidebar-container:not(.sidebar-mobile) {
    display: none;
  }
  
  .main-content {
    margin-left: 0 !important;
  }
}

@media (min-width: 769px) {
  .mobile-header {
    display: none;
  }
  
  .sidebar-mobile {
    position: static;
    transform: none;
  }
  
  .main-mobile {
    padding-top: 0;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .content-wrapper {
    padding: 16px;
  }
}

/* 大屏优化 */
@media (min-width: 1200px) {
  .content-wrapper {
    padding: 24px;
  }
}
</style>
