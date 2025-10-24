<template>
  <div class="app-container">
    <div class="page-header">
      <el-button type="text" @click="$router.go(-1)" class="back-btn">
        <i class="el-icon-arrow-left"></i> 返回
      </el-button>
      <h2 class="page-title">{{ memberInfo.name }} - 社员详情</h2>
      <el-button 
        v-if="canEditMember" 
        type="primary" 
        @click="showEdit = true"
        style="margin-left: auto;"
      >
        编辑
      </el-button>
    </div>

    <el-row :gutter="20">
      <!-- 基本信息 -->
      <el-col :span="8">
        <el-card class="info-card">
          <div slot="header">基本信息</div>
          <div class="member-info">
            <div class="info-item">
              <label>学号：</label>
              <span>{{ memberInfo.stuId }}</span>
            </div>
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ memberInfo.name }}</span>
            </div>
            <div class="info-item">
              <label>性别：</label>
              <span>{{ memberInfo.gender }}</span>
            </div>
            <div class="info-item">
              <label>学院：</label>
              <span>{{ memberInfo.college }}</span>
            </div>
            <div class="info-item">
              <label>专业：</label>
              <span>{{ memberInfo.major }}</span>
            </div>
            <div class="info-item">
              <label>年级：</label>
              <span>{{ memberInfo.grade }}</span>
            </div>
            <div class="info-item">
              <label>手机：</label>
              <span>{{ memberInfo.phone }}</span>
            </div>
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ memberInfo.email }}</span>
            </div>
            <div class="info-item">
              <label>部门：</label>
              <span>{{ memberInfo.deptName }}</span>
            </div>
            <div class="info-item">
              <label>角色：</label>
              <span>{{ memberInfo.role }}</span>
            </div>
            <div class="info-item">
              <label>入社时间：</label>
              <span>{{ memberInfo.joinDate }}</span>
            </div>
            <div class="info-item" v-if="memberInfo.leaveDate">
              <label>离社时间：</label>
              <span>{{ memberInfo.leaveDate }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 参与活动记录 -->
      <el-col :span="16">
        <el-card>
          <div slot="header">参与活动记录</div>
          <el-table :data="activities" v-loading="activitiesLoading" style="width: 100%">
            <el-table-column prop="name" label="活动名称" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="startTime" label="开始时间">
              <template slot-scope="scope">
                {{ formatDate(scope.row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间">
              <template slot-scope="scope">
                {{ formatDate(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" @click="viewActivity(scope.row.id)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="!activitiesLoading && activities.length === 0" description="暂无参与活动" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑社员信息" :visible.sync="showEdit" width="600px">
      <el-form :model="editForm" label-width="80px" :rules="editRules" ref="editForm">
        <el-form-item label="学号" prop="stuId">
          <el-input v-model="editForm.stuId" :disabled="!canChangeStuId" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-input v-model="editForm.college" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="editForm.major" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="editForm.grade" style="width: 100%">
            <el-option label="大一" value="大一" />
            <el-option label="大二" value="大二" />
            <el-option label="大三" value="大三" />
            <el-option label="大四" value="大四" />
            <el-option label="研一" value="研一" />
            <el-option label="研二" value="研二" />
            <el-option label="研三" value="研三" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId" v-if="canChangeDept">
          <el-select v-model="editForm.deptId" style="width: 100%">
            <el-option 
              v-for="dept in deptList" 
              :key="dept.id" 
              :label="dept.name" 
              :value="dept.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role" v-if="canChangeRole">
          <el-select v-model="editForm.role" style="width: 100%">
            <el-option label="社长" value="社长" />
            <el-option label="副社长" value="副社长" />
            <el-option label="部长" value="部长" />
            <el-option label="副部长" value="副部长" />
            <el-option label="干事" value="干事" />
            <el-option label="指导老师" value="指导老师" />
          </el-select>
        </el-form-item>
        <el-form-item label="入社时间" prop="joinDate">
          <el-date-picker v-model="editForm.joinDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </el-form-item>
        <el-form-item label="离社时间" v-if="canChangeLeaveDate">
          <el-date-picker v-model="editForm.leaveDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEdit = false">取 消</el-button>
        <el-button type="warning" @click="resetPassword" :loading="resetLoading" v-if="canResetPassword">重置密码</el-button>
        <el-button type="primary" @click="updateMember" :loading="updateLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getMemberDetail, updateMember, fetchDepts, getMemberActivities, resetMemberPassword } from '@/utils/api';

export default {
  name: 'MemberDetail',
  data() {
    return {
      memberInfo: {},
      activities: [],
      activitiesLoading: false,
      showEdit: false,
      updateLoading: false,
      resetLoading: false,
      deptList: [],
      editForm: {},
      editRules: {
        stuId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^\d{8}$/, message: '学号必须为8位数字', trigger: 'blur' }
        ],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
        major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
        grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
      }
    };
  },
  computed: {
    canEditMember() {
      const user = this.$store.state.user;
      const currentMember = this.memberInfo;
      
      // 社长、副社长可以编辑所有成员
      if (['社长', '副社长'].includes(user.role)) {
        return true;
      }
      
      // 部长可以编辑本部门成员
      if (user.role === '部长' && user.deptId === currentMember.deptId) {
        return true;
      }
      
      // 干事只能编辑自己
      if (user.role === '干事' && user.id === currentMember.id) {
        return true;
      }
      
      return false;
    },
    canChangeStuId() {
      const user = this.$store.state.user;
      return ['社长', '副社长'].includes(user.role);
    },
    canChangeDept() {
      const user = this.$store.state.user;
      return ['社长', '副社长', '指导老师'].includes(user.role);
    },
    canChangeRole() {
      const user = this.$store.state.user;
      return ['社长', '副社长', '指导老师'].includes(user.role);
    },
    canChangeLeaveDate() {
      const user = this.$store.state.user;
      return ['社长', '副社长', '指导老师'].includes(user.role);
    },
    canResetPassword() {
      const user = this.$store.state.user;
      // 只有社长和副社长可以重置密码
      return ['社长', '副社长'].includes(user.role);
    }
  },
  created() {
    this.loadMemberDetail();
    this.loadActivities();
    this.loadDepts();
  },
  methods: {
    async loadMemberDetail() {
      try {
        const memberId = this.$route.params.id;
        const res = await getMemberDetail(memberId);
        this.memberInfo = res.data || {};
        this.editForm = { ...this.memberInfo };
      } catch (e) {
        this.$message.error('加载社员信息失败');
      }
    },
    async loadActivities() {
      this.activitiesLoading = true;
      try {
        const memberId = this.$route.params.id;
        const res = await getMemberActivities(memberId);
        this.activities = res.data || [];
      } catch (e) {
        this.$message.error('加载活动记录失败');
      } finally {
        this.activitiesLoading = false;
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
    async updateMember() {
      try {
        await this.$refs.editForm.validate();
        this.updateLoading = true;
        await updateMember(this.editForm);
        this.$message.success('更新成功');
        this.showEdit = false;
        this.loadMemberDetail();
      } catch (e) {
        if (e === false) {
          // 表单验证失败，清除验证状态
          this.$nextTick(() => {
            this.$refs.editForm.clearValidate();
          });
        } else {
          this.$message.error('更新失败');
        }
      } finally {
        this.updateLoading = false;
      }
    },
    async resetPassword() {
      try {
        await this.$confirm('确定要重置该用户的密码为学号后6位吗？', '重置密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        this.resetLoading = true;
        const res = await resetMemberPassword(this.memberInfo.id);
        this.$message.success(res.message || '密码重置成功');
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('密码重置失败');
        }
      } finally {
        this.resetLoading = false;
      }
    },
    viewActivity(id) {
      this.$router.push(`/activity/${id}`);
    },
    getStatusType(status) {
      const types = { 0: 'warning', 1: 'success', 2: 'danger' };
      return types[status] || 'info';
    },
    getStatusText(status) {
      const texts = { 0: '待审批', 1: '已通过', 2: '已驳回' };
      return texts[status] || '未知';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      // 如果是完整的日期时间字符串，只取日期部分
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
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

.info-card {
  height: fit-content;
}

.member-info {
  padding: 8px 0;
}

.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #666;
  display: inline-block;
  width: 80px;
  flex-shrink: 0;
}

.info-item span {
  color: #333;
  flex: 1;
  word-break: break-all;
  overflow-wrap: break-word;
}
</style>
