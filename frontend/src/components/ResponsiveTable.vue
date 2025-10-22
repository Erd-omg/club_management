<template>
  <div class="responsive-table">
    <!-- 桌面端表格 -->
    <el-table 
      v-if="!isMobile"
      :data="data" 
      v-loading="loading"
      style="width: 100%"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot />
    </el-table>

    <!-- 移动端卡片列表 -->
    <div v-else class="mobile-list">
      <div 
        v-for="(item, index) in data" 
        :key="index"
        class="mobile-card"
        @click="handleRowClick(item, index)"
      >
        <div class="card-content">
          <slot name="mobile" :row="item" :index="index">
            <!-- 默认移动端显示 -->
            <div class="card-header">
              <h4>{{ getDisplayValue(item, titleField) }}</h4>
              <el-tag v-if="statusField && item[statusField]" :type="getStatusType(item[statusField])">
                {{ getStatusText(item[statusField]) }}
              </el-tag>
            </div>
            <div class="card-body">
              <div 
                v-for="field in mobileFields" 
                :key="field.key"
                class="field-item"
              >
                <span class="field-label">{{ field.label }}：</span>
                <span class="field-value">{{ getDisplayValue(item, field.key) }}</span>
              </div>
            </div>
          </slot>
        </div>
        <div class="card-actions" v-if="$slots.actions">
          <slot name="actions" :row="item" :index="index" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && (!data || data.length === 0)" :description="emptyText" />

    <!-- 分页 -->
    <div v-if="showPagination && total > 0" class="pagination-wrapper">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper'"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponsiveTable',
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 移动端显示的字段配置
    mobileFields: {
      type: Array,
      default: () => []
    },
    // 标题字段
    titleField: {
      type: String,
      default: 'name'
    },
    // 状态字段
    statusField: {
      type: String,
      default: ''
    },
    // 空状态文本
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: false
    },
    // 当前页
    currentPage: {
      type: Number,
      default: 1
    },
    // 每页大小
    pageSize: {
      type: Number,
      default: 10
    },
    // 总条数
    total: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isMobile: false
    };
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
    handleRowClick(row, index) {
      this.$emit('row-click', row, index);
    },
    handlePageChange(page) {
      this.$emit('page-change', page);
    },
    handleSizeChange(size) {
      this.$emit('size-change', size);
    },
    getDisplayValue(item, field) {
      if (!field) return '';
      const keys = field.split('.');
      let value = item;
      for (const key of keys) {
        value = value && value[key];
      }
      return value || '-';
    },
    getStatusType(status) {
      const types = { 
        0: 'warning', 
        1: 'success', 
        2: 'danger',
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      };
      return types[status] || 'info';
    },
    getStatusText(status) {
      const texts = { 
        0: '待审批', 
        1: '已通过', 
        2: '已驳回',
        'pending': '待审批',
        'approved': '已通过',
        'rejected': '已驳回'
      };
      return texts[status] || '未知';
    }
  }
};
</script>

<style scoped>
.responsive-table {
  width: 100%;
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.mobile-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.field-label {
  color: #666;
  min-width: 60px;
  flex-shrink: 0;
}

.field-value {
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

/* 移动端分页优化 */
@media (max-width: 768px) {
  .pagination-wrapper {
    padding: 0 16px;
  }
  
  .mobile-card {
    margin: 0 16px;
  }
  
  .mobile-list {
    padding: 0;
  }
}
</style>
