// @ts-nocheck
import axios from '../../../core/api/axios';

// --- CONFIGURATION ---
export const createExamType = async (data: any) => (await axios.post('/exam/types', data)).data;
export const getExamTypes = async () => (await axios.get('/exam/types')).data.data || [];
export const createExamTerm = async (data: any) => (await axios.post('/exam/terms', data)).data;
export const getExamTerms = async () => (await axios.get('/exam/terms')).data.data || [];

// --- EXAM MASTER ---
export const getDashboardStats = async () => (await axios.get('/exam/dashboard')).data.data;
export const createExam = async (data: any) => (await axios.post('/exam/master', data)).data;
export const getExams = async () => {
  const response = await axios.get('/exam/master');
  return (response.data.data || []).map((ex: any) => ({
    ...ex,
    id: ex._id || ex.id,
    examType: ex.examTypeId?.name || 'Unknown'
  }));
};

// --- SCHEDULES ---
export const scheduleExam = async (data: any) => (await axios.post('/exam/schedules', data)).data;
export const getExamSchedules = async (examId: string) => {
  if (!examId) return [];
  try {
    return (await axios.get(`/exam/schedules?examinationId=${examId}`)).data.data || [];
  } catch { return []; }
};
export const updateExamSchedule = async (scheduleId: string, data: any) => (await axios.put(`/exam/schedules/${scheduleId}`, data)).data;
export const deleteExamSchedule = async (scheduleId: string) => (await axios.delete(`/exam/schedules/${scheduleId}`)).data;

// --- LOGISTICS ---
export const addExamRoom = async (data: any) => (await axios.post('/exam/rooms', data)).data;
export const assignInvigilator = async (data: any) => (await axios.post('/exam/invigilators/assign', data)).data;
export const generateSeatingPlan = async (data: any) => (await axios.post('/exam/seating/generate', data)).data;

// --- MARKS ENTRY ---
export const getMarksEntries = async (examId: string, subjectId: string, sectionId: string, classId: string) => {
  const sheetRes = await axios.post('/exam/marks/sheet', { examinationId: examId, sectionId, subjectId, classId });
  const sheetData = sheetRes.data.data;
  const sheetId = sheetData?._id || sheetData?.id;
  if (!sheetId) return { entries: [], config: null };

  const entriesRes = await axios.get(`/exam/marks/sheet/${sheetId}/entries`);
  const entries = entriesRes.data.data || [];
  return { 
    entries: entries.map((e: any) => ({ ...e, marksSheetId: sheetId })),
    config: sheetData.subjectExamConfigId
  };
};
export const saveMarksEntries = async (sheetId: string, entries: any[]) => (await axios.post(`/exam/marks/sheet/${sheetId}/save`, { marksData: entries })).status === 200;
export const lockMarksSheet = async (sheetId: string) => (await axios.post(`/exam/marks/sheet/${sheetId}/lock`)).data;

// --- RESULTS ---
export const calculateResults = async (examinationId: string) => (await axios.post(`/exam/results/${examinationId}/calculate`)).data;
export const lockResults = async (examId: string) => (await axios.post(`/exam/results/${examId}/lock`)).data;
export const publishResults = async (examinationId: string) => (await axios.post(`/exam/results/${examinationId}/publish`)).data;
export const getMyResults = async () => (await axios.get('/exam/results/my-results')).data.data || [];
export const getChildResults = async (studentId: string) => (await axios.get(`/exam/results/children/${studentId}`)).data.data || [];

// --- REPORT CARDS & PROMOTIONS ---
export const generateReportCards = async (data: { examinationId: string, classId: string }) => (await axios.post('/exam/report-cards/generate', data)).data;
export const processPromotions = async (examinationId: string) => (await axios.post(`/exam/promotions/${examinationId}/process`)).data;

// --- QUESTION BANK ---
export const createQuestionBank = async (data: any) => (await axios.post('/exam/question-bank', data)).data;
export const getQuestionBanks = async () => (await axios.get('/exam/question-bank')).data.data || [];
export const addQuestion = async (bankId: string, data: any) => (await axios.post(`/exam/question-bank/${bankId}/questions`, data)).data;
export const generatePaper = async (data: any) => (await axios.post('/exam/question-papers/generate', data)).data;

// --- ADVANCED ASSESSMENTS ---
export const submitRevaluation = async (data: any) => (await axios.post('/exam/revaluation', data)).data;
export const processRevaluation = async (id: string, data: any) => (await axios.put(`/exam/revaluation/${id}`, data)).data;
export const createSupplementaryExam = async (data: any) => (await axios.post('/exam/supplementary', data)).data;

// Stubs for GradeSystems and Subjects if they don't have exact dedicated exam routes yet
export const getGradeSystems = async () => (await axios.get('/exam/grade-systems')).data.data || [];
export const createGradeSystem = async (data: any) => (await axios.post('/exam/grade-systems', data)).data;
export const getSubjectConfigs = async (examId: string): Promise<SubjectExamConfig[]> => [];
export const getStudentResults = async (filters: any): Promise<StudentResult[]> => {
  const q = new URLSearchParams(filters).toString();
  try {
    const res = await axios.get(`/exam/results?${q}`);
    return res.data?.data || [];
  } catch {
    return [];
  }
};

export interface ExaminationMaster {
  id: string;
  name: string;
  code: string;
  examType: string;
  startDate: string;
  endDate: string;
  status: string;
  academicYearId?: { name: string; id: string };
}

export interface GradeSystem {
  id: string;
  name: string;
  rules: any[];
}

export interface ComponentConfig {
  componentName: string;
  maxMarks: number;
  weightagePercent: number;
}

export interface SubjectExamConfig {
  id: string;
  subjectId: string;
  subjectName: string;
  components: ComponentConfig[];
  totalMaxMarks: number;
  totalPassMarks: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  examinationId: string;
  className: string;
  sectionName: string;
  status: string;
  totalObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  isOverallPassed: boolean;
  subjectResults?: { subjectName: string; marksObtained: number; maxMarks: number; grade: string }[];
}
