<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:16px;">
      <!-- 成员总数 - 只有管理员可见 -->
      <el-col :span="6" v-if="canViewAll">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon members">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.members }}</div>
              <div class="stat-label">成员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 近期活动 - 所有角色可见 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon activities">
              <i class="el-icon-date"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.activities30d }}</div>
              <div class="stat-label">近期活动</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 待审批 - 只有有审批权限的角色可见 -->
      <el-col :span="6" v-if="canApproveActivities">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 我参与 - 所有角色可见 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon myJoin">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.myJoin }}</div>
              <div class="stat-label">我参与</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

        <!-- 管理员统计图表 -->
        <el-row :gutter="16" v-if="canViewAll" style="margin-bottom:16px;">
      <el-col :span="12">
        <el-card>
          <div slot="header">成员部门分布</div>
          <div ref="deptPie" style="height:320px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">活动类型分布</div>
          <div ref="typeBar" style="height:320px;"></div>
        </el-card>
      </el-col>
    </el-row>

        <!-- 待审批活动列表（管理员可见） -->
        <el-card v-if="canApproveActivities && pendingActivities.length > 0" style="margin-bottom:16px;">
      <div slot="header">
        <span>待审批活动</span>
      </div>
      <el-table :data="pendingActivities.slice(0, 5)" style="width: 100%">
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="startTime" label="开始时间">
          <template slot-scope="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="deptNames" label="负责部门">
          <template slot-scope="scope">
            {{ scope.row.deptNames || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="$router.push(`/activity/${scope.row.id}`)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 我的活动 -->
    <el-card v-if="myActivities.length > 0" style="margin-bottom:16px;">
      <div slot="header">我参与的活动</div>
      <el-table :data="myActivities.slice(0, 5)" style="width: 100%">
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
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="$router.push(`/activity/${scope.row.id}`)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快捷操作 -->
    <el-row :gutter="16">
      <el-col :span="8" v-if="canManageDepts">
        <el-card @click.native="$router.push('/dept')" class="card-link">
          <div class="card-content">
            <i class="el-icon-s-management card-icon"></i>
            <div class="card-text">部门管理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" v-if="canEditMembers">
        <el-card @click.native="$router.push('/member')" class="card-link">
          <div class="card-content">
            <i class="el-icon-user card-icon"></i>
            <div class="card-text">社员管理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card @click.native="$router.push('/activity')" class="card-link">
          <div class="card-content">
            <i class="el-icon-date card-icon"></i>
            <div class="card-text">活动管理</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { fetchMembers, fetchActivities, fetchDeptCards } from '@/utils/api';
import request from '@/utils/request';

function formatDateISO(dt) {
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

export default {
  name: 'Dashboard',
  data() {
    const user = this.$store.state.user || {};
    return {
      user,
      stats: { members: 0, activities30d: 0, pending: 0, myJoin: 0 },
      pendingActivities: [],
      myActivities: [],
      deptStats: [],
      activityTypeStats: []
    };
  },
  computed: {
    canViewAll() {
      return this.$store.getters.canViewAll;
    },
    canApproveActivities() {
      return this.$store.getters.canApproveActivities;
    },
    canManageDepts() {
      return this.$store.getters.canManageDepts;
    },
    canEditMembers() {
      return this.$store.getters.canEditMembers;
    }
  },
  async mounted() {
    await this.loadStats();
    await this.loadPendingActivities();
    await this.loadMyActivities();
    await this.loadCharts();
  },
  methods: {
    async loadStats() {
      // 成员总数
      try {
        const memberRes = await fetchMembers(1, 1, {});
        this.stats.members = (memberRes && memberRes.data && memberRes.data.total) ? memberRes.data.total : 0;
      } catch(e) {}

      // 近期活动（近30天）
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const act30 = await fetchActivities(1, 1, { startTime: formatDateISO(start), endTime: formatDateISO(end) });
        this.stats.activities30d = (act30 && act30.data && act30.data.total) ? act30.data.total : 0;
      } catch(e) {}

      // 待审批活动
      try {
        const pending = await fetchActivities(1, 1, { status: 0 });
        const allPending = (pending && pending.data && pending.data.records) || [];
        
        // 系统管理员显示所有待审批活动数量，其他角色只显示自己有权限审批的活动数量
        if (this.user.role === '系统管理员') {
          this.stats.pending = allPending.length;
        } else {
          this.stats.pending = allPending.filter(activity => {
            return activity.approvers && activity.approvers.some(approver => approver.userId === this.user.id);
          }).length;
        }
      } catch(e) {}

      // 我参与的活动 - 获取用户实际参与的活动
      try {
        // 先获取所有活动
        const allActivities = await fetchActivities(1, 100);
        const activities = (allActivities && allActivities.data && allActivities.data.records) || [];
        
        // 然后过滤出用户参与的活动
        const myActivityIds = await this.getMyActivityIds();
        const myJoinActivities = activities.filter(activity => myActivityIds.includes(activity.id));
        
        this.stats.myJoin = myJoinActivities.length;
        this.myActivities = myJoinActivities.slice(0, 5);
      } catch(e) {
        console.error('加载我参与的活动失败:', e);
        this.stats.myJoin = 0;
        this.myActivities = [];
      }
    },
    async loadPendingActivities() {
      if (!this.canApproveActivities) return;
      try {
        const res = await fetchActivities(1, 10, { status: 0 });
        console.log('待审批活动API响应:', res);
        const allPending = (res.data && res.data.records) || [];
        
        // 系统管理员显示所有待审批活动，其他角色只显示自己被选为审批人的活动
        if (this.user.role === '系统管理员') {
          this.pendingActivities = allPending;
        } else {
          this.pendingActivities = allPending.filter(activity => {
            return activity.approvers && activity.approvers.some(approver => approver.userId === this.user.id);
          });
        }
        console.log('待审批活动列表:', this.pendingActivities);
        
        // 同时更新待审批数量统计
        this.stats.pending = this.pendingActivities.length;
      } catch(e) {
        console.error('加载待审批活动失败:', e);
      }
    },
    async loadMyActivities() {
      if (!this.user || !this.user.id) return;
      // 如果已经在loadStats中加载了，就不需要重复加载
      if (this.myActivities.length > 0) return;
      
      try {
        // 获取所有活动
        const allActivities = await fetchActivities(1, 100);
        const activities = (allActivities && allActivities.data && allActivities.data.records) || [];
        
        // 获取用户参与的活动ID
        const myActivityIds = await this.getMyActivityIds();
        
        // 过滤出用户参与的活动
        this.myActivities = activities.filter(activity => myActivityIds.includes(activity.id)).slice(0, 5);
        console.log('我的活动列表:', this.myActivities);
      } catch(e) {
        console.error('加载我的活动失败:', e);
      }
    },
    async getMyActivityIds() {
      try {
        // 通过活动成员关系获取用户参与的活动ID
        const memberId = this.user.id;
        const activities = await fetchActivities(1, 100);
        const allActivities = (activities && activities.data && activities.data.records) || [];
        
        const myActivityIds = [];
        for (const activity of allActivities) {
          try {
            const members = await request({ 
              url: `/activity/members/${activity.id}`, 
              method: 'get' 
            });
            
            if (members && members.data) {
              const isParticipated = members.data.some(member => member.memberId === memberId);
              if (isParticipated) {
                myActivityIds.push(activity.id);
              }
            }
          } catch(e) {
            // 忽略单个活动成员查询失败
            continue;
          }
        }
        
        return myActivityIds;
      } catch(e) {
        console.error('获取我的活动ID失败:', e);
        return [];
      }
    },
    async loadCharts() {
      if (!this.canViewAll) return;
      
      this.$nextTick(() => {
        this.initDeptPieChart();
        this.initActivityTypeChart();
      });
    },
    async initDeptPieChart() {
      try {
        // 确保DOM元素存在且可见
        if (!this.$refs.deptPie) {
          console.warn('饼图容器不存在，跳过初始化');
          return;
        }
        
        const res = await fetchDeptCards();
        const deptData = res.data || [];
        this.deptStats = deptData.map(dept => ({
          name: dept.name,
          value: dept.memberCount || 0
        }));
        
        // 使用nextTick确保DOM完全渲染
        this.$nextTick(() => {
          if (this.$refs.deptPie && this.$refs.deptPie.offsetWidth > 0) {
            const pie = echarts.init(this.$refs.deptPie);
            pie.setOption({
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
              },
              series: [{
                name: '部门成员',
                type: 'pie',
                radius: '50%',
                data: this.deptStats,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }]
            });
          }
        });
      } catch(e) {
        console.error('加载部门统计失败:', e);
      }
    },
    async initActivityTypeChart() {
      try {
        // 确保DOM元素存在且可见
        if (!this.$refs.typeBar) {
          console.warn('图表容器不存在，跳过初始化');
          return;
        }
        
        const res = await fetchActivities(1, 100, {});
        const activities = (res.data && res.data.records) || [];
        
        // 统计活动类型
        const typeCount = {};
        activities.forEach(activity => {
          typeCount[activity.type] = (typeCount[activity.type] || 0) + 1;
        });
        
        this.activityTypeStats = Object.entries(typeCount).map(([type, count]) => ({
          type,
          count
        }));
        
        // 使用nextTick确保DOM完全渲染
        this.$nextTick(() => {
          if (this.$refs.typeBar && this.$refs.typeBar.offsetWidth > 0) {
            const bar = echarts.init(this.$refs.typeBar);
            bar.setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                }
              },
              xAxis: {
                type: 'category',
                data: this.activityTypeStats.map(item => item.type)
              },
              yAxis: {
                type: 'value'
              },
              series: [{
                name: '活动数量',
                type: 'bar',
                data: this.activityTypeStats.map(item => item.count),
                itemStyle: {
                  color: '#4167b1'
                }
              }]
            });
          }
        });
      } catch(e) {
        console.error('加载活动类型统计失败:', e);
      }
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
.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  aspect-ratio: 1;
}

.stat-icon.members {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.activities {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.stat-icon.myJoin {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.card-link { 
  cursor: pointer; 
  transition: all 0.3s;
}

.card-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-content {
  text-align: center;
  padding: 20px;
}

.card-icon {
  font-size: 32px;
  color: #4167b1;
  margin-bottom: 8px;
}

.card-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}
</style>
