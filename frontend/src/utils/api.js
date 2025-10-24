import request from './request';

export function login({ stuId, password }) {
  return request({ url: '/auth/login', method: 'post', data: { stuId, password } });
}

export function validateToken() {
  return request({ url: '/auth/validate', method: 'get' });
}

// Dept
export const fetchDepts = (params={}) => request({ url: '/dept/list', method: 'get', params });
export const fetchDeptCards = () => request({ url: '/dept/cards', method: 'get' });
export const getDeptDetail = id => request({ url: `/dept/detail/${id}`, method: 'get' });
export const addDept = data => request({ url: '/dept/add', method: 'post', data });
export const updateDept = data => request({ url: '/dept/update', method: 'put', data });
export const deleteDept = id => request({ url: `/dept/delete/${id}`, method: 'delete' });

// Member
export const fetchMembers = (page=1, size=10, params={}) => request({ url: `/member/page`, method: 'get', params: { page, size, ...params } });
export const addMember = data => request({ url: '/member/add', method: 'post', data });
export const updateMember = data => request({ url: '/member/update', method: 'put', data });
export const deleteMember = id => request({ url: `/member/delete/${id}`, method: 'delete' });
export const getMemberDetail = id => request({ url: `/member/detail/${id}`, method: 'get' });
export const getMemberActivities = id => request({ url: `/member/activities/${id}`, method: 'get' });
export const downloadMemberTemplate = () => request({ url: '/member/template', method: 'get', responseType: 'blob' });
export const previewMemberImport = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({ url: '/member/import/preview', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } });
};
export const confirmMemberImport = (data) => request({ url: '/member/import/confirm', method: 'post', data });

// Activity
export const fetchActivities = (page=1, size=10, params={}) => request({ url: `/activity/page`, method: 'get', params: { page, size, ...params } });
export const addActivity = data => request({ url: '/activity/add', method: 'post', data });
export const updateActivity = data => request({ url: '/activity/update', method: 'put', data });
export const deleteActivity = id => request({ url: `/activity/delete/${id}`, method: 'delete' });
export const getActivityDetail = id => request({ url: `/activity/detail/${id}`, method: 'get' });
export const getActivityFullDetail = id => request({ url: `/activity/full-detail/${id}`, method: 'get' });
export const getActivityMembers = activityId => request({ url: `/activity/members/${activityId}`, method: 'get' });
export const updateActivityMembers = (activityId, data) => request({ url: `/activity/members/${activityId}`, method: 'put', data });
export const setupActivityRelations = (activityId, data) => request({ url: `/activity/setup/${activityId}`, method: 'post', data });
export const getActivityApprovers = activityId => request({ url: `/activity/approvers/${activityId}`, method: 'get' });
export const getActivityDepts = activityId => request({ url: `/activity/depts/${activityId}`, method: 'get' });
export const approveActivity = (activityId, pass, rejectReason) => request({ 
  url: `/activity/approve/${activityId}/self`, 
  method: 'put', 
  params: { pass, rejectReason } 
});

// Activity Attachment
export const uploadAttachment = (activityId, formData) => request({ 
  url: `/activity/${activityId}/attachment/upload`, 
  method: 'post', 
  data: formData, 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const getAttachmentList = activityId => request({ url: `/activity/${activityId}/attachment/list`, method: 'get' });
export const downloadAttachment = (activityId, attachmentId) => request({ 
  url: `/activity/${activityId}/attachment/${attachmentId}/download`, 
  method: 'get', 
  responseType: 'blob' 
});
export const previewAttachment = (activityId, attachmentId) => request({ 
  url: `/activity/${activityId}/attachment/${attachmentId}/preview`, 
  method: 'get', 
  responseType: 'blob' 
});
export const deleteAttachment = (activityId, attachmentId) => request({ 
  url: `/activity/${activityId}/attachment/${attachmentId}`, 
  method: 'delete' 
});
export const updateAttachment = (activityId, attachmentId, data) => request({ 
  url: `/activity/${activityId}/attachment/${attachmentId}`, 
  method: 'put', 
  data 
});

// Activity Member (Signup)
export const signupActivity = (activityId) => request({ url: `/activity-member/signup/${activityId}`, method: 'post' });
export const getActivitySignupList = (activityId) => request({ url: `/activity-member/list/${activityId}`, method: 'get' });
export const updateSignupStatus = (id, signupStatus) => request({ url: `/activity-member/signup-status/${id}`, method: 'put', params: { signupStatus } });
export const deleteSignup = (id) => request({ url: `/activity-member/${id}`, method: 'delete' });
export const checkSignupStatus = (activityId) => request({ url: `/activity-member/check/${activityId}`, method: 'get' });

// Users (for leader/approver search)
export const searchUsers = (q, role) => request({ url: '/user/search', method: 'get', params: { q, role } });


// Profile
export const getProfile = () => request({ url: '/user/profile', method: 'get' });
export const updateProfile = (data) => request({ url: '/user/profile', method: 'put', data });
export const changePassword = (data) => request({ url: '/user/password', method: 'put', data });

// Export
export const generateExportPackage = (data) => request({ url: '/export/generate', method: 'post', data });
export const getExportHistory = () => request({ url: '/export/history', method: 'get' });
export const downloadExportFile = (id) => request({ url: `/export/download/${id}`, method: 'get', responseType: 'blob' });
export const deleteExportFile = (id) => request({ url: `/export/delete/${id}`, method: 'delete' });
