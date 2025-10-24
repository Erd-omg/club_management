<template>
  <div class="app-container">
    <div class="toolbar" style="margin-bottom: 20px;">
      <el-input v-model="query.name" placeholder="活动名称" clearable style="width:200px;" />
      <el-select v-model="query.type" placeholder="类型" clearable style="width:140px; margin-left:8px;">
        <el-option label="例会" value="例会" />
        <el-option label="比赛" value="比赛" />
        <el-option label="志愿" value="志愿" />
        <el-option label="外出" value="外出" />
      </el-select>
      <el-select v-model="query.deptId" placeholder="负责部门" clearable style="width:140px; margin-left:8px;">
        <el-option
          v-for="dept in deptList"
          :key="dept.id"
          :label="dept.name"
          :value="dept.id"
        />
      </el-select>
      <el-select v-model="query.status" placeholder="状态" clearable style="width:120px; margin-left:8px;">
        <el-option label="待审批" value="0" />
        <el-option label="通过" value="1" />
        <el-option label="驳回" value="2" />
      </el-select>
      <el-button type="primary" @click="load" style="margin-left:8px;">查询</el-button>
      <el-button @click="resetQuery" style="margin-left:8px;">重置</el-button>
      <div class="actions">
        <el-button type="primary" @click="showAdd=true" v-if="canCreate">新增</el-button>
      </div>
    </div>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间">
        <template slot-scope="scope">
          {{ formatDate(scope.row.startTime) }}
        </template>
        <template slot="header">
          <span>开始时间</span>
          <div class="sort-buttons">
            <i class="el-icon-caret-top" @click="sortBy('start_time', 'asc')" :class="{ active: query.sortField === 'start_time' && query.sortOrder === 'asc' }"></i>
            <i class="el-icon-caret-bottom" @click="sortBy('start_time', 'desc')" :class="{ active: query.sortField === 'start_time' && query.sortOrder === 'desc' }"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间">
        <template slot-scope="scope">
          {{ formatDate(scope.row.endTime) }}
        </template>
        <template slot="header">
          <span>结束时间</span>
          <div class="sort-buttons">
            <i class="el-icon-caret-top" @click="sortBy('end_time', 'asc')" :class="{ active: query.sortField === 'end_time' && query.sortOrder === 'asc' }"></i>
            <i class="el-icon-caret-bottom" @click="sortBy('end_time', 'desc')" :class="{ active: query.sortField === 'end_time' && query.sortOrder === 'desc' }"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="deptNames" label="负责部门">
        <template slot-scope="scope">
          {{ scope.row.deptNames || '未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="text" @click="viewDetail(scope.row.id)">详情</el-button>
          <el-button 
            v-if="canApprove && scope.row.status === 0 && !hasUserApproved(scope.row)" 
            type="text" 
            @click="showApproval(scope.row)"
          >
            审批
          </el-button>
          <el-button 
            v-if="canEdit && scope.row.status === 0" 
            type="text" 
            @click="editActivity(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            v-if="canDelete" 
            type="text" 
            @click="remove(scope.row.id)"
            style="color: #f56c6c"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="新增活动" :visible.sync="showAdd" width="560px">
      <el-form :model="form" :rules="rules" ref="form" label-width="90px">
        <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="form.type">
            <el-option label="例会" value="例会" />
            <el-option label="比赛" value="比赛" />
            <el-option label="志愿" value="志愿" />
            <el-option label="外出" value="外出" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" required><el-date-picker v-model="form.startTime" type="date" value-format="yyyy-MM-dd" /></el-form-item>
        <el-form-item label="结束时间" required><el-date-picker v-model="form.endTime" type="date" value-format="yyyy-MM-dd" /></el-form-item>
        <el-form-item label="活动简介">
          <el-input type="textarea" :rows="3" v-model="form.description" placeholder="请输入活动简介" />
        </el-form-item>
        <el-form-item label="审批人" prop="approverIds" v-if="canEdit">
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
              :label="`${user.name} (${user.stuId})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责部门" prop="deptIds">
          <el-select v-model="form.deptIds" multiple placeholder="选择负责部门" style="width: 100%" :disabled="isMinisterOnly">
            <el-option
              v-for="dept in availableDepts"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
          <div v-if="isMinisterOnly" class="minister-tip">
            <el-tag type="info" size="small">部长只能创建本部门负责的活动</el-tag>
          </div>
        </el-form-item>
        <el-form-item>
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            show-icon>
            <template slot="default">
              活动创建成功后，将自动跳转到编辑页面，您可以在编辑页面上传活动附件
            </template>
          </el-alert>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAdd=false">取 消</el-button>
        <el-button type="primary" @click="create" :loading="createLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog title="活动审批" :visible.sync="showApprovalDialog" width="500px">
      <div class="approval-content">
        <div class="activity-info">
          <h4>{{ currentActivity.name }}</h4>
          <p><strong>类型：</strong>{{ currentActivity.type }}</p>
          <p><strong>时间：</strong>{{ formatDate(currentActivity.startTime) }} - {{ formatDate(currentActivity.endTime) }}</p>
          <p v-if="currentActivity.description"><strong>简介：</strong>{{ currentActivity.description }}</p>
        </div>
        
        <el-form :model="approvalForm" label-width="80px">
          <el-form-item label="审批结果">
            <el-radio-group v-model="approvalForm.pass">
              <el-radio :label="true">通过</el-radio>
              <el-radio :label="false">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="驳回理由" v-if="!approvalForm.pass">
            <el-input 
              type="textarea" 
              :rows="3" 
              v-model="approvalForm.rejectReason" 
              placeholder="请输入驳回理由"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showApprovalDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitApproval" :loading="approvalLoading">确 定</el-button>
      </span>
    </el-dialog>

    <el-empty v-if="!loading && list.length===0" description="暂无数据" />
  </div>
</template>

<script>
import { fetchActivities, addActivity, deleteActivity, approveActivity, searchUsers, fetchDepts, setupActivityRelations } from '@/utils/api';
export default {
  data() {
    return {
      loading: false,
      list: [],
      query: { name:'', type:'', deptId:'', status:'', sortField:'', sortOrder:'' },
      showAdd: false,
      showApprovalDialog: false,
      form: { 
        name: '', type: '', startTime: '', endTime: '', 
        createBy: 1, description: '', approverIds: [], deptIds: [] 
      },
      currentActivity: {},
      approvalForm: { pass: true, rejectReason: '' },
      approvalLoading: false,
      approverOptions: [],
      deptList: [],
      approverSearchLoading: false,
      createLoading: false,
      rules: {
        name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        approverIds: [{ required: true, message: '请选择审批人', trigger: 'change' }],
        deptIds: [{ required: true, message: '请选择负责部门', trigger: 'change' }]
      }
    };
  },
  computed: {
    canApprove() {
      return this.$store.getters.canApproveActivities;
    },
    canEdit() {
      const user = this.$store.state.user;
      return user && ['社长', '副社长', '部长'].includes(user.role);
    },
    canDelete() {
      const user = this.$store.state.user;
      return user && ['社长', '副社长'].includes(user.role);
    },
    canCreate() {
      const user = this.$store.state.user;
      return user && ['社长', '副社长', '部长'].includes(user.role);
    },
    isMinisterOnly() {
      const user = this.$store.state.user;
      return user && user.role === '部长';
    },
    availableDepts() {
      const user = this.$store.state.user;
      if (user && user.role === '部长') {
        // 部长只能选择本部门
        return this.deptList.filter(dept => dept.id === user.deptId);
      }
      return this.deptList;
    }
  },
  created() { 
    this.load(); 
    this.loadDepts();
    
    // 部长自动设置本部门为负责部门
    const user = this.$store.state.user;
    if (user && user.role === '部长' && user.deptId) {
      this.form.deptIds = [user.deptId];
    }
  },
  methods: {
    async load() {
      this.loading = true;
      const params = { 
        name: this.query.name, 
        type: this.query.type, 
        deptId: this.query.deptId,
        status: this.query.status, 
        sortField: this.query.sortField, 
        sortOrder: this.query.sortOrder 
      };
      
      // 干事角色只显示已审批通过的活动
      const user = this.$store.state.user;
      if (user && user.role === '干事') {
        params.status = '1'; // 只显示已通过的活动
      }
      
      const res = await fetchActivities(1, 20, params);
      const pageData = res && res.data ? res.data : {};
      this.list = pageData.records || [];
      this.loading = false;
    },
    sortBy(field, order) {
      this.query.sortField = field;
      this.query.sortOrder = order;
      this.load();
    },
    resetQuery() {
      this.query = { name: '', type: '', deptId: '', status: '', sortField: '', sortOrder: '' };
      this.load();
    },
    async loadDepts() {
      try {
        const res = await fetchDepts();
        this.deptList = res.data || [];
      } catch (e) {
        this.$message.error('加载部门列表失败');
      }
    },
    async searchApprovers(query) {
      if (!query) return;
      this.approverSearchLoading = true;
      try {
        // 搜索社长、副社长、指导老师作为审批人
        const results = [];
        for (const role of ['社长', '副社长', '指导老师']) {
          const res = await searchUsers(query, role);
          if (res.data && res.data.length > 0) {
            results.push(...res.data);
          }
        }
        this.approverOptions = results;
      } catch (e) {
        this.$message.error('搜索审批人失败');
      } finally {
        this.approverSearchLoading = false;
      }
    },
    async create() {
      if (this.createLoading) {
        this.$message.warning('正在创建中，请勿重复提交');
        return;
      }
      
      try {
        await this.$refs.form.validate();
      } catch (e) {
        return; // 表单验证失败，不继续执行
      }
      
      const f = this.form;
      
      // 部长自动设置本部门为负责部门
      const user = this.$store.state.user;
      if (user && user.role === '部长' && user.deptId) {
        f.deptIds = [user.deptId];
      }
      
      this.createLoading = true;
      try {
        // 创建活动
        const activityRes = await addActivity({ 
          name: f.name, 
          type: f.type, 
          startTime: f.startTime ? f.startTime + 'T00:00:00' : null, 
          endTime: f.endTime ? f.endTime + 'T23:59:59' : null, 
          createBy: f.createBy,
          description: f.description,
          status: 0 
        });
        
        // 设置审批人和负责部门
        if (f.approverIds.length > 0 || f.deptIds.length > 0) {
          // 检查活动ID是否为有效数字
          const activityId = activityRes.data;
          if (typeof activityId !== 'number' && !Number.isInteger(activityId)) {
            throw new Error('活动ID无效');
          }
          
          await setupActivityRelations(activityId, {
            approverUserIds: f.approverIds,
            deptIds: f.deptIds
          });
        }
        
        this.$message.success('新增成功');
        this.resetForm();
        this.showAdd = false;
        this.load();
        
        // 跳转到编辑页面，方便用户上传附件
        this.$router.push(`/activity/${activityRes.data}/edit`);
      } catch (e) {
        this.$message.error('新增失败: ' + (e.message || '未知错误'));
      } finally {
        this.createLoading = false;
      }
    },
    async remove(id) {
      try {
        await this.$confirm('确定要删除该活动吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await deleteActivity(id);
        this.$message.success('已删除');
        this.load();
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('删除失败');
        }
      }
    },
    showApproval(activity) {
      this.currentActivity = activity;
      
      // 检查用户是否已经审批过
      if (this.hasUserApproved(activity)) {
        this.$message.info('您已审批过此活动');
        return;
      }
      
      this.approvalForm = { pass: true, rejectReason: '' };
      this.showApprovalDialog = true;
    },
    async submitApproval() {
      if (!this.approvalForm.pass && !this.approvalForm.rejectReason) {
        return this.$message.warning('驳回时必须填写理由');
      }
      this.approvalLoading = true;
      try {
        await approveActivity(this.currentActivity.id, this.approvalForm.pass, this.approvalForm.rejectReason);
        this.$message.success('审批完成');
        this.showApprovalDialog = false;
        
        // 重新加载活动列表
        await this.load();
        
        // 强制刷新页面以确保状态更新
        this.$forceUpdate();
      } catch (e) {
        this.$message.error('审批失败');
      } finally {
        this.approvalLoading = false;
      }
    },
    viewDetail(id) {
      this.$router.push(`/activity/${id}`);
    },
    editActivity(activity) {
      this.$router.push(`/activity/${activity.id}/edit`);
    },
    resetForm() {
      this.form = { 
        name: '', type: '', startTime: '', endTime: '', 
        createBy: 1, description: '', approverIds: [], deptIds: [] 
      };
      this.approverOptions = [];
      
      // 部长自动设置本部门为负责部门
      const user = this.$store.state.user;
      if (user && user.role === '部长' && user.deptId) {
        this.form.deptIds = [user.deptId];
      }
    },
    getStatusType(status) {
      const types = { 0: 'warning', 1: 'success', 2: 'danger' };
      return types[status] || 'info';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    getStatusText(status) {
      const texts = { 0: '待审批', 1: '已通过', 2: '已驳回' };
      return texts[status] || '未知';
    },
    hasUserApproved(activity) {
      const user = this.$store.state.user;
      if (!user) return false;
      
      // 检查当前用户是否是该活动的审批人之一
      if (activity.approvers && activity.approvers.length > 0) {
        const userApprover = activity.approvers.find(approver => approver.userId === user.id);
        if (userApprover) {
          // 用户是审批人，检查是否已审批
          return userApprover.status === 1 || userApprover.status === 2; // 1-通过，2-驳回
        }
      }
      
      // 如果用户不是审批人，返回true以隐藏审批按钮
      return true;
    }
  }
};
</script>

<style scoped>
.toolbar { display:flex; align-items:center; }
.actions { margin-left:auto; }

.approval-content {
  padding: 16px 0;
}

.activity-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.activity-info h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.activity-info p {
  margin: 8px 0;
  color: #666;
}

.sort-buttons {
  display: inline-flex;
  flex-direction: row;
  margin-left: 8px;
  vertical-align: middle;
}

.sort-buttons i {
  font-size: 12px;
  color: #c0c4cc;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}

.sort-buttons i:hover {
  color: #409eff;
}

.sort-buttons i.active {
  color: #409eff;
}

.minister-tip {
  margin-top: 8px;
}
</style>
