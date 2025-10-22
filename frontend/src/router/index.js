import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

Vue.use(Router);

const Login = () => import('@/views/login/index.vue');
const Dashboard = () => import('@/views/dashboard/index.vue');
const Dept = () => import('@/views/dept/index.vue');
const DeptDetail = () => import('@/views/dept/detail.vue');
const Member = () => import('@/views/member/index.vue');
const MemberDetail = () => import('@/views/member/detail.vue');
const Activity = () => import('@/views/activity/index.vue');
const ActivityDetail = () => import('@/views/activity/detail.vue');
const ActivityEdit = () => import('@/views/activity/edit.vue');
const Profile = () => import('@/views/profile/index.vue');
const Export = () => import('@/views/export/index.vue');

const router = new Router({
  mode: 'hash',
  routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/dept', name: 'Dept', component: Dept },
    { path: '/dept/:id', name: 'DeptDetail', component: DeptDetail },
    { path: '/member', name: 'Member', component: Member },
    { path: '/member/:id', name: 'MemberDetail', component: MemberDetail },
    { path: '/activity', name: 'Activity', component: Activity },
    { path: '/activity/:id', name: 'ActivityDetail', component: ActivityDetail },
    { path: '/activity/:id/edit', name: 'ActivityEdit', component: ActivityEdit },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/export', name: 'Export', component: Export }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') return next();
  
  const token = store.state.token;
  if (!token) {
    next('/login');
    return;
  }
  
  // 验证token有效性
  const isValid = await store.dispatch('validate');
  if (!isValid) {
    next('/login');
    return;
  }
  
  next();
});

export default router;
