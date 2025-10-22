<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">数据导出</h2>
      <p class="page-description">生成交接包，包含所有部门、成员、活动数据</p>
    </div>

    <el-row :gutter="20">
      <!-- 导出配置 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>导出配置</span>
          </div>
          <el-form :model="exportForm" label-width="100px">
            <el-form-item label="导出类型">
              <el-checkbox-group v-model="exportForm.types">
                <el-checkbox label="dept">部门信息</el-checkbox>
                <el-checkbox label="member">成员信息</el-checkbox>
                <el-checkbox label="activity">活动信息</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="时间范围">
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
            <el-form-item label="文件格式">
              <el-radio-group v-model="exportForm.format">
                <el-radio label="excel">Excel (.xlsx)</el-radio>
                <el-radio label="pdf">PDF (.pdf)</el-radio>
                <el-radio label="zip">压缩包 (.zip)</el-radio>
              </el-radio-group>
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
        types: ['dept', 'member', 'activity'],
        dateRange: [],
        format: 'excel',
        includeFiles: false
      },
      exportHistory: [],
      historyLoading: false,
      generating: false,
      showProgressDialog: false,
      exportProgress: 0,
      progressText: '准备中...',
      currentExportId: null
    };
  },
  created() {
    this.loadExportHistory();
  },
  methods: {
    async generateExport() {
      if (this.exportForm.types.length === 0) {
        return this.$message.warning('请选择至少一种导出类型');
      }

      this.generating = true;
      this.showProgressDialog = true;
      this.exportProgress = 0;
      this.progressText = '开始生成导出包...';

      try {
        const params = {
          types: this.exportForm.types,
          format: this.exportForm.format,
          includeFiles: this.exportForm.includeFiles
        };

        if (this.exportForm.dateRange && this.exportForm.dateRange.length === 2) {
          params.startDate = this.exportForm.dateRange[0];
          params.endDate = this.exportForm.dateRange[1];
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
        
        // 创建下载链接
        const blob = new Blob([res], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportRecord.fileName || `export_${exportRecord.id}.xlsx`;
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
        }
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
        types: ['dept', 'member', 'activity'],
        dateRange: [],
        format: 'excel',
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
</style>
