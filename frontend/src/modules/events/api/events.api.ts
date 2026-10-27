import axios from '../../../core/api/axios';

// Interfaces
export interface EventStats {
  activeEvents: number;
  totalParticipants: number;
  pendingApprovals: number;
}

export interface SchoolEvent {
  _id: string;
  eventId: string;
  title: string;
  category: string;
  type: string;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  status: string;
}

export interface Competition {
  _id: string;
  eventId: string;
  name: string;
  category: string;
  type: 'INDIVIDUAL' | 'TEAM';
}

export interface EventTeam {
  _id: string;
  competitionId: string;
  name: string;
  houseId?: string;
}

export interface CompetitionScore {
  _id: string;
  competitionId: string;
  teamId?: string;
  studentId?: string;
  round: number;
  score: number;
}

// API Calls
export const getEventStats = async (): Promise<EventStats> => {
  const res = await axios.get('/events/stats');
  return res.data.data;
};

export const getEvents = async (params: any = {}): Promise<SchoolEvent[]> => {
  const res = await axios.get('/events', { params });
  return res.data.data;
};

export const createEvent = async (data: Partial<SchoolEvent>): Promise<SchoolEvent> => {
  const res = await axios.post('/events', data);
  return res.data.data;
};

export const approveEvent = async (id: string): Promise<any> => {
  const res = await axios.post(`/events/${id}/approve`);
  return res.data.data;
};

export const publishEvent = async (id: string): Promise<any> => {
  const res = await axios.post(`/events/${id}/publish`);
  return res.data.data;
};

export const registerParticipant = async (eventId: string, data: any): Promise<any> => {
  const res = await axios.post(`/events/${eventId}/register`, data);
  return res.data.data;
};

// Competition
export const createCompetition = async (eventId: string, data: Partial<Competition>): Promise<Competition> => {
  const res = await axios.post(`/events/${eventId}/competitions`, data);
  return res.data.data;
};

export const getCompetitions = async (eventId: string): Promise<Competition[]> => {
  const res = await axios.get(`/events/${eventId}/competitions`);
  return res.data.data;
};

export const registerTeam = async (competitionId: string, data: Partial<EventTeam>): Promise<EventTeam> => {
  const res = await axios.post(`/events/competitions/${competitionId}/teams`, data);
  return res.data.data;
};

export const getTeams = async (competitionId: string): Promise<EventTeam[]> => {
  const res = await axios.get(`/events/competitions/${competitionId}/teams`);
  return res.data.data;
};

export const recordScore = async (competitionId: string, data: Partial<CompetitionScore>): Promise<CompetitionScore> => {
  const res = await axios.post(`/events/competitions/${competitionId}/scores`, data);
  return res.data.data;
};

export const getScores = async (competitionId: string): Promise<CompetitionScore[]> => {
  const res = await axios.get(`/events/competitions/${competitionId}/scores`);
  return res.data.data;
};
