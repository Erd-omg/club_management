<template>
  <div class="app-container">
    <div class="toolbar" style="margin-bottom: 20px;">
      <div class="actions">
        <el-button type="primary" @click="showAdd=true">新增部门</el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="6" v-for="d in list" :key="d.id">
        <el-card class="dept-card" @click.native="$router.push(`/dept/${d.id}`)">
          <div class="dept-name">{{ d.name }}</div>
          <div class="dept-intro">{{ d.intro || '暂无简介' }}</div>
          <div class="dept-meta">成员数：{{ d.memberCount != null ? d.memberCount : '-' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog title="新增部门" :visible.sync="showAdd" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="简介"><el-input type="textarea" :rows="4" v-model="form.intro" /></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAdd=false">取 消</el-button>
        <el-button type="primary" @click="createDept">确 定</el-button>
      </span>
    </el-dialog>

    <el-empty v-if="!loading && list.length===0" description="暂无数据" />
  </div>
</template>

<script>
import { fetchDeptCards, fetchDepts, addDept } from '@/utils/api';
export default {
  data() {
    return {
      loading: false,
      list: [],
      showAdd: false,
      form: { name: '', intro: '' }
    };
  },
  created() { this.load(); },
  methods: {
    normalizeList(arr) {
      if (!Array.isArray(arr)) return [];
      return arr.map(x => ({
        id: x.id,
        name: x.name || x.deptName || '',
        intro: x.intro || x.description || '',
        memberCount: x.memberCount != null ? x.memberCount : (x.count != null ? x.count : undefined)
      }));
    },
    async load() {
      this.loading = true;
      try {
        // 首选 /dept/cards（含成员数、简介）
        const res = await fetchDeptCards();
        const payload = res && (Array.isArray(res) ? res : res.data);
        if (Array.isArray(payload)) {
          this.list = this.normalizeList(payload);
        } else {
          // 若返回不是数组，降级到 /dept/list
          const res2 = await fetchDepts();
          const payload2 = res2 && (Array.isArray(res2) ? res2 : res2.data);
          this.list = this.normalizeList(payload2 || []);
        }
      } catch (e) {
        // 401 或 404 等错误时提示并清空
        this.$message.error((e && e.message) || '部门数据加载失败');
        try {
          const res2 = await fetchDepts();
          const payload2 = res2 && (Array.isArray(res2) ? res2 : res2.data);
          this.list = this.normalizeList(payload2 || []);
        } catch {
          this.list = [];
        }
      } finally {
        this.loading = false;
      }
    },
    async createDept() {
      if (!this.form.name) return this.$message.warning('请输入名称');
      await addDept({ name: this.form.name, intro: this.form.intro });
      this.$message.success('新增成功');
      this.form = { name: '', intro: '' };
      this.showAdd = false;
      this.load();
    }
  }
};
</script>

<style scoped>
.toolbar { display:flex; align-items:center; }
.actions { margin-left:auto; }
.dept-card { cursor: pointer; margin-bottom: 16px; }
.dept-name { font-size: 18px; color: #4167b1; font-weight: 600; }
.dept-intro { color: #666; margin-top: 6px; min-height: 40px; }
.dept-meta { color: #999; margin-top: 8px; }
</style>
