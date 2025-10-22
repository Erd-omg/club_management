<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">社团管理系统</h2>
      <el-form :model="form" @submit.native.prevent="onSubmit">
        <el-form-item label="学号/工号">
          <el-input v-model="form.stuId" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" autocomplete="current-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: { stuId: 'admin', password: 'password' },
      loading: false
    };
  },
  methods: {
    async onSubmit() {
      if (this.loading) return;
      this.loading = true;
      try {
        await this.$store.dispatch('doLogin', this.form);
        this.$router.replace('/dashboard');
      } catch (e) {
        this.$message.error('登录失败');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-bg, #def0f9);
}
.login-card { width: 360px; }
.title { text-align: center; color: #4167b1; }
</style>
