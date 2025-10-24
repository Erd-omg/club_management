<template>
  <div class="app-container">
    <div class="page-header">
      <el-button type="text" @click="$router.go(-1)" class="back-btn">
        <i class="el-icon-arrow-left"></i> 返回
      </el-button>
      <h2 class="page-title">{{ activityInfo.name }}</h2>
    </div>

    <el-row :gutter="16">
      <!-- 活动基本信息 -->
      <el-col :span="16">
        <el-card class="info-card">
          <div slot="header">
            <span>活动信息</span>
            <div style="float: right;">
              <el-button 
                v-if="canExportData" 
                type="text" 
                @click="exportActivityData"
                style="padding: 3px 0; margin-right: 10px;"
              >
                数据导出
              </el-button>
              <el-button 
                v-if="canEdit && activityInfo.status === 0" 
                type="text" 
                @click="editActivity"
                style="padding: 3px 0"
              >
                编辑
              </el-button>
            </div>
          </div>
          <div class="activity-info">
            <div class="info-row">
              <div class="info-item">
                <label>活动名称：</label>
                <span>{{ activityInfo.name }}</span>
              </div>
              <div class="info-item">
                <label>活动类型：</label>
                <span>{{ activityInfo.type }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>开始时间：</label>
                <span>{{ formatDate(activityInfo.startTime) }}</span>
              </div>
              <div class="info-item">
                <label>结束时间：</label>
                <span>{{ formatDate(activityInfo.endTime) }}</span>
              </div>
            </div>
            <div class="info-row" v-if="activityInfo.location">
              <div class="info-item">
                <label>活动地点：</label>
                <span>{{ activityInfo.location }}</span>
              </div>
            </div>
            <div class="info-row" v-if="activityInfo.description">
              <div class="info-item full-width">
                <label>活动简介：</label>
                <p class="description">{{ activityInfo.description }}</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 审批进度 -->
        <el-card style="margin-top: 16px;">
          <div slot="header">审批进度</div>
          <div class="approval-progress" v-if="approvers.length > 0">
            <div 
              v-for="approver in approvers" 
              :key="approver.id"
              class="approver-item"
            >
              <div class="approver-info">
                <span class="approver-name">{{ approver.userName }}</span>
                <el-tag 
                  :type="getApprovalStatusType(approver.status)"
                  size="small"
                >
                  {{ getApprovalStatusText(approver.status) }}
                </el-tag>
              </div>
              <div v-if="approver.approvalTime" class="approval-time">
                审批时间：{{ approver.approvalTime }}
              </div>
            </div>
          </div>
          <div v-else class="no-approvers">
            <p>暂无审批人信息</p>
          </div>
        </el-card>

        <!-- 活动附件 -->
        <el-card style="margin-top: 16px;" v-if="activityInfo.id">
          <div slot="header">活动附件</div>
          <AttachmentList :activity-id="activityInfo.id" />
        </el-card>

        <!-- 参与人员 -->
        <el-card style="margin-top: 16px;">
          <div slot="header">
            <span>参与人员 ({{ members.length }}人)</span>
            <el-button 
              v-if="canManageMembers" 
              type="primary" 
              size="small" 
              @click="showMemberDialog = true"
              style="float: right; padding: 3px 0"
            >
              管理参与人员
            </el-button>
          </div>
          
          <el-table :data="members" v-loading="membersLoading" style="width: 100%">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="stuId" label="学号" />
            <el-table-column label="部门">
              <template slot-scope="scope">
                {{ getDepartmentDisplay(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column prop="role" label="角色" />
            <el-table-column label="操作" width="100" v-if="canManageMembers">
              <template slot-scope="scope">
                <el-button type="text" @click="removeMember(scope.row)" style="color: #f56c6c">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="!membersLoading && members.length === 0" description="暂无参与人员" />
        </el-card>
      </el-col>

      <!-- 侧边栏信息 -->
      <el-col :span="8">
        <!-- 活动状态 -->
        <el-card class="status-card">
          <div slot="header">活动状态</div>
          <div class="status-content">
            <el-tag 
              :type="getStatusType(activityInfo.status)" 
              size="large"
              style="font-size: 16px; padding: 8px 16px; display: flex; align-items: center; justify-content: center; width: 100%;"
            >
              {{ getStatusText(activityInfo.status) }}
            </el-tag>
            <div v-if="activityInfo.rejectReason" class="reject-reason">
              <p><strong>驳回理由：</strong></p>
              <p>{{ activityInfo.rejectReason }}</p>
            </div>
          </div>
        </el-card>

        <!-- 负责部门 -->
        <el-card style="margin-top: 16px;" v-if="responsibleDepts.length > 0">
          <div slot="header">负责部门</div>
          <div class="dept-list">
            <el-tag 
              v-for="dept in responsibleDepts" 
              :key="dept.id"
              style="margin: 4px 8px 4px 0;"
            >
              {{ dept.deptName }}
            </el-tag>
          </div>
        </el-card>

        <!-- 创建信息 -->
        <el-card style="margin-top: 16px;">
          <div slot="header">创建信息</div>
          <div class="create-info">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDate(activityInfo.createTime) }}</span>
            </div>
            <div class="info-item" v-if="activityInfo.updateTime">
              <label>更新时间：</label>
              <span>{{ formatDateTime(activityInfo.updateTime) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 报名按钮 -->
        <el-card style="margin-top: 16px;" v-if="canSignup">
          <div slot="header">活动报名</div>
          <div class="signup-section">
            <el-button 
              v-if="!isSignedUp && activityInfo.status === 1"
              type="primary" 
              @click="signupActivity"
              :loading="signupLoading"
              style="width: 100%;"
            >
              报名参加
            </el-button>
            <div v-else-if="activityInfo.status === 0" class="signup-disabled">
              <el-tag type="warning" size="medium">活动待审批，暂不能报名</el-tag>
            </div>
            <div v-else-if="activityInfo.status === 2" class="signup-disabled">
              <el-tag type="danger" size="medium">活动已驳回，不能报名</el-tag>
            </div>
            <div v-else-if="isSignedUp" class="signed-up-info">
              <el-tag type="success" size="medium">已报名</el-tag>
              <p class="signup-time">报名时间：{{ signupTime }}</p>
              <el-button 
                type="danger" 
                size="small" 
                @click="cancelSignup"
                :loading="cancelSignupLoading"
                style="margin-top: 8px;"
              >
                取消报名
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <el-card style="margin-top: 16px;" v-if="canApprove && activityInfo.status === 0">
          <div slot="header">审批操作</div>
          <div class="action-buttons" v-if="isSelectedApprover && !hasUserApproved">
            <el-button 
              type="success" 
              @click="showApprovalDialog(true)"
              class="approval-btn"
            >
              通过审批
            </el-button>
            <el-button 
              type="danger" 
              @click="showApprovalDialog(false)"
              class="approval-btn"
            >
              驳回活动
            </el-button>
          </div>
          <div v-else-if="isSelectedApprover && hasUserApproved" class="already-approved">
            <p style="text-align: center; color: #67c23a; margin: 20px 0; font-weight: bold;">您已审批</p>
          </div>
          <div v-else class="no-permission">
            <p style="text-align: center; color: #999; margin: 20px 0;">抱歉您无权限</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 审批对话框 -->
    <el-dialog 
      :title="approvalForm.pass ? '通过审批' : '驳回活动'" 
      :visible.sync="showApprovalDialogFlag" 
      width="500px"
    >
      <div class="approval-content">
        <div class="activity-info">
          <h4>{{ activityInfo.name }}</h4>
          <p><strong>类型：</strong>{{ activityInfo.type }}</p>
          <p><strong>时间：</strong>{{ formatDate(activityInfo.startTime) }} - {{ formatDate(activityInfo.endTime) }}</p>
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
              :rows="2" 
              v-model="approvalForm.rejectReason" 
              placeholder="请输入驳回理由"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showApprovalDialogFlag = false">取 消</el-button>
        <el-button type="primary" @click="submitApproval" :loading="approvalLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 参与人员管理对话框 -->
    <el-dialog title="管理参与人员" :visible.sync="showMemberDialog" width="600px">
      <div class="member-management">
        <div class="search-section">
          <el-input 
            v-model="memberSearchQuery" 
            placeholder="搜索成员"
            @input="searchMembers"
            style="width: 200px; margin-right: 16px;"
          />
          <el-button type="primary" @click="addSelectedMembers" :disabled="selectedMembers.length === 0">
            添加选中成员 ({{ selectedMembers.length }})
          </el-button>
        </div>
        
        <el-table 
          :data="availableMembers" 
          v-loading="memberSearchLoading"
          @selection-change="handleMemberSelection"
          style="width: 100%; margin-top: 16px;"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="stuId" label="学号" />
          <el-table-column label="部门">
            <template slot-scope="scope">
              {{ getDepartmentDisplay(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="role" label="角色" />
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showMemberDialog = false">取 消</el-button>
        <el-button type="primary" @click="showMemberDialog = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getActivityDetail, getActivityFullDetail, approveActivity, getActivityMembers, updateActivityMembers, searchUsers, getActivityApprovers, getActivityDepts, signupActivity, checkSignupStatus } from '@/utils/api';
import request from '@/utils/request';
import AttachmentList from '@/components/AttachmentList.vue';

export default {
  components: {
    AttachmentList
  },
  name: 'ActivityDetail',
  data() {
    return {
      activityInfo: {},
      approvers: [],
      members: [],
      responsibleDepts: [],
      membersLoading: false,
      showApprovalDialogFlag: false,
      showMemberDialog: false,
      approvalForm: { pass: true, rejectReason: '' },
      approvalLoading: false,
      availableMembers: [],
      selectedMembers: [],
      memberSearchQuery: '',
      memberSearchLoading: false,
      isSignedUp: false,
      signupTime: '',
      signupLoading: false,
      cancelSignupLoading: false
    };
  },
  computed: {
    canEdit() {
      const user = this.$store.state.user;
      return user && ['社长', '副社长', '部长'].includes(user.role);
    },
    canExportData() {
      return this.$store.getters.canExportData;
    },
    canApprove() {
      const user = this.$store.state.user;
      if (!user) return false;
      
      // 检查当前用户是否有审批权限（社长、副社长、指导老师）
      return ['社长', '副社长', '指导老师'].includes(user.role);
    },
    isSelectedApprover() {
      const user = this.$store.state.user;
      if (!user) return false;
      
      // 检查当前用户是否在审批人列表中
      return this.approvers.some(approver => approver.userId === user.id);
    },
    hasUserApproved() {
      const user = this.$store.state.user;
      if (!user) return false;
      
      // 检查当前用户是否已经审批过
      // 通过检查审批人列表中当前用户的审批状态
      const userApprover = this.approvers.find(approver => approver.userId === user.id);
      if (userApprover && userApprover.status !== undefined) {
        return userApprover.status === 1 || userApprover.status === 2; // 1-通过，2-驳回
      }
      
      return false;
    },
    canManageMembers() {
      const user = this.$store.state.user;
      return user && ['社长', '副社长', '部长'].includes(user.role);
    },
    canSignup() {
      const user = this.$store.state.user;
      return user && user.role !== '指导老师';
    }
  },
  created() {
    this.loadActivityDetail();
    this.checkSignupStatus();
  },
  methods: {
    async loadActivityDetail() {
      try {
        const activityId = this.$route.params.id;
        const res = await getActivityFullDetail(activityId);
        const data = res.data || {};
        this.activityInfo = data.activity || {};
        this.approvers = data.approvers || [];
        this.responsibleDepts = data.depts || [];
        
        // 单独加载成员信息，确保数据完整
        await this.loadMembers();
        
        // 重新检查报名状态
        await this.checkSignupStatus();
      } catch (e) {
        this.$message.error('加载活动详情失败');
      }
    },
    async loadMembers() {
      try {
        const activityId = this.$route.params.id;
        const res = await getActivityMembers(activityId);
        console.log('参与人员API响应:', res);
        this.members = res.data || [];
        console.log('参与人员列表:', this.members);
      } catch (e) {
        console.error('加载参与人员失败:', e);
      }
    },
    async searchMembers() {
      if (!this.memberSearchQuery) {
        this.availableMembers = [];
        return;
      }
      this.memberSearchLoading = true;
      try {
        const res = await searchUsers(this.memberSearchQuery);
        this.availableMembers = res.data || [];
      } catch (e) {
        this.$message.error('搜索成员失败');
      } finally {
        this.memberSearchLoading = false;
      }
    },
    handleMemberSelection(selection) {
      this.selectedMembers = selection;
    },
    async addSelectedMembers() {
      if (this.selectedMembers.length === 0) {
        return this.$message.warning('请选择要添加的成员');
      }
      try {
        const activityId = this.$route.params.id;
        // 获取现有成员ID列表
        const existingMemberIds = this.members.map(m => m.memberId);
        // 获取新选择的成员ID列表
        const newMemberIds = this.selectedMembers.map(m => m.id);
        // 合并现有成员和新成员，去重
        const allMemberIds = [...new Set([...existingMemberIds, ...newMemberIds])];
        
        await updateActivityMembers(activityId, allMemberIds);
        this.$message.success('添加成功');
        this.loadActivityDetail();
        this.selectedMembers = [];
        this.memberSearchQuery = '';
        this.availableMembers = [];
      } catch (e) {
        this.$message.error('添加失败：' + (e.message || '未知错误'));
      }
    },
    async removeMember(member) {
      try {
        await this.$confirm(`确定要移除成员 ${member.name} 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const activityId = this.$route.params.id;
        const currentMemberIds = this.members.map(m => m.memberId).filter(id => id !== member.memberId);
        await updateActivityMembers(activityId, currentMemberIds);
        this.$message.success('移除成功');
        
        // 重新加载活动详情，确保数据完整更新
        await this.loadActivityDetail();
        
        // 强制刷新页面以确保数据更新
        this.$forceUpdate();
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('移除失败：' + (e.message || '未知错误'));
        }
      }
    },
    showApprovalDialog(pass) {
      this.approvalForm = { pass, rejectReason: '' };
      this.showApprovalDialogFlag = true;
    },
    async submitApproval() {
      if (!this.approvalForm.pass && !this.approvalForm.rejectReason) {
        return this.$message.warning('驳回时必须填写理由');
      }
      this.approvalLoading = true;
      try {
        await approveActivity(this.activityInfo.id, this.approvalForm.pass, this.approvalForm.rejectReason);
        this.$message.success('审批完成');
        this.showApprovalDialogFlag = false;
        
        // 重新加载活动详情以更新状态
        await this.loadActivityDetail();
        
        // 强制刷新页面以确保状态更新
        this.$forceUpdate();
      } catch (e) {
        this.$message.error('审批失败');
      } finally {
        this.approvalLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    editActivity() {
      this.$router.push(`/activity/${this.activityInfo.id}/edit`);
    },
    getStatusType(status) {
      const types = { 0: 'warning', 1: 'success', 2: 'danger' };
      return types[status] || 'info';
    },
    getStatusText(status) {
      const texts = { 0: '待审批', 1: '已通过', 2: '已驳回' };
      return texts[status] || '未知';
    },
    getApprovalStatusType(status) {
      const types = { 0: 'warning', 1: 'success', 2: 'danger' };
      return types[status] || 'info';
    },
    getApprovalStatusText(status) {
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
    },
    async checkSignupStatus() {
      if (!this.canSignup) return;
      try {
        const activityId = this.$route.params.id;
        const res = await checkSignupStatus(activityId);
        this.isSignedUp = res.data || false;
        // 如果已报名，获取报名时间
        if (this.isSignedUp) {
          // 这里可以从members列表中获取报名时间
          const member = this.members.find(m => m.memberId === this.$store.state.user.id);
          if (member && member.signupTime) {
            this.signupTime = member.signupTime;
          }
        }
      } catch (e) {
        console.error('检查报名状态失败:', e);
      }
    },
    async signupActivity() {
      this.signupLoading = true;
      try {
        const activityId = this.$route.params.id;
        await signupActivity(activityId);
        this.$message.success('报名成功');
        this.isSignedUp = true;
        
        // 设置报名时间为当前时间
        this.signupTime = new Date().toLocaleString();
        
        // 重新加载活动详情，确保数据完整更新
        await this.loadActivityDetail();
        
        // 强制刷新页面以确保数据更新
        this.$forceUpdate();
      } catch (e) {
        this.$message.error('报名失败：' + (e.message || '未知错误'));
      } finally {
        this.signupLoading = false;
      }
    },
    async cancelSignup() {
      this.cancelSignupLoading = true;
      try {
        const activityId = this.$route.params.id;
        const userId = this.$store.state.user.id;
        
        // 从参与人员列表中移除当前用户
        const currentMemberIds = this.members.map(m => m.memberId).filter(id => id !== userId);
        await updateActivityMembers(activityId, currentMemberIds);
        
        this.$message.success('取消报名成功');
        this.isSignedUp = false;
        this.signupTime = '';
        
        // 只重新加载成员列表，不重新检查报名状态
        await this.loadMembers();
        
        // 强制刷新页面以确保数据更新
        this.$forceUpdate();
      } catch (e) {
        this.$message.error('取消报名失败：' + (e.message || '未知错误'));
      } finally {
        this.cancelSignupLoading = false;
      }
    },
    async exportActivityData() {
      try {
        const activityId = this.$route.params.id;
        const activityName = this.activityInfo.name || '活动详情';
        
        // 使用request下载文件
        const response = await request({
          url: `/export/download-activity/${activityId}`,
          method: 'get',
          responseType: 'blob'
        });
        
        // 创建下载链接 - 确保response.data是正确的二进制数据
        const blob = new Blob([response.data || response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activityName}_详情_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.$message.success('导出成功');
      } catch (e) {
        console.error('导出错误:', e);
        this.$message.error('导出失败：' + (e.message || '未知错误'));
      }
    },
    getDepartmentDisplay(member) {
      // 社长、副社长、指导老师没有部门
      if (['社长', '副社长', '指导老师'].includes(member.role)) {
        return '无';
      }
      return member.deptName || '未分配';
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

.activity-info {
  padding: 8px 0;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-item {
  flex: 1;
  margin-right: 16px;
}

.info-item.full-width {
  flex: 100%;
  margin-right: 0;
}

.info-item label {
  font-weight: 500;
  color: #666;
  display: inline-block;
  width: 80px;
}

.description {
  margin: 8px 0 0 80px;
  color: #666;
  line-height: 1.5;
  white-space: pre-wrap;
}

.status-card {
  height: fit-content;
}

.status-content {
  text-align: center;
}

.reject-reason {
  margin-top: 16px;
  padding: 12px;
  background: #fef0f0;
  border-radius: 4px;
  text-align: left;
}

.reject-reason p {
  margin: 4px 0;
  color: #f56c6c;
}

.create-info {
  padding: 8px 0;
}

.dept-list {
  padding: 8px 0;
}

.approval-progress {
  padding: 8px 0;
}

.approver-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
}

.approver-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.approver-name {
  font-weight: 500;
  color: #333;
}

.approval-time {
  font-size: 12px;
  color: #999;
}

.action-buttons {
  padding: 8px 0;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
}

.approval-btn {
  width: 100% !important;
  margin: 4px 0 !important;
}

.approval-content {
  padding: 16px 0;
}

.member-management {
  padding: 16px 0;
}

.search-section {
  display: flex;
  align-items: center;
}

.signup-section {
  text-align: center;
  padding: 16px 0;
}

.signed-up-info {
  padding: 16px 0;
}

.signup-time {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
}

.signup-disabled {
  text-align: center;
  padding: 16px 0;
}
</style>
