import api from '../../../core/api/axios';

// Dashboards
export const getTeacherLMSDashboard = () => api.get('/academic/lms/teacher/dashboard');
export const getStudentLMSDashboard = () => api.get('/academic/lms/student/dashboard');
export const getAdminLMSDashboard = () => api.get('/academic/lms/admin/dashboard');

// Assignments
export const getAssignments = (params?: any) => api.get('/academic/assignments', { params });
export const getAssignmentById = (id: string) => api.get(`/academic/assignments/${id}`);
export const createAssignment = (data: any) => api.post('/academic/assignments', data);
export const updateAssignment = (id: string, data: any) => api.put(`/academic/assignments/${id}`, data);
export const deleteAssignment = (id: string) => api.delete(`/academic/assignments/${id}`);

// Submissions
export const submitAssignment = (assignmentId: string, data: any) => api.post(`/academic/assignments/${assignmentId}/submit`, data);
export const getSubmissionsByAssignment = (assignmentId: string) => api.get(`/academic/assignments/${assignmentId}/submissions`);
export const evaluateSubmission = (submissionId: string, data: any) => api.put(`/academic/submissions/${submissionId}/evaluate`, data);

// Learning Materials
export const getLearningMaterials = (params?: any) => api.get('/academic/learning-materials', { params });
export const createLearningMaterial = (data: any) => api.post('/academic/learning-materials', data);
export const deleteLearningMaterial = (id: string) => api.delete(`/academic/learning-materials/${id}`);
