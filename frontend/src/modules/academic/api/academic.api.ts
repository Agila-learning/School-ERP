import axios from '../../../core/api/axios';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface ClassSummary {
  id: string;
  name: string;
  code: string;
  level: number;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalSections: number;
  totalStudents: number;
}

export interface SectionSummary {
  id: string;
  name: string;
  code: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  classTeacher?: string;
  enrolledStudents: number;
}

export interface SubjectSummary {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  category: string;
  creditHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TeacherAssignmentSummary {
  id: string;
  teacherName: string;
  subjectName: string;
  className: string;
  sectionName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface EnrollmentSummary {
  id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    rollNumber?: string;
  };
  academicYearId: string;
  classId: string;
  sectionId: string;
  status: string;
}

export interface CurriculumSummary {
  id: string;
  name: string;
  classId: string;
  subjectId: string;
  weeklyPeriods: number;
  status: string;
}

export interface ClassTeacherAssignmentSummary {
  id: string;
  teacherId: string;
  sectionId: string;
  isPrimary: boolean;
  status: string;
}

export interface AcademicDashboardStats {
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
  enrolledStudents: number;
  classCapacityData?: { name: string; utilized: number; available: number }[];
  studentDistribution?: { name: string; value: number }[];
}

export const getDashboardStats = async (): Promise<AcademicDashboardStats> => {
  const response = await axios.get('/academic/dashboard-stats');
  return response.data.data;
};

export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  const response = await axios.get('/academic/academic-years');
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createAcademicYear = async (data: any): Promise<AcademicYear> => {
  const response = await axios.post('/academic/academic-years', data);
  return response.data.data;
};

export const activateAcademicYear = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.put(`/academic/academic-years/${id}`, { status: 'ACTIVE' });
  return { success: response.status === 200 };
};

export const deleteAcademicYear = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/academic-years/${id}`);
  return { success: response.status === 200 };
};

export const getBranches = async (params: any = {}) => {
  const response = await axios.get('/organization/branches', { params });
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const getClasses = async (): Promise<ClassSummary[]> => {
  const response = await axios.get('/academic/classes');
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createClass = async (data: any): Promise<ClassSummary> => {
  const response = await axios.post('/academic/classes', data);
  return response.data.data;
};

export const updateClass = async (id: string, data: any): Promise<ClassSummary> => {
  const response = await axios.put(`/academic/classes/${id}`, data);
  return response.data.data;
};

export const deleteClass = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/classes/${id}`);
  return { success: response.status === 200 };
};

export const getSections = async (classId?: string): Promise<SectionSummary[]> => {
  const url = classId ? `/academic/sections?classId=${classId}` : '/academic/sections';
  const response = await axios.get(url);
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createSection = async (data: any): Promise<SectionSummary> => {
  const response = await axios.post('/academic/sections', data);
  return response.data.data;
};

export const updateSection = async (id: string, data: any): Promise<SectionSummary> => {
  const response = await axios.put(`/academic/sections/${id}`, data);
  return response.data.data;
};

export const deleteSection = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/sections/${id}`);
  return { success: response.status === 200 };
};

export const getSubjects = async (): Promise<SubjectSummary[]> => {
  const response = await axios.get('/academic/subjects');
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createSubject = async (data: any): Promise<SubjectSummary> => {
  const response = await axios.post('/academic/subjects', data);
  return response.data.data;
};

export const deleteSubject = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/subjects/${id}`);
  return { success: response.status === 200 };
};

export const getTeacherAssignments = async (): Promise<TeacherAssignmentSummary[]> => {
  const response = await axios.get('/academic/teacher-assignments');
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const assignTeacher = async (data: any): Promise<TeacherAssignmentSummary> => {
  const response = await axios.post('/academic/teacher-assignments', data);
  return response.data.data;
};

export const removeTeacherAssignment = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/teacher-assignments/${id}`);
  return { success: response.status === 200 };
};



export const getEnrollments = async (academicYearId: string, sectionId?: string): Promise<EnrollmentSummary[]> => {
  const params: any = { academicYearId };
  if (sectionId) params.sectionId = sectionId;
  const response = await axios.get('/academic/enrollments', { params });
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const getCurriculums = async (classId?: string): Promise<CurriculumSummary[]> => {
  const params = classId ? { classId } : {};
  const response = await axios.get('/academic/curriculums', { params });
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createCurriculum = async (data: any): Promise<CurriculumSummary> => {
  const response = await axios.post('/academic/curriculums', data);
  return response.data.data;
};

export const deleteCurriculum = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/curriculums/${id}`);
  return { success: response.status === 200 };
};

export const getClassTeacherAssignments = async (sectionId?: string): Promise<ClassTeacherAssignmentSummary[]> => {
  const params = sectionId ? { sectionId } : {};
  const response = await axios.get('/academic/class-teacher-assignments', { params });
  const d = response.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const assignClassTeacher = async (data: any): Promise<ClassTeacherAssignmentSummary> => {
  const response = await axios.post('/academic/class-teacher-assignments', data);
  return response.data.data;
};

export const removeClassTeacherAssignment = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/class-teacher-assignments/${id}`);
  return { success: response.status === 200 };
};

export const bulkPromote = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/enrollments/bulk-promote', data);
  return response.data.data;
};

// --- Terms ---
export const getTerms = async (): Promise<any[]> => {
  const response = await axios.get('/academic/terms');
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const createTerm = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/terms', data);
  return response.data.data;
};
export const updateTerm = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/terms/${id}`, data);
  return response.data.data;
};
export const deleteTerm = async (id: string): Promise<any> => {
  const response = await axios.delete(`/academic/terms/${id}`);
  return { success: response.status === 200 };
};

// --- Subject Groups ---
export const getSubjectGroups = async (): Promise<any[]> => {
  const response = await axios.get('/academic/subject-groups');
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const createSubjectGroup = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/subject-groups', data);
  return response.data.data;
};
export const updateSubjectGroup = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/subject-groups/${id}`, data);
  return response.data.data;
};
export const deleteSubjectGroup = async (id: string): Promise<any> => {
  const response = await axios.delete(`/academic/subject-groups/${id}`);
  return { success: response.status === 200 };
};

// --- Syllabus ---
export const getSyllabuses = async (): Promise<any[]> => {
  const response = await axios.get('/academic/syllabuses');
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const createSyllabus = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/syllabuses', data);
  return response.data.data;
};
export const updateSyllabus = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/syllabuses/${id}`, data);
  return response.data.data;
};
export const deleteSyllabus = async (id: string): Promise<any> => {
  const response = await axios.delete(`/academic/syllabuses/${id}`);
  return { success: response.status === 200 };
};

// --- Classroom Allocations ---
export const getClassroomAllocations = async (): Promise<any[]> => {
  const response = await axios.get('/academic/classroom-allocations');
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const createClassroomAllocation = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/classroom-allocations', data);
  return response.data.data;
};
export const updateClassroomAllocation = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/classroom-allocations/${id}`, data);
  return response.data.data;
};
export const deleteClassroomAllocation = async (id: string): Promise<any> => {
  const response = await axios.delete(`/academic/classroom-allocations/${id}`);
  return { success: response.status === 200 };
};

// --- Academic Events ---
export const getAcademicEvents = async (): Promise<any[]> => {
  const response = await axios.get('/academic/events');
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const createAcademicEvent = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/events', data);
  return response.data.data;
};
export const updateAcademicEvent = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/events/${id}`, data);
  return response.data.data;
};
export const deleteAcademicEvent = async (id: string): Promise<any> => {
  const response = await axios.delete(`/academic/events/${id}`);
  return { success: response.status === 200 };
};

// --- Homework Submissions ---
export const submitHomework = async (id: string, data: any): Promise<any> => {
  const response = await axios.post(`/academic/assignments/${id}/submit`, data);
  return response.data.data;
};

export const getHomeworkSubmissions = async (id: string): Promise<any[]> => {
  const response = await axios.get(`/academic/assignments/${id}/submissions`);
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const getMySubmissions = async (): Promise<any[]> => {
  const response = await axios.get(`/academic/submissions/my`);
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const getHomeworks = async (): Promise<any[]> => {
  const response = await axios.get(`/academic/assignments`);
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const createHomework = async (data: any): Promise<any> => {
  const response = await axios.post(`/academic/assignments`, data);
  return response.data.data;
};

export const updateHomework = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/assignments/${id}`, data);
  return response.data.data;
};

export const deleteHomework = async (id: string): Promise<any> => {
  const response = await axios.delete(`/academic/assignments/${id}`);
  return response.data;
};

export const gradeHomework = async (submissionId: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/submissions/${submissionId}/evaluate`, data);
  return response.data.data;
};

// --- Lesson Plans ---
export const getLessonPlans = async (params?: any): Promise<any[]> => {
  const response = await axios.get('/academic/lesson-plans', { params });
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const getLessonPlanById = async (id: string): Promise<any> => {
  const response = await axios.get(`/academic/lesson-plans/${id}`);
  return response.data.data;
};

export const createLessonPlan = async (data: any): Promise<any> => {
  const response = await axios.post('/academic/lesson-plans', data);
  return response.data.data;
};

export const updateLessonPlan = async (id: string, data: any): Promise<any> => {
  const response = await axios.put(`/academic/lesson-plans/${id}`, data);
  return response.data.data;
};

export const deleteLessonPlan = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/academic/lesson-plans/${id}`);
  return { success: response.status === 200 };
};


