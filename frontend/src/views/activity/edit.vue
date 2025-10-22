<template>
  <div class="app-container">
    <div class="page-header">
      <el-button type="text" @click="$router.go(-1)" class="back-btn">
        <i class="el-icon-arrow-left"></i> 返回
      </el-button>
      <h2 class="page-title">编辑活动</h2>
    </div>

    <el-card>
      <el-form :model="form" label-width="90px" :rules="rules" ref="form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动名称" prop="name" required>
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="type" required>
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="例会" value="例会" />
                <el-option label="比赛" value="比赛" />
                <el-option label="志愿" value="志愿" />
                <el-option label="外出" value="外出" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime" required>
              <el-date-picker 
                v-model="form.startTime" 
                type="date" 
                value-format="yyyy-MM-dd" 
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime" required>
              <el-date-picker 
                v-model="form.endTime" 
                type="date" 
                value-format="yyyy-MM-dd" 
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动地点">
          <el-input v-model="form.location" />
        </el-form-item>

        <el-form-item label="活动简介">
          <el-input 
            type="textarea" 
            :rows="4" 
            v-model="form.description" 
            placeholder="请输入活动简介" 
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>


        <el-form-item label="审批人" prop="approverIds" required v-if="canSetApprovers">
          <el-select 
            v-model="form.approverIds" 
            multiple 
            filterable 
            remote 
            :remote-method="searchApprovers"
            :loading="approverSearchLoading"
            placeholder="选择审批人"
            style="width: 100%"
          >
            <el-option
              v-for="user in approverOptions"
              :key="user.id"
              :label="`${user.stuId} ${user.name}`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="负责部门" prop="deptIds" required>
          <el-select v-model="form.deptIds" multiple placeholder="选择负责部门" style="width: 100%">
            <el-option
              v-for="dept in deptList"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="updateActivity" :loading="updateLoading">保存</el-button>
          <el-button @click="$router.go(-1)">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getActivityDetail, updateActivity, searchUsers, fetchDepts, setupActivityRelations, getActivityApprovers, getActivityDepts } from '@/utils/api';

export default {
  name: 'ActivityEdit',
  data() {
    return {
      form: {
        id: null,
        name: '',
        type: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        signMethod: '',
        approverIds: [],
        deptIds: []
      },
      rules: {
        name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        approverIds: [{ required: true, message: '请选择审批人', trigger: 'change' }],
        deptIds: [{ required: true, message: '请选择负责部门', trigger: 'change' }]
      },
      updateLoading: false,
      userOptions: [],
      approverOptions: [],
      deptList: [],
      userSearchLoading: false,
      approverSearchLoading: false
    };
  },
  computed: {
    canSetApprovers() {
      const user = this.$store.state.user;
      return user && ['社长', '副社长', '指导老师'].includes(user.role);
    }
  },
  created() {
    this.loadActivityDetail();
    this.loadDepts();
  },
  methods: {
    async loadActivityDetail() {
      try {
        const activityId = this.$route.params.id;
        const res = await getActivityDetail(activityId);
        const activity = res.data || {};
        
        this.form = {
          id: activity.id,
          name: activity.name || '',
          type: activity.type || '',
          startTime: activity.startTime || '',
          endTime: activity.endTime || '',
          location: activity.location || '',
          description: activity.description || '',
          signMethod: activity.signMethod || '',
          approverIds: [],
          deptIds: []
        };
        
        // 加载审批人和负责部门信息
        this.loadActivityRelations();
      } catch (e) {
        this.$message.error('加载活动信息失败');
        this.$router.go(-1);
      }
    },
    async loadActivityRelations() {
      try {
        const activityId = this.$route.params.id;
        // 加载审批人信息
        const approversRes = await getActivityApprovers(activityId);
        if (approversRes.data && approversRes.data.length > 0) {
          this.form.approverIds = approversRes.data.map(approver => approver.userId);
          // 将审批人信息添加到approverOptions中，用于显示
          this.approverOptions = approversRes.data.map(approver => ({
            id: approver.userId,
            name: approver.userName || '未知用户',
            stuId: approver.userStuId || approver.stuId || '未知学号'
          }));
        }
        
        // 加载负责部门信息
        const deptsRes = await getActivityDepts(activityId);
        if (deptsRes.data && deptsRes.data.length > 0) {
          this.form.deptIds = deptsRes.data.map(dept => dept.deptId);
        }
      } catch (e) {
        console.error('加载活动关系信息失败:', e);
      }
    },
    async loadDepts() {
      try {
        const res = await fetchDepts();
        this.deptList = res.data || [];
      } catch (e) {
        this.$message.error('加载部门列表失败');
      }
    },
    async searchUsers(query) {
      if (!query) return;
      this.userSearchLoading = true;
      try {
        const res = await searchUsers(query);
        this.userOptions = res.data || [];
      } catch (e) {
        this.$message.error('搜索用户失败');
      } finally {
        this.userSearchLoading = false;
      }
    },
    async searchApprovers(query) {
      if (!query) return;
      this.approverSearchLoading = true;
      try {
        const res = await searchUsers(query, '指导老师');
        this.approverOptions = res.data || [];
      } catch (e) {
        this.$message.error('搜索审批人失败');
      } finally {
        this.approverSearchLoading = false;
      }
    },
    async updateActivity() {
      try {
        await this.$refs.form.validate();
        this.updateLoading = true;
        
        // 构造更新数据，确保时间格式正确
        const updateData = {
          id: this.form.id,
          name: this.form.name,
          type: this.form.type,
          startTime: this.form.startTime,
          endTime: this.form.endTime,
          location: this.form.location,
          description: this.form.description,
          signMethod: this.form.signMethod
        };
        
        console.log('发送的更新数据:', updateData);
        
        // 更新活动基本信息
        await updateActivity(updateData);
        
        // 更新审批人和负责部门关系
        if (this.form.approverIds.length > 0 || this.form.deptIds.length > 0) {
          await setupActivityRelations(this.form.id, {
            approverUserIds: this.form.approverIds,
            deptIds: this.form.deptIds
          });
        }
        
        this.$message.success('更新成功');
        this.$router.push(`/activity/${this.form.id}`);
      } catch (e) {
        console.error('更新活动失败:', e);
        if (e !== false) { // 不是表单验证失败
          this.$message.error('更新失败：' + (e.message || '未知错误'));
        }
      } finally {
        this.updateLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  margin-right: 16px;
  color: #666;
}

.back-btn:hover {
  color: #4167b1;
}

.page-title {
  margin: 0;
  color: #333;
}
</style>
