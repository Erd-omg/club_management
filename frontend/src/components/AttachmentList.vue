<template>
  <div class="attachment-list">
    <el-table :data="attachments" border v-loading="loading">
      <el-table-column prop="originalName" label="文件名" min-width="250">
        <template slot-scope="scope">
          <i :class="getFileIcon(scope.row.fileExt)" style="margin-right: 8px; font-size: 18px;"></i>
          {{ scope.row.originalName }}
        </template>
      </el-table-column>
      <el-table-column prop="sizeText" label="大小" width="100" />
      <el-table-column prop="uploadByName" label="上传人" width="120" />
      <el-table-column prop="uploadTime" label="上传时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <div v-if="isPreviewable(scope.row.fileExt)" style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; gap: 5px;">
              <el-button size="mini" @click="handlePreview(scope.row)">预览</el-button>
              <el-button size="mini" @click="handleDownload(scope.row)">下载</el-button>
            </div>
            <div style="display: flex; gap: 5px;" v-if="scope.row.canDelete">
              <el-button 
                size="mini" 
                type="danger" 
                @click="handleDelete(scope.row)"
                style="width: 60px;"
              >
                删除
              </el-button>
            </div>
          </div>
          <div v-else style="display: flex; gap: 5px;">
            <el-button size="mini" @click="handleDownload(scope.row)">下载</el-button>
            <el-button 
              v-if="scope.row.canDelete" 
              size="mini" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 预览对话框 -->
    <el-dialog title="文件预览" :visible.sync="previewVisible" width="80%" top="5vh">
      <div style="text-align: center;">
        <img v-if="previewType === 'image'" :src="previewUrl" style="max-width: 100%; max-height: 70vh;" />
        <iframe v-else-if="previewType === 'pdf'" :src="previewUrl" style="width: 100%; height: 70vh; border: none;"></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAttachmentList, downloadAttachment, previewAttachment, deleteAttachment } from '@/utils/api';

export default {
  name: 'AttachmentList',
  props: {
    activityId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      attachments: [],
      loading: false,
      previewVisible: false,
      previewUrl: '',
      previewType: ''
    };
  },
  mounted() {
    this.loadAttachments();
  },
  methods: {
    async loadAttachments() {
      this.loading = true;
      try {
        const res = await getAttachmentList(this.activityId);
        this.attachments = res.data || [];
      } catch (e) {
        this.$message.error('加载附件列表失败');
      } finally {
        this.loading = false;
      }
    },
    getFileIcon(ext) {
      const iconMap = {
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'xls': 'el-icon-s-grid',
        'xlsx': 'el-icon-s-grid',
        'ppt': 'el-icon-present',
        'pptx': 'el-icon-present',
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'zip': 'el-icon-folder-opened',
        'rar': 'el-icon-folder-opened'
      };
      const lowerExt = ext ? ext.toLowerCase() : '';
      return iconMap[lowerExt] || 'el-icon-document';
    },
    isPreviewable(ext) {
      const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
      const lowerExt = ext ? ext.toLowerCase() : '';
      return previewableTypes.includes(lowerExt);
    },
    async handlePreview(attachment) {
      try {
        const res = await previewAttachment(this.activityId, attachment.id);
        // res是完整的response对象
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        
        this.previewUrl = url;
        const lowerExt = attachment.fileExt ? attachment.fileExt.toLowerCase() : '';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(lowerExt)) {
          this.previewType = 'image';
        } else if (lowerExt === 'pdf') {
          this.previewType = 'pdf';
        }
        this.previewVisible = true;
      } catch (e) {
        this.$message.error('预览失败');
      }
    },
    async handleDownload(attachment) {
      try {
        const res = await downloadAttachment(this.activityId, attachment.id);
        // res是完整的response对象
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.$message.success('下载成功');
      } catch (e) {
        this.$message.error('下载失败');
      }
    },
    async handleDelete(attachment) {
      this.$confirm('确定要删除此附件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteAttachment(this.activityId, attachment.id);
          this.$message.success('删除成功');
          this.loadAttachments();
        } catch (e) {
          this.$message.error('删除失败');
        }
      });
    }
  }
};
</script>

<style scoped>
.attachment-list {
  margin-top: 20px;
}
</style>

