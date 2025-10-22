<template>
  <div class="app-container">
    <div class="toolbar" style="margin-bottom: 20px;">
      <el-input v-model="query.name" placeholder="姓名" clearable style="width:160px;" />
      <el-input v-model="query.stuId" placeholder="学号" clearable style="width:160px; margin-left:8px;" />
      <el-select v-model="query.deptId" placeholder="部门" clearable style="width:140px; margin-left:8px;">
        <el-option 
          v-for="dept in deptList" 
          :key="dept.id" 
          :label="dept.name" 
          :value="dept.id" 
        />
      </el-select>
      <el-select v-model="query.role" placeholder="角色" clearable style="width:140px; margin-left:8px;">
        <el-option label="社长" value="社长" />
        <el-option label="副社长" value="副社长" />
        <el-option label="部长" value="部长" />
        <el-option label="副部长" value="副部长" />
        <el-option label="干事" value="干事" />
        <el-option label="指导老师" value="指导老师" />
      </el-select>
      <el-button type="primary" @click="load" style="margin-left:8px;">查询</el-button>
      <div class="actions">
        <el-button type="success" @click="showImport=true" v-if="canEditMembers">批量导入</el-button>
        <el-button type="primary" @click="showAdd=true" v-if="canEditMembers">新增</el-button>
      </div>
    </div>

    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="stuId" label="学号">
        <template slot="header">
          <span>学号</span>
          <div class="sort-buttons">
            <i class="el-icon-caret-top" @click="sortBy('stu_id', 'asc')" :class="{ active: query.sortField === 'stu_id' && query.sortOrder === 'asc' }"></i>
            <i class="el-icon-caret-bottom" @click="sortBy('stu_id', 'desc')" :class="{ active: query.sortField === 'stu_id' && query.sortOrder === 'desc' }"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名">
        <template slot="header">
          <span>姓名</span>
          <div class="sort-buttons">
            <i class="el-icon-caret-top" @click="sortBy('name', 'asc')" :class="{ active: query.sortField === 'name' && query.sortOrder === 'asc' }"></i>
            <i class="el-icon-caret-bottom" @click="sortBy('name', 'desc')" :class="{ active: query.sortField === 'name' && query.sortOrder === 'desc' }"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="deptName" label="部门">
        <template slot-scope="scope">
          {{ scope.row.deptName || '未分配' }}
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="joinDate" label="入社时间">
        <template slot="header">
          <span>入社时间</span>
          <div class="sort-buttons">
            <i class="el-icon-caret-top" @click="sortBy('join_date', 'asc')" :class="{ active: query.sortField === 'join_date' && query.sortOrder === 'asc' }"></i>
            <i class="el-icon-caret-bottom" @click="sortBy('join_date', 'desc')" :class="{ active: query.sortField === 'join_date' && query.sortOrder === 'desc' }"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" v-if="canEditMembers">
        <template slot-scope="scope">
          <el-button type="text" @click="viewDetail(scope.row.id)">详情</el-button>
          <el-button type="text" @click="editMember(scope.row)">编辑</el-button>
          <el-button type="text" @click="remove(scope.row.id)" style="color: #f56c6c">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top:12px; text-align:right;">
      <el-pagination
        layout="prev, pager, next"
        :page-size="size"
        :current-page.sync="page"
        :total="total"
        @current-change="load"
      />
    </div>

    <el-dialog title="新增社员" :visible.sync="showAdd" width="520px">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="学号" prop="stuId"><el-input v-model="form.stuId" /></el-form-item>
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院" prop="college"><el-input v-model="form.college" /></el-form-item>
        <el-form-item label="专业" prop="major"><el-input v-model="form.major" /></el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="form.grade" style="width: 100%">
            <el-option label="大一" value="大一" />
            <el-option label="大二" value="大二" />
            <el-option label="大三" value="大三" />
            <el-option label="大四" value="大四" />
            <el-option label="研一" value="研一" />
            <el-option label="研二" value="研二" />
            <el-option label="研三" value="研三" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱" prop="email"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="form.deptId" style="width: 100%">
            <el-option 
              v-for="dept in deptList" 
              :key="dept.id" 
              :label="dept.name" 
              :value="dept.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="社长" value="社长" />
            <el-option label="副社长" value="副社长" />
            <el-option label="部长" value="部长" />
            <el-option label="副部长" value="副部长" />
            <el-option label="干事" value="干事" />
            <el-option label="指导老师" value="指导老师" />
          </el-select>
        </el-form-item>
        <el-form-item label="入社时间" prop="joinDate">
          <el-date-picker v-model="form.joinDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAdd=false">取 消</el-button>
        <el-button type="primary" @click="createMember">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog title="批量导入社员" :visible.sync="showImport" width="900px" :close-on-click-modal="false" :modal-append-to-body="true" top="5vh">
      <div class="import-content">
        <el-alert
          title="批量导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 16px;"
        >
          <div slot="description">
            <p><strong>导入步骤：</strong></p>
            <p>1. 点击"下载模板"按钮，下载Excel模板文件</p>
            <p>2. 按照模板格式填写社员信息（包含示例数据）</p>
            <p>3. 删除模板中的"说明"部分，只保留数据行</p>
            <p>4. 点击"选择文件"按钮，上传填写好的Excel文件</p>
            <p>5. 预览数据后确认导入</p>
            <p><strong>注意事项：</strong></p>
            <p>• 学号必须唯一，不能重复</p>
            <p>• 手机号必须是11位数字</p>
            <p>• 年级必须从下拉选项中选择（大一、大二、大三、大四、研一、研二、研三）</p>
            <p>• 部门ID请参考系统内的部门编号</p>
            <p>• 角色请选择：社长、副社长、部长、副部长、干事、指导老师</p>
          </div>
        </el-alert>
        
        <div class="import-actions">
          <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
          <el-upload
            ref="upload"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".xlsx,.xls"
            style="display: inline-block; margin-left: 16px;"
          >
            <el-button type="success">选择文件</el-button>
          </el-upload>
        </div>
        
        <div v-if="importFile" class="file-info">
          <p>已选择文件：{{ importFile.name }}</p>
          <el-button type="primary" @click="previewImport" :loading="previewLoading">预览导入</el-button>
        </div>
        
        <div v-if="previewData.length > 0" class="preview-section">
          <h4>导入预览</h4>
          <el-table :data="previewData.slice(0, 10)" style="width: 100%" max-height="300">
            <el-table-column prop="rowIndex" label="行号" width="60" />
            <el-table-column prop="stuId" label="学号" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="deptId" label="部门ID" />
            <el-table-column prop="role" label="角色" />
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.error ? 'danger' : 'success'">
                  {{ scope.row.error ? '错误' : '正常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="error" label="错误信息" min-width="200" v-if="previewData.some(item => item.error)">
              <template slot-scope="scope">
                <span style="color: #f56c6c;">{{ scope.row.error || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
          <p v-if="previewData.length > 10">... 还有 {{ previewData.length - 10 }} 条记录</p>
          <div class="preview-actions">
            <el-button @click="cancelImport">取消</el-button>
            <el-button type="primary" @click="confirmImport" :loading="importLoading">确认导入</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-empty v-if="!loading && list.length===0" description="暂无数据" />
  </div>
</template>

<script>
import { fetchMembers, addMember, deleteMember, fetchDepts, downloadMemberTemplate, previewMemberImport, confirmMemberImport } from '@/utils/api';
export default {
  data() {
    return {
      loading: false,
      list: [], page: 1, size: 10, total: 0,
      query: { name: '', stuId: '', deptId: null, role: '', sortField: '', sortOrder: '' },
      showAdd: false,
      showImport: false,
      deptList: [],
      form: { 
        stuId: '', name: '', gender: '', college: '', major: '', grade: '', 
        phone: '', email: '', deptId: 1, role: '干事', joinDate: '' 
      },
      importFile: null,
      previewData: [],
      previewLoading: false,
      importLoading: false,
      rules: {
        stuId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
        major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
        grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        joinDate: [{ required: true, message: '请选择入社时间', trigger: 'change' }]
      }
    };
  },
  computed: {
    canEditMembers() {
      return this.$store.getters.canEditMembers;
    }
  },
  created() { 
    this.load(); 
    this.loadDepts();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        const params = { ...this.query };
        const res = await fetchMembers(this.page, this.size, params);
        console.log('社员数据API响应:', res);
        const pageData = res && res.data ? res.data : {};
        this.list = pageData.records || [];
        this.total = pageData.total || 0;
        console.log('社员列表:', this.list);
      } catch (e) {
        console.error('加载社员数据失败:', e);
        this.$message.error('加载社员数据失败：' + (e.message || '未知错误'));
      } finally {
        this.loading = false;
      }
    },
    sortBy(field, order) {
      this.query.sortField = field;
      this.query.sortOrder = order;
      this.load();
    },
    async loadDepts() {
      try {
        const res = await fetchDepts();
        this.deptList = res.data || [];
      } catch (e) {
        this.$message.error('加载部门列表失败');
      }
    },
    async createMember() {
      try {
        await this.$refs.form.validate();
        await addMember(this.form);
        this.$message.success('新增成功');
        this.resetForm();
        this.showAdd = false;
        this.load();
      } catch (e) {
        if (e !== false) { // Not a form validation failure
          this.$message.error('新增失败');
        }
      }
    },
    async remove(id) {
      try {
        await this.$confirm('确定要删除该成员吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await deleteMember(id);
        this.$message.success('已删除');
        this.load();
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('删除失败');
        }
      }
    },
    viewDetail(id) {
      this.$router.push(`/member/${id}`);
    },
    editMember(member) {
      this.$router.push(`/member/${member.id}`);
    },
    resetForm() {
      this.form = { 
        stuId: '', name: '', gender: '', college: '', major: '', grade: '', 
        phone: '', email: '', deptId: 1, role: '干事', joinDate: '' 
      };
    },
    async downloadTemplate() {
      try {
        const res = await downloadMemberTemplate();
        // 创建下载链接
        const blob = new Blob([res], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'member_template.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.$message.success('模板下载成功');
      } catch (e) {
        this.$message.error('模板下载失败');
      }
    },
    handleFileChange(file) {
      this.importFile = file.raw;
    },
    async previewImport() {
      if (!this.importFile) {
        return this.$message.warning('请先选择文件');
      }
      this.previewLoading = true;
      try {
        const res = await previewMemberImport(this.importFile);
        this.previewData = res.data || [];
        if (this.previewData.length === 0) {
          this.$message.warning('文件中没有有效数据');
        }
      } catch (e) {
        this.$message.error('预览失败：' + (e.message || '未知错误'));
      } finally {
        this.previewLoading = false;
      }
    },
    cancelImport() {
      this.importFile = null;
      this.previewData = [];
      this.showImport = false;
    },
    async confirmImport() {
      if (this.previewData.length === 0) {
        return this.$message.warning('没有可导入的数据');
      }
      
      this.importLoading = true;
      try {
        const res = await confirmMemberImport(this.previewData);
        this.$message.success(res.message || '导入成功');
        this.cancelImport();
        this.load();
      } catch (e) {
        this.$message.error('导入失败：' + (e.message || '未知错误'));
      } finally {
        this.importLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.toolbar { display:flex; align-items:center; }
.actions { margin-left:auto; }

.sort-buttons {
  display: inline-flex;
  flex-direction: row;
  margin-left: 8px;
  vertical-align: middle;
}

.sort-buttons i {
  font-size: 12px;
  color: #c0c4cc;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}

.sort-buttons i:hover {
  color: #409eff;
}

.sort-buttons i.active {
  color: #409eff;
}

.import-content {
  padding: 16px 0;
}

.import-actions {
  margin-bottom: 16px;
}

.file-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-section {
  margin-top: 16px;
}

.preview-actions {
  margin-top: 16px;
  text-align: right;
}
</style>
