<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">数据导出</h2>
      <p class="page-description">生成交接包，包含所有部门、成员、活动数据</p>
    </div>

    <!-- 功能说明 -->
    <el-alert
      title="功能说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <div style="line-height: 1.8;">
        <p><strong>导出类型：</strong></p>
        <ul style="margin: 8px 0 8px 20px;">
          <li><strong>部门信息：</strong>导出所有部门的基本信息、成员数量、负责人联系方式</li>
          <li><strong>成员信息：</strong>可按部门筛选导出成员档案，支持多部门选择</li>
          <li><strong>活动信息：</strong>可按时间范围筛选导出活动记录</li>
        </ul>
        <p><strong>导出格式：</strong></p>
        <ul style="margin: 8px 0 8px 20px;">
          <li>单选类型：导出Excel格式文件（.xlsx）</li>
          <li>多选类型：导出ZIP压缩包，包含多个Excel文件</li>
        </ul>
        <p><strong>权限说明：</strong>部长和副部长只能导出本部门成员信息</p>
      </div>
    </el-alert>

    <el-row :gutter="20">
      <!-- 导出配置 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>导出配置</span>
          </div>
          <el-form :model="exportForm" label-width="100px">
            <el-form-item label="导出类型">
              <el-checkbox-group v-model="exportForm.types" @change="handleTypeChange">
                <el-checkbox label="dept">部门信息</el-checkbox>
                <el-checkbox label="member">成员信息</el-checkbox>
                <el-checkbox label="activity">活动信息</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="时间范围" v-if="showDateRange">
              <el-date-picker
                v-model="exportForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="选择部门" v-if="showDeptSelect">
              <div style="display: flex; gap: 8px; align-items: center;">
                <el-select
                  v-model="exportForm.deptIds"
                  multiple
                  placeholder="请选择部门（可多选）"
                  style="flex: 1"
                >
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.id"
                  />
                </el-select>
                <el-button size="small" @click="selectAllDepts">全选</el-button>
                <el-button size="small" @click="clearDepts">清空</el-button>
              </div>
            </el-form-item>
            <el-form-item label="导出说明">
              <div class="export-tip">
                <i class="el-icon-info"></i>
                <span v-if="!isMultiSelect">单选类型将导出Excel格式</span>
                <span v-else>多选类型将导出ZIP格式（包含Excel文件）</span>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="generateExport" 
                :loading="generating"
                :disabled="exportForm.types.length === 0"
              >
                生成导出包
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 导出历史 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>导出历史</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="loadExportHistory">
              <i class="el-icon-refresh"></i> 刷新
            </el-button>
          </div>
          <el-table :data="exportHistory" v-loading="historyLoading" style="width: 100%">
            <el-table-column prop="fileName" label="文件名" min-width="150" />
            <el-table-column prop="format" label="格式" width="80">
              <template slot-scope="scope">
                <el-tag :type="getFormatType(scope.row.format)" size="small">
                  {{ scope.row.format.toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fileSize" label="大小" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button 
                  v-if="scope.row.status === 'completed'" 
                  type="text" 
                  @click="downloadFile(scope.row)"
                >
                  下载
                </el-button>
                <el-button 
                  type="text" 
                  @click="deleteExport(scope.row.id)"
                  style="color: #f56c6c"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!historyLoading && exportHistory.length === 0" description="暂无导出记录" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 导出进度对话框 -->
    <el-dialog 
      title="导出进度" 
      :visible.sync="showProgressDialog" 
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="progress-content">
        <el-progress 
          :percentage="Math.max(0, Math.min(100, exportProgress))" 
          :status="getProgressStatus()"
        />
        <p class="progress-text">{{ progressText }}</p>
        <div v-if="exportProgress === 100" class="progress-actions">
          <el-button type="primary" @click="downloadCurrentFile">下载文件</el-button>
          <el-button @click="closeProgressDialog">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { generateExportPackage, getExportHistory, downloadExportFile, deleteExportFile } from '@/utils/api';

export default {
  name: 'Export',
  data() {
    return {
      exportForm: {
        types: ['dept'],
        dateRange: [],
        deptIds: [],
        includeFiles: false
      },
      deptList: [],
      exportHistory: [],
      historyLoading: false,
      generating: false,
      showProgressDialog: false,
      exportProgress: 0,
      progressText: '准备中...',
      currentExportId: null
    };
  },
  computed: {
    isMultiSelect() {
      return this.exportForm.types.length > 1;
    },
    selectedExportType() {
      return this.exportForm.types.length === 1 ? this.exportForm.types[0] : null;
    },
    showDateRange() {
      // 单选活动信息，或多选包含活动信息时显示时间范围
      return this.exportForm.types.includes('activity');
    },
    showDeptSelect() {
      // 单选成员信息，或多选包含成员信息时显示部门选择
      return this.exportForm.types.includes('member');
    }
  },
  created() {
    this.loadExportHistory();
    this.loadDepts();
  },
  methods: {
    handleTypeChange() {
      // 类型选择变化时，清空时间和部门选择
      this.exportForm.dateRange = [];
      this.exportForm.deptIds = [];
    },
    async loadDepts() {
      try {
        const { fetchDepts } = await import('@/utils/api');
        const res = await fetchDepts();
        const allDepts = res.data || [];
        
        // 根据用户角色过滤部门列表
        const user = this.$store.state.user;
        if (user && (user.role === '部长' || user.role === '副部长')) {
          // 部长和副部长只能看到本部门
          this.deptList = allDepts.filter(dept => dept.id === user.deptId);
        } else {
          // 社长、副社长、指导老师可以看到所有部门
          this.deptList = allDepts;
        }
      } catch (e) {
        console.error('加载部门列表失败:', e);
      }
    },
    selectAllDepts() {
      this.exportForm.deptIds = this.deptList.map(dept => dept.id);
    },
    clearDepts() {
      this.exportForm.deptIds = [];
    },
    async generateExport() {
      if (this.exportForm.types.length === 0) {
        return this.$message.warning('请选择导出类型');
      }
      
      // 根据选择类型自动确定导出格式
      const format = this.isMultiSelect ? 'zip' : 'excel';

      this.generating = true;
      this.showProgressDialog = true;
      this.exportProgress = 0;
      this.progressText = '开始生成导出包...';

      try {
        const params = {
          types: this.exportForm.types,
          format: format,
          includeFiles: this.exportForm.includeFiles
        };

        // 如果包含活动信息，需要时间范围
        if (this.showDateRange && this.exportForm.dateRange && this.exportForm.dateRange.length === 2) {
          params.startDate = this.exportForm.dateRange[0];
          params.endDate = this.exportForm.dateRange[1];
        }
        
        // 如果包含成员信息，需要部门筛选
        if (this.showDeptSelect && this.exportForm.deptIds && this.exportForm.deptIds.length > 0) {
          params.deptIds = this.exportForm.deptIds;
        }

        // 模拟进度更新
        const progressInterval = setInterval(() => {
          if (this.exportProgress < 90) {
            this.exportProgress += Math.random() * 20;
            this.progressText = `正在处理数据... ${this.exportProgress.toFixed(2)}%`;
          }
        }, 500);

        const res = await generateExportPackage(params);
        clearInterval(progressInterval);
        
        this.exportProgress = 100;
        this.progressText = '导出完成！';
        
        // 检查返回数据结构
        // 由于request.js的响应拦截器返回response.data，所以res就是后端返回的完整响应
        if (res && res.data && res.data.id) {
          this.currentExportId = res.data.id;
        } else if (res && res.id) {
          this.currentExportId = res.id;
        } else {
          console.error('导出返回数据格式错误:', res);
          this.$message.error('导出返回数据格式错误');
          this.closeProgressDialog();
          return;
        }
        
        this.$message.success('导出包生成成功');
        this.loadExportHistory();
      } catch (e) {
        console.error('导出错误:', e);
        this.$message.error('导出失败：' + (e.message || '未知错误'));
        this.closeProgressDialog();
      } finally {
        this.generating = false;
      }
    },
    async loadExportHistory() {
      this.historyLoading = true;
      try {
        const res = await getExportHistory();
        this.exportHistory = res.data || [];
      } catch (e) {
        this.$message.error('加载导出历史失败');
      } finally {
        this.historyLoading = false;
      }
    },
    async downloadFile(exportRecord) {
      try {
        this.$message.info('正在准备下载...');
        const res = await downloadExportFile(exportRecord.id);
        
        // 根据文件格式确定MIME类型
        const mimeType = exportRecord.format === 'zip' 
          ? 'application/zip' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
        // 获取blob数据 - response拦截器返回的是response对象，需要取data
        const blobData = res.data || res;
        
        // 创建下载链接
        const blob = new Blob([blobData], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportRecord.fileName || `export_${exportRecord.id}.${exportRecord.format === 'zip' ? 'zip' : 'xlsx'}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.$message.success('文件下载成功！请检查浏览器下载文件夹');
      } catch (e) {
        console.error('下载错误:', e);
        this.$message.error('下载失败：' + (e.message || '未知错误'));
      }
    },
    async downloadCurrentFile() {
      if (this.currentExportId) {
        const exportRecord = this.exportHistory.find(item => item.id === this.currentExportId);
        if (exportRecord) {
          await this.downloadFile(exportRecord);
        } else {
          this.$message.error('找不到导出记录，请重新生成导出包');
        }
      } else {
        this.$message.error('没有可下载的文件，请先生成导出包');
      }
    },
    async deleteExport(exportId) {
      try {
        await this.$confirm('确定要删除这个导出文件吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await deleteExportFile(exportId);
        this.$message.success('删除成功');
        this.loadExportHistory();
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('删除失败');
        }
      }
    },
    resetForm() {
      this.exportForm = {
        types: ['dept'],
        dateRange: [],
        deptIds: [],
        includeFiles: false
      };
    },
    closeProgressDialog() {
      this.showProgressDialog = false;
      this.exportProgress = 0;
      this.progressText = '准备中...';
      this.currentExportId = null;
    },
    getFormatType(format) {
      const types = { excel: 'success', pdf: 'warning', zip: 'info' };
      return types[format] || 'info';
    },
    getStatusType(status) {
      const types = { 
        pending: 'warning', 
        processing: 'primary', 
        completed: 'success', 
        failed: 'danger' 
      };
      return types[status] || 'info';
    },
    getStatusText(status) {
      const texts = { 
        pending: '等待中', 
        processing: '处理中', 
        completed: '已完成', 
        failed: '失败' 
      };
      return texts[status] || '未知';
    },
    getProgressStatus() {
      if (this.exportProgress === 100) {
        return 'success';
      } else if (this.exportProgress < 0) {
        return 'exception';
      } else {
        return undefined;
      }
    }
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.form-tip {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}

.progress-content {
  text-align: center;
  padding: 20px 0;
}

.progress-text {
  margin: 16px 0;
  color: #666;
}

.progress-actions {
  margin-top: 20px;
}

.export-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.export-tip i {
  margin-right: 4px;
}
</style>
