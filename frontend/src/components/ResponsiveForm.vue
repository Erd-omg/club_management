<template>
  <div class="responsive-form">
    <el-form 
      :model="form" 
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      ref="form"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot />
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ResponsiveForm',
  props: {
    form: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    labelPosition: {
      type: String,
      default: 'right'
    }
  },
  data() {
    return {
      isMobile: false
    };
  },
  computed: {
    computedLabelWidth() {
      return this.isMobile ? '80px' : this.labelWidth;
    },
    computedLabelPosition() {
      return this.isMobile ? 'top' : this.labelPosition;
    }
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth < 768;
    },
    handleResize() {
      this.checkScreenSize();
    },
    validate(callback) {
      return this.$refs.form.validate(callback);
    },
    validateField(prop, callback) {
      return this.$refs.form.validateField(prop, callback);
    },
    resetFields() {
      return this.$refs.form.resetFields();
    },
    clearValidate(props) {
      return this.$refs.form.clearValidate(props);
    }
  }
};
</script>

<style scoped>
.responsive-form {
  width: 100%;
}

/* 移动端表单优化 */
@media (max-width: 768px) {
  .responsive-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .responsive-form :deep(.el-form-item__label) {
    line-height: 1.4;
    margin-bottom: 8px;
  }
  
  .responsive-form :deep(.el-input__inner),
  .responsive-form :deep(.el-textarea__inner) {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .responsive-form :deep(.el-button) {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .responsive-form :deep(.el-button + .el-button) {
    margin-left: 0;
  }
  
  .responsive-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .responsive-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

/* 大屏优化 */
@media (min-width: 1200px) {
  .responsive-form :deep(.el-form-item) {
    margin-bottom: 22px;
  }
}
</style>
