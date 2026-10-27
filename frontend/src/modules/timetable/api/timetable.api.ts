export interface Room {
  id: string;
  code: string;
  name: string;
  type: 'Classroom' | 'Laboratory' | 'Library' | 'Auditorium' | 'Playground' | 'Other';
  capacity: number;
  floor?: number;
  status: 'active' | 'inactive';
}

export interface PeriodDefinition {
  id: string;
  name: string;
  number: number;
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '09:45'
  durationMinutes: number;
  isBreak: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TimetableVersion {
  id: string;
  name: string;
  versionNumber: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  constraints: {
    workingDays: string[];
    maxPeriodsPerDay: number;
  };
}

export interface TimetableEntry {
  id: string;
  versionId: string;
  classId: string;
  className?: string; // Hydrated for UI
  sectionId: string;
  sectionName?: string; // Hydrated for UI
  subjectId?: string;
  subjectName?: string; // Hydrated for UI
  teacherEmployeeId?: string;
  teacherName?: string; // Hydrated for UI
  periodDefinitionId: string;
  roomId?: string;
  roomName?: string; // Hydrated for UI
  day: string;
  slotType?: 'ACADEMIC' | 'LEISURE' | 'LIBRARY' | 'SPORTS' | 'BREAK' | 'ASSEMBLY' | 'REMEDIAL' | 'ACTIVITY';
  customTitle?: string;
  isDoublePeriod: boolean;
  status: 'ACTIVE' | 'CANCELLED' | 'SUBSTITUTED';
}

export interface TimetableConflict {
  id: string;
  versionId: string;
  conflictType: 'TEACHER_DOUBLE_BOOKING' | 'ROOM_DOUBLE_BOOKING' | 'CLASS_DOUBLE_BOOKING' | 'CAPACITY_EXCEEDED';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
  isResolved: boolean;
  relatedEntryIds: string[];
}

import api from '../../../core/api/axios';

// --- API Calls ---

export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get('/organization/rooms');
  const resData = response.data.data;
  return Array.isArray(resData) ? resData : (resData?.data || []);
};

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const response = await api.post('/organization/rooms', data);
  return response.data.data;
};

export const getPeriods = async (): Promise<PeriodDefinition[]> => {
  const response = await api.get('/academic/period-definitions');
  const resData = response.data.data;
  return Array.isArray(resData) ? resData : (resData?.data || []);
};

export const createPeriod = async (data: Partial<PeriodDefinition>): Promise<PeriodDefinition> => {
  const response = await api.post('/academic/period-definitions', data);
  return response.data.data;
};

export const getTimetableVersions = async (academicYearId?: string): Promise<TimetableVersion[]> => {
  const response = await api.get('/timetable/versions', { params: { academicYearId } });
  const resData = response.data.data;
  const list = Array.isArray(resData) ? resData : (resData?.data || []);
  return list.map((v: any) => ({
    ...v,
    id: v.id || v._id
  }));
};

export const getTimetableEntries = async (versionId: string, filters?: any): Promise<TimetableEntry[]> => {
  const response = await api.get(`/timetable/entries`, { params: { ...filters, versionId } });
  const resData = response.data.data;
  return Array.isArray(resData) ? resData : (resData?.data || []);
};

export const getConflicts = async (versionId: string): Promise<TimetableConflict[]> => {
  const response = await api.get(`/timetable/conflicts/${versionId}`);
  const resData = response.data.data;
  return Array.isArray(resData) ? resData : (resData?.data || []);
};

export const createTimetableVersion = async (data: any): Promise<TimetableVersion> => {
  const response = await api.post('/timetable/versions', data);
  return response.data.data;
};

export const updateTimetableVersion = async (versionId: string, data: any): Promise<TimetableVersion> => {
  const response = await api.put(`/timetable/versions/${versionId}`, data);
  return response.data.data;
};

export const deleteTimetableVersion = async (versionId: string): Promise<void> => {
  await api.delete(`/timetable/versions/${versionId}`);
};

export const publishTimetableVersion = async (versionId: string): Promise<TimetableVersion> => {
  const response = await api.patch(`/timetable/versions/${versionId}/publish`);
  return response.data.data;
};

export const upsertTimetableEntry = async (data: any, entryId?: string): Promise<{ entry: TimetableEntry, warnings: TimetableConflict[] }> => {
  if (entryId) {
    const response = await api.put(`/timetable/entries/${entryId}`, data);
    return response.data.data;
  } else {
    const response = await api.post('/timetable/entries', data);
    return response.data.data;
  }
};

export const deleteTimetableEntry = async (entryId: string): Promise<void> => {
  await api.delete(`/timetable/entries/${entryId}`);
};

export const getTimetableDashboardStats = async (versionId: string): Promise<any> => {
  const response = await api.get(`/timetable/stats/${versionId}`);
  return response.data.data;
};

export const getClassTimetable = async (sectionId: string, academicYearId?: string): Promise<TimetableEntry[]> => {
  const response = await api.get('/timetable/class', { params: { sectionId, academicYearId } });
  return response.data.data;
};

export const getTeacherTimetable = async (employeeId: string, academicYearId?: string): Promise<{ entries: TimetableEntry[], workload: any }> => {
  const response = await api.get(`/timetable/teacher/${employeeId}`, { params: { academicYearId } });
  return response.data.data;
};
