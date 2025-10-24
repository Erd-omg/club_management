<template>
  <el-aside :width="collapsed ? '64px' : '200px'" class="aside">
    <div class="logo" @click="$router.push('/dashboard')">
      <span class="logo-icon">CM</span>
      <span v-if="!collapsed" class="logo-text">社团管理系统</span>
    </div>
    <el-menu
      :default-active="$route.path"
      class="el-menu-vertical-demo"
      router
      background-color="#ffffff"
      text-color="#333"
      active-text-color="#4167b1"
    >
      <el-menu-item index="/dashboard">
        <i class="el-icon-menu"></i>
        <span slot="title">仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/dept" v-if="canManageDepts">
        <i class="el-icon-s-management"></i>
        <span slot="title">部门管理</span>
      </el-menu-item>
      <el-menu-item index="/member" v-if="canEditMembers">
        <i class="el-icon-user"></i>
        <span slot="title">社员管理</span>
      </el-menu-item>
      <el-menu-item index="/activity">
        <i class="el-icon-date"></i>
        <span slot="title">活动管理</span>
      </el-menu-item>
      <el-menu-item index="/profile">
        <i class="el-icon-setting"></i>
        <span slot="title">个人中心</span>
      </el-menu-item>
      <el-menu-item index="/export" v-if="canExportData">
        <i class="el-icon-download"></i>
        <span slot="title">数据导出</span>
      </el-menu-item>
    </el-menu>
    
    <!-- 用户信息区域 -->
    <div class="user-info" v-if="!collapsed && user">
      <div class="user-avatar">
        <i class="el-icon-user-solid"></i>
      </div>
      <div class="user-details">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-role">{{ user.role }}</div>
      </div>
      <el-button type="text" @click="logout" class="logout-btn">
        <i class="el-icon-switch-button"></i>
      </el-button>
    </div>
  </el-aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: { collapsed: { type: Boolean, default: false } },
  data() {
    return {};
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    canManageDepts() {
      return this.$store.getters.canManageDepts;
    },
    canEditMembers() {
      return this.$store.getters.canEditMembers;
    },
    canExportData() {
      return this.$store.getters.canExportData;
    }
  },
  methods: {
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout');
        this.$router.push('/login');
        this.$message.success('已退出登录');
      }).catch(() => {});
    }
  }
};
</script>

<style lang="scss" scoped>
.aside { 
  background: #fff; 
  border-right: 1px solid #eee; 
  min-height: 100vh; 
  display: flex;
  flex-direction: column;
}
.logo { 
  height: 56px; 
  display:flex; 
  align-items:center; 
  padding: 0 12px; 
  cursor: pointer; 
  border-bottom: 1px solid #f0f0f0;
}
.logo-icon { 
  display:inline-flex; 
  align-items:center; 
  justify-content:center; 
  width:28px; 
  height:28px; 
  background:#4167b1; 
  color:#fff; 
  border-radius:6px; 
  margin-right:8px; 
  font-weight:600; 
}
.logo-text { 
  color:#4167b1; 
  font-weight:600; 
}

.user-info {
  margin-top: auto;
  padding: 16px 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  background: #fafafa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4167b1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.logout-btn {
  color: #999;
  padding: 4px;
  margin-left: 8px;
}

.logout-btn:hover {
  color: #f56c6c;
}

</style>
