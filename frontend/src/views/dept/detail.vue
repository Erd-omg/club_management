<template>
  <div class="app-container">
    <div class="page-header">
      <el-button type="text" @click="$router.go(-1)" class="back-btn">
        <i class="el-icon-arrow-left"></i> 返回
      </el-button>
      <h2 class="page-title">{{ deptInfo.name }}</h2>
    </div>

    <el-row :gutter="16">
      <!-- 部门基本信息 -->
      <el-col :span="8">
        <el-card class="info-card">
          <div slot="header">
            <span>部门信息</span>
            <div style="float: right;">
              <el-button 
                v-if="canManageDepts" 
                type="text" 
                @click="showEditDept = true"
                style="padding: 3px 0; margin-right: 10px;"
              >
                编辑
              </el-button>
              <el-button 
                v-if="canDeleteDept" 
                type="text" 
                @click="deleteDept"
                style="padding: 3px 0; color: #f56c6c;"
                :disabled="deptInfo.memberCount > 0"
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="dept-info">
            <div class="info-item">
              <label>部门名称：</label>
              <span>{{ deptInfo.name }}</span>
            </div>
            <div class="info-item">
              <label>成员数量：</label>
              <span>{{ deptInfo.memberCount || 0 }} 人</span>
            </div>
            <div class="info-item">
              <label>部门简介：</label>
              <p class="intro-text">{{ deptInfo.intro || '暂无简介' }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 成员列表 -->
      <el-col :span="16">
        <el-card>
          <div slot="header">
            <span>部门成员</span>
            <el-button 
              v-if="canEditMembers" 
              type="primary" 
              size="small" 
              @click="showAddMember = true"
              style="float: right; padding: 3px 0"
            >
              添加成员
            </el-button>
          </div>
          
          <el-table :data="members" v-loading="membersLoading" style="width: 100%">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="stuId" label="学号" />
            <el-table-column prop="role" label="角色" />
            <el-table-column prop="joinDate" label="入社时间" />
            <el-table-column label="操作" width="120" v-if="canEditMembers">
              <template slot-scope="scope">
                <el-button type="text" @click="editMember(scope.row)">编辑</el-button>
                <el-button type="text" @click="removeMember(scope.row.id)" style="color: #f56c6c">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="!membersLoading && members.length === 0" description="暂无成员" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 相关活动 -->
    <el-card style="margin-top: 16px;">
      <div slot="header">相关活动</div>
      <el-table :data="activities" v-loading="activitiesLoading" style="width: 100%">
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="startTime" label="开始时间">
          <template slot-scope="scope">
            {{ formatDate(scope.row.startTime) }}
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
      
      <el-empty v-if="!activitiesLoading && activities.length === 0" description="暂无相关活动" />
    </el-card>

    <!-- 编辑部门对话框 -->
    <el-dialog title="编辑部门" :visible.sync="showEditDept" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="部门简介">
          <el-input type="textarea" :rows="4" v-model="editForm.intro" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDept = false">取 消</el-button>
        <el-button type="primary" @click="updateDept">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加成员对话框 -->
    <el-dialog title="添加成员" :visible.sync="showAddMember" width="600px">
      <el-form :model="memberForm" label-width="80px" :rules="memberRules" ref="memberForm">
        <el-form-item label="学号" prop="stuId">
          <el-input v-model="memberForm.stuId" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="memberForm.gender" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-input v-model="memberForm.college" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="memberForm.major" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="memberForm.grade" style="width: 100%">
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
          <el-input v-model="memberForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role" style="width: 100%">
            <el-option label="干事" value="干事" />
            <el-option label="副部长" value="副部长" />
            <el-option label="部长" value="部长" />
          </el-select>
        </el-form-item>
        <el-form-item label="入社时间" prop="joinDate">
          <el-date-picker v-model="memberForm.joinDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddMember = false">取 消</el-button>
        <el-button type="primary" @click="addMember">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑成员对话框 -->
    <el-dialog title="编辑成员" :visible.sync="showEditMember" width="600px">
      <el-form :model="editMemberForm" label-width="80px" :rules="memberRules" ref="editMemberForm">
        <el-form-item label="学号" prop="stuId">
          <el-input v-model="editMemberForm.stuId" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editMemberForm.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editMemberForm.gender" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-input v-model="editMemberForm.college" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="editMemberForm.major" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="editMemberForm.grade" style="width: 100%">
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
          <el-input v-model="editMemberForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editMemberForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editMemberForm.role" style="width: 100%">
            <el-option label="干事" value="干事" />
            <el-option label="副部长" value="副部长" />
            <el-option label="部长" value="部长" />
          </el-select>
        </el-form-item>
        <el-form-item label="入社时间" prop="joinDate">
          <el-date-picker v-model="editMemberForm.joinDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditMember = false">取 消</el-button>
        <el-button type="primary" @click="updateMember">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getDeptDetail, updateDept, fetchMembers, addMember, updateMember, deleteMember, fetchActivities, deleteDept } from '@/utils/api';

export default {
  name: 'DeptDetail',
  data() {
    return {
      deptInfo: {},
      members: [],
      activities: [],
      membersLoading: false,
      activitiesLoading: false,
      showEditDept: false,
      showAddMember: false,
      showEditMember: false,
      editForm: { name: '', intro: '' },
      memberForm: { 
        stuId: '', name: '', gender: '', college: '', major: '', grade: '', 
        phone: '', email: '', role: '干事', joinDate: '', deptId: null 
      },
      editMemberForm: { 
        id: null, stuId: '', name: '', gender: '', college: '', major: '', grade: '', 
        phone: '', email: '', role: '干事', joinDate: '', deptId: null 
      },
      memberRules: {
        stuId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^\d{8}$/, message: '学号必须为8位数字', trigger: 'blur' }
        ],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
        major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
        grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: ['blur', 'change'] }
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        joinDate: [{ required: true, message: '请选择入社时间', trigger: 'change' }]
      }
    };
  },
  computed: {
    canManageDepts() {
      return this.$store.getters.canManageDepts;
    },
    canEditMembers() {
      return this.$store.getters.canEditMembers;
    },
    canDeleteDept() {
      const user = this.$store.state.user;
      return user && (user.role === '社长' || user.role === '副社长');
    }
  },
  created() {
    this.loadDeptDetail();
    this.loadMembers();
    this.loadActivities();
  },
  methods: {
    async loadDeptDetail() {
      try {
        const deptId = this.$route.params.id;
        const res = await getDeptDetail(deptId);
        const data = res.data || {};
        this.deptInfo = data.dept || {};
        this.editForm = { name: this.deptInfo.name, intro: this.deptInfo.intro };
        this.memberForm.deptId = parseInt(deptId);
      } catch (e) {
        this.$message.error('加载部门信息失败');
      }
    },
    async loadMembers() {
      this.membersLoading = true;
      try {
        const deptId = this.$route.params.id;
        const res = await fetchMembers(1, 100, { deptId: parseInt(deptId) });
        this.members = (res.data && res.data.records) || [];
      } catch (e) {
        this.$message.error('加载成员列表失败');
      } finally {
        this.membersLoading = false;
      }
    },
    async loadActivities() {
      this.activitiesLoading = true;
      try {
        const deptId = this.$route.params.id;
        const res = await getDeptDetail(deptId);
        const deptData = res.data || {};
        this.activities = deptData.activities || [];
      } catch (e) {
        this.$message.error('加载活动列表失败');
      } finally {
        this.activitiesLoading = false;
      }
    },
    async updateDept() {
      try {
        await updateDept({ id: this.deptInfo.id, ...this.editForm });
        this.$message.success('更新成功');
        this.showEditDept = false;
        this.loadDeptDetail();
      } catch (e) {
        this.$message.error('更新失败');
      }
    },
    async deleteDept() {
      if (this.deptInfo.memberCount > 0) {
        this.$message.warning('该部门下还有成员，无法删除');
        return;
      }
      
      try {
        await this.$confirm(`确定要删除部门"${this.deptInfo.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await deleteDept(this.deptInfo.id);
        this.$message.success('删除成功');
        this.$router.push('/dept');
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + (error.message || '未知错误'));
        }
      }
    },
    async addMember() {
      try {
        await this.$refs.memberForm.validate();
        await addMember(this.memberForm);
        this.$message.success('添加成功');
        this.showAddMember = false;
        this.memberForm = { 
          stuId: '', name: '', gender: '', college: '', major: '', grade: '', 
          phone: '', email: '', role: '干事', joinDate: '', deptId: parseInt(this.$route.params.id) 
        };
        this.loadMembers();
      } catch (e) {
        if (e !== false) { // 不是表单验证失败
          this.$message.error('添加失败');
        }
      }
    },
    async removeMember(id) {
      try {
        await this.$confirm('确定要删除该成员吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await deleteMember(id);
        this.$message.success('删除成功');
        this.loadMembers();
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('删除失败');
        }
      }
    },
    editMember(member) {
      this.editMemberForm = { ...member };
      this.showEditMember = true;
    },
    async updateMember() {
      try {
        await this.$refs.editMemberForm.validate();
        await updateMember(this.editMemberForm);
        this.$message.success('更新成功');
        this.showEditMember = false;
        this.loadMembers();
      } catch (e) {
        if (e === false) {
          // 表单验证失败，清除验证状态
          this.$nextTick(() => {
            this.$refs.editMemberForm.clearValidate();
          });
        } else {
          this.$message.error('更新失败');
        }
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

.dept-info {
  padding: 8px 0;
}

.info-item {
  margin-bottom: 12px;
}

.info-item label {
  font-weight: 500;
  color: #666;
  display: inline-block;
  width: 80px;
}

.intro-text {
  margin: 8px 0 0 80px;
  color: #666;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
