<template>
  <div class="attachment-upload">
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-remove="handleRemove"
      :auto-upload="false"
      multiple
      drag
      ref="upload"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">
        支持Office文档、PDF、图片、压缩包，单个文件不超过10MB
      </div>
    </el-upload>
    
    <div style="margin-top: 10px;">
      <el-button size="small" type="primary" @click="submitUpload">上传</el-button>
      <el-button size="small" @click="clearFiles">清空列表</el-button>
    </div>
  </div>
</template>

<script>
import { uploadAttachment } from '@/utils/api';
import request from '@/utils/request';

export default {
  name: 'AttachmentUpload',
  props: {
    activityId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      fileList: [],
      uploadUrl: '',
      headers: {}
    };
  },
  mounted() {
    this.initHeaders();
  },
  methods: {
    initHeaders() {
      const token = localStorage.getItem('token');
      this.headers = {
        'Authorization': `Bearer ${token}`
      };
    },
    beforeUpload(file) {
      // 不再验证，让文件添加到列表
      return true;
    },
    handleChange(file, fileList) {
      // 验证文件
      const isAllowed = this.checkFileType(file.name);
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isAllowed) {
        this.$message.error('不支持的文件类型！');
        this.$refs.upload.handleRemove(file);
        return;
      }
      if (!isLt10M) {
        this.$message.error('单个文件大小不能超过10MB！');
        this.$refs.upload.handleRemove(file);
        return;
      }
      
      this.fileList = fileList;
    },
    checkFileType(filename) {
      const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];
      const ext = filename.split('.').pop().toLowerCase();
      return allowedTypes.includes(ext);
    },
    async submitUpload() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先选择文件');
        return;
      }

      const formData = new FormData();
      this.fileList.forEach(file => {
        formData.append('files', file.raw || file);
      });

      try {
        const res = await uploadAttachment(this.activityId, formData);
        this.$message.success('上传成功');
        this.$emit('upload-success', res.data);
        this.clearFiles();
      } catch (e) {
        const errorMsg = (e.response && e.response.data && e.response.data.message) || e.message || '未知错误';
        this.$message.error('上传失败：' + errorMsg);
      }
    },
    handleSuccess(response, file, fileList) {
      // 手动上传模式下不使用此回调
    },
    handleError(err, file, fileList) {
      this.$message.error('上传失败');
    },
    handleProgress(event, file, fileList) {
      // 手动上传模式下不使用此回调
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    clearFiles() {
      this.$refs.upload.clearFiles();
      this.fileList = [];
    }
  }
};
</script>

<style scoped>
.attachment-upload {
  margin-bottom: 20px;
}
</style>

