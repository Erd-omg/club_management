<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    :width="dialogWidth"
    :fullscreen="isMobile"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :center="center"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    :modal="modal"
    :lock-scroll="lockScroll"
    :custom-class="customClass"
    :top="top"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="dialog-content" :class="{ 'mobile-content': isMobile }">
      <slot />
    </div>
    
    <div slot="footer" class="dialog-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ResponsiveDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '50%'
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    beforeClose: {
      type: Function,
      default: null
    },
    center: {
      type: Boolean,
      default: false
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    modal: {
      type: Boolean,
      default: true
    },
    lockScroll: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: ''
    },
    top: {
      type: String,
      default: '15vh'
    }
  },
  data() {
    return {
      isMobile: false
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    dialogWidth() {
      if (this.isMobile) {
        return '100%';
      }
      return this.width;
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
    handleBeforeClose(done) {
      if (this.beforeClose) {
        this.beforeClose(done);
      } else {
        done();
      }
    }
  }
};
</script>

<style scoped>
.dialog-content {
  padding: 0;
}

.mobile-content {
  padding: 16px 0;
}

.dialog-footer {
  text-align: right;
}

/* 移动端对话框优化 */
@media (max-width: 768px) {
  .dialog-footer {
    padding: 16px 20px;
    border-top: 1px solid #e4e7ed;
    background: #fafafa;
  }
  
  .dialog-footer .el-button {
    width: 100%;
    margin: 0 0 8px 0;
  }
  
  .dialog-footer .el-button + .el-button {
    margin-left: 0;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .dialog-content {
    padding: 8px 0;
  }
}

/* 大屏优化 */
@media (min-width: 1200px) {
  .dialog-content {
    padding: 16px 0;
  }
}
</style>
