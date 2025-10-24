import Vue from 'vue';
import Vuex from 'vuex';
import { login, validateToken } from '@/utils/api';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
  },
  getters: {
    isAuthenticated: state => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission) || (state.user && state.user.role === '社长');
    },
    canEditMembers: (state) => {
      return state.user && ['社长', '副社长', '部长', '副部长', '指导老师'].includes(state.user.role);
    },
    canApproveActivities: (state) => {
      return state.user && ['社长', '副社长', '指导老师'].includes(state.user.role);
    },
    canManageDepts: (state) => {
      return state.user && ['社长', '副社长'].includes(state.user.role);
    },
    canExportData: (state) => {
      return state.user && ['社长', '副社长', '部长', '副部长', '指导老师'].includes(state.user.role);
    },
    canViewAll: (state) => {
      return state.user && ['社长', '副社长', '指导老师'].includes(state.user.role);
    },
    canViewDept: (state) => {
      return state.user && ['社长', '副社长', '部长', '副部长', '指导老师'].includes(state.user.role);
    },
    canEditDeptMembers: (state) => {
      return state.user && ['社长', '副社长', '部长'].includes(state.user.role);
    },
    canManageDeptActivities: (state) => {
      return state.user && ['社长', '副社长', '部长'].includes(state.user.role);
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    },
    SET_USER(state, user) {
      state.user = user;
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
      localStorage.setItem('permissions', JSON.stringify(permissions));
    }
  },
  actions: {
    async doLogin({ commit }, { stuId, password }) {
      const res = await login({ stuId, password });
      console.log('登录响应:', res);
      
      // 检查响应格式
      if (!res || res.code !== 200) {
        throw new Error(res && res.message || '登录失败');
      }
      
      const { token, user } = res.data;
      if (!token || !user) {
        throw new Error('登录响应数据格式错误');
      }
      
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      
      // 根据角色设置权限
      const rolePermissions = {
        '社长': ['*'], // 全权限
        '副社长': ['view_all', 'edit_members', 'manage_activities', 'approve_activities', 'export_data', 'manage_depts'],
        '部长': ['view_dept', 'edit_dept_members', 'manage_dept_activities', 'export_data'],
        '副部长': ['view_dept', 'export_data'],
        '干事': ['view_self', 'edit_self'],
        '指导老师': ['view_all', 'approve_activities', 'export_data']
      };
      const permissions = rolePermissions[user.role] || [];
      commit('SET_PERMISSIONS', permissions);
      
      return user;
    },
    async validate({ state, commit }) {
      if (!state.token) return false;
      try {
        const res = await validateToken();
        if (res.data && res.data.user) {
          commit('SET_USER', res.data.user);
          const permissions = this.getters.getRolePermissions(res.data.user.role);
          commit('SET_PERMISSIONS', permissions);
        }
        return true;
      } catch (e) {
        commit('SET_TOKEN', '');
        commit('SET_USER', null);
        commit('SET_PERMISSIONS', []);
        return false;
      }
    },
    logout({ commit }) {
      commit('SET_TOKEN', '');
      commit('SET_USER', null);
      commit('SET_PERMISSIONS', []);
    },
      getRolePermissions(_, role) {
        const rolePermissions = {
          '社长': ['*'], // 全权限
          '副社长': ['view_all', 'edit_members', 'manage_activities', 'approve_activities', 'export_data', 'manage_depts'],
          '部长': ['view_dept', 'edit_dept_members', 'manage_dept_activities', 'export_data'],
          '副部长': ['view_dept', 'export_data'],
          '干事': ['view_self', 'edit_self'],
          '指导老师': ['view_all', 'approve_activities', 'export_data']
        };
        return rolePermissions[role] || [];
      }
  }
});
