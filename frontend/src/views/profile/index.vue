<template>
  <div class="app-container">
    <el-card>
      <div slot="header">个人中心</div>
      <div class="profile-content">

        <!-- 基本信息 -->
        <div class="info-section">
          <h3>基本信息</h3>
          <el-form :model="form" label-width="90px" style="max-width:520px;">
            <el-form-item label="学号">
              <el-input :value="form.stuId" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="性别">
              <el-select v-model="form.gender" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
            <el-form-item label="学院">
              <el-input v-model="form.college" />
            </el-form-item>
            <el-form-item label="专业">
              <el-input v-model="form.major" />
            </el-form-item>
            <el-form-item label="年级">
              <el-select v-model="form.grade" style="width: 100%">
                <el-option label="大一" value="大一" />
                <el-option label="大二" value="大二" />
                <el-option label="大三" value="大三" />
                <el-option label="大四" value="大四" />
                <el-option label="研一" value="研一" />
                <el-option label="研二" value="研二" />
                <el-option label="研三" value="研三" />
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input :value="getDepartmentDisplay()" disabled />
            </el-form-item>
            <el-form-item label="角色">
              <el-input :value="form.role" disabled />
            </el-form-item>
            <el-form-item label="入社时间">
              <el-input :value="form.joinDate" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save" :loading="saveLoading">保存</el-button>
              <el-button @click="reset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 密码修改 -->
        <div class="password-section">
          <h3>修改密码</h3>
          <el-form :model="passwordForm" label-width="90px" style="max-width:520px;">
            <el-form-item label="当前密码">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="passwordLoading">修改密码</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getProfile, updateProfile, changePassword } from '@/utils/api';

export default {
  data() {
    return { 
      form: { 
        id: null,
        stuId: '',
        name: '', 
        email: '', 
        phone: '', 
        gender: '',
        college: '',
        major: '',
        grade: '',
        deptId: null, 
        deptName: '', 
        role: '',
        joinDate: '',
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      saveLoading: false,
      passwordLoading: false
    };
  },
  created() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {
      try {
        const res = await getProfile();
        const profile = res.data || {};
        this.form = {
          id: profile.id,
          stuId: profile.stuId || '',
          name: profile.name || '', 
          email: profile.email || '', 
          phone: profile.phone || '', 
          gender: profile.gender || '',
          college: profile.college || '',
          major: profile.major || '',
          grade: profile.grade || '',
          deptId: profile.deptId, 
          deptName: profile.deptName || '', 
          role: profile.role || '',
          joinDate: profile.joinDate || '',
        };
      } catch (e) {
        this.$message.error('加载个人信息失败');
      }
    },
    getDepartmentDisplay() {
      // 社长、副社长、指导老师没有部门
      if (['社长', '副社长', '指导老师'].includes(this.form.role)) {
        return '无';
      }
      return this.form.deptName || this.form.deptId || '未分配';
    },
    async save() {
      if (!this.form.name) {
        return this.$message.warning('请输入姓名');
      }
      this.saveLoading = true;
      try {
        // 构造发送给后端的数据，确保字段名正确
        const updateData = {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          gender: this.form.gender,
          college: this.form.college,
          major: this.form.major,
          grade: this.form.grade,
        };
        
        await updateProfile(updateData);
        this.$message.success('已保存');
        // 重新加载个人信息
        await this.loadProfile();
        // 更新store中的用户信息
        const user = { ...this.$store.state.user, ...this.form };
        this.$store.commit('SET_USER', user);
      } catch (e) {
        this.$message.error('保存失败：' + (e.message || '未知错误'));
      } finally {
        this.saveLoading = false;
      }
    },
    async changePassword() {
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
        return this.$message.warning('请填写完整信息');
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        return this.$message.warning('两次输入的新密码不一致');
      }
      this.passwordLoading = true;
      try {
        await changePassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        });
        
        this.$message.success('密码修改成功');
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
      } catch (e) {
        console.error('密码修改错误:', e);
        
        // 检查是否是密码错误
        if (e.response && e.response.data) {
          const errorData = e.response.data;
          const errorMessage = errorData.message || '';
          
          if (errorMessage.includes('原密码错误') || errorMessage.includes('密码错误')) {
            this.$message.error('当前密码不正确，无法修改密码');
          } else {
            this.$message.error('密码修改失败：' + errorMessage);
          }
        } else {
          this.$message.error('密码修改失败：' + (e.message || '网络错误，请稍后重试'));
        }
      } finally {
        this.passwordLoading = false;
      }
    },
    reset() {
      this.loadProfile();
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
  }
};
</script>

<style scoped>
.profile-content {
  padding: 20px 0;
}


.info-section, .password-section {
  margin-bottom: 32px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.info-section h3, .password-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}
</style>
