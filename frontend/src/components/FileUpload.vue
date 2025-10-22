<template>
  <div class="file-upload">
    <el-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :show-file-list="showFileList"
      :file-list="fileList"
      :accept="accept"
      :multiple="multiple"
      :limit="limit"
      :on-exceed="handleExceed"
      :disabled="uploading"
      :class="{ 'upload-disabled': uploading }"
    >
      <div class="upload-content">
        <i class="el-icon-upload" v-if="!uploading"></i>
        <i class="el-icon-loading" v-else></i>
        <div class="upload-text">
          <p v-if="!uploading">{{ uploadText }}</p>
          <p v-else>上传中... {{ uploadProgress }}%</p>
        </div>
        <div class="upload-hint" v-if="hint">{{ hint }}</div>
      </div>
    </el-upload>

    <!-- 文件预览 -->
    <div v-if="previewFiles.length > 0" class="file-preview">
      <h4>已上传文件：</h4>
      <div class="file-list">
        <div 
          v-for="(file, index) in previewFiles" 
          :key="index" 
          class="file-item"
        >
          <div class="file-info">
            <i :class="getFileIcon(file.type)" class="file-icon"></i>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="file-actions">
            <el-button 
              type="text" 
              size="small" 
              @click="previewFile(file)"
              v-if="isImage(file.type)"
            >
              预览
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="downloadFile(file)"
            >
              下载
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="removeFile(index)"
              style="color: #f56c6c"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog 
      title="图片预览" 
      :visible.sync="showPreviewDialog" 
      width="80%"
      center
    >
      <div class="image-preview">
        <img :src="previewImageUrl" alt="预览图片" style="max-width: 100%; max-height: 500px;" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FileUpload',
  props: {
    // 上传地址
    uploadUrl: {
      type: String,
      default: '/api/upload'
    },
    // 接受的文件类型
    accept: {
      type: String,
      default: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx'
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 文件数量限制
    limit: {
      type: Number,
      default: 5
    },
    // 文件大小限制（MB）
    maxSize: {
      type: Number,
      default: 10
    },
    // 上传提示文字
    uploadText: {
      type: String,
      default: '点击或拖拽文件到此处上传'
    },
    // 上传提示
    hint: {
      type: String,
      default: '支持 JPG/PNG/PDF/DOC 格式，单个文件不超过 10MB'
    },
    // 是否显示文件列表
    showFileList: {
      type: Boolean,
      default: true
    },
    // 初始文件列表
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fileList: [],
      previewFiles: [...this.value],
      uploading: false,
      uploadProgress: 0,
      showPreviewDialog: false,
      previewImageUrl: ''
    };
  },
  computed: {
    uploadHeaders() {
      const token = this.$store.state.token;
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    uploadData() {
      return {
        // 可以添加额外的上传参数
        type: 'general'
      };
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.previewFiles = [...newVal];
      },
      deep: true
    }
  },
  methods: {
    beforeUpload(file) {
      // 检查文件类型
      const allowedTypes = this.accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        this.$message.error(`不支持的文件类型：${fileExtension}`);
        return false;
      }

      // 检查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < this.maxSize;
      if (!isLtMaxSize) {
        this.$message.error(`文件大小不能超过 ${this.maxSize}MB`);
        return false;
      }

      this.uploading = true;
      this.uploadProgress = 0;
      return true;
    },
    handleSuccess(response, file, fileList) {
      this.uploading = false;
      this.uploadProgress = 100;
      
      if (response.code === 200) {
        const uploadedFile = {
          id: response.data.id,
          name: file.name,
          url: response.data.url,
          type: file.type,
          size: file.size
        };
        
        this.previewFiles.push(uploadedFile);
        this.$emit('input', this.previewFiles);
        this.$emit('success', uploadedFile);
        this.$message.success('上传成功');
      } else {
        this.$message.error(response.message || '上传失败');
      }
    },
    handleError(error, file, fileList) {
      this.uploading = false;
      this.uploadProgress = 0;
      this.$message.error('上传失败：' + (error.message || '网络错误'));
    },
    handleProgress(event, file, fileList) {
      this.uploadProgress = Math.round(event.percent);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`最多只能上传 ${this.limit} 个文件`);
    },
    removeFile(index) {
      this.previewFiles.splice(index, 1);
      this.$emit('input', this.previewFiles);
      this.$emit('remove', index);
    },
    previewFile(file) {
      if (this.isImage(file.type)) {
        this.previewImageUrl = file.url;
        this.showPreviewDialog = true;
      } else {
        this.$message.info('该文件类型不支持预览');
      }
    },
    downloadFile(file) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    isImage(type) {
      return type && type.startsWith('image/');
    },
    getFileIcon(type) {
      if (this.isImage(type)) return 'el-icon-picture';
      if (type && type.includes('pdf')) return 'el-icon-document';
      if (type && type.includes('word')) return 'el-icon-document';
      if (type && type.includes('excel') || type && type.includes('sheet')) return 'el-icon-document';
      return 'el-icon-document';
    },
    formatFileSize(size) {
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
};
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-content {
  text-align: center;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.upload-content:hover {
  border-color: #409eff;
}

.upload-disabled .upload-content {
  border-color: #c0c4cc;
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.upload-content i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
  display: block;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.file-preview {
  margin-top: 20px;
}

.file-preview h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.file-list {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-icon {
  font-size: 20px;
  color: #409eff;
  margin-right: 12px;
}

.file-name {
  font-size: 14px;
  color: #333;
  margin-right: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.image-preview {
  text-align: center;
}
</style>
